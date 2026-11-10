import os
import sqlite3
import secrets
from functools import wraps
from pathlib import Path
from urllib.parse import urlparse
from flask import Flask, request, redirect, session, abort, jsonify, render_template_string, send_from_directory
from markupsafe import escape

BASE = Path(__file__).resolve().parent
DB = Path(os.environ.get("DATABASE_PATH", str(BASE / "instance" / "portfolio.db")))
DB.parent.mkdir(parents=True, exist_ok=True)
app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")

def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def init_db():
    with conn() as c:
        c.execute("CREATE TABLE IF NOT EXISTS projetos (id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT, tecnologias TEXT, link_git TEXT NOT NULL, data_criacao TEXT DEFAULT CURRENT_TIMESTAMP)")
        c.execute("CREATE TABLE IF NOT EXISTS mensagens (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT, texto TEXT, data_envio TEXT DEFAULT CURRENT_TIMESTAMP)")
init_db()

@app.get("/")
def home(): return send_from_directory(BASE, "index.html")

@app.get("/pages/<path:filename>")
def pages(filename):
    if filename not in {"sobre.html", "projetos.html", "contato.html", "detalhes.html", "mensagem-enviada.html"}: abort(404)
    return send_from_directory(BASE / "pages", filename)

@app.get("/<folder>/<path:filename>")
def assets(folder, filename):
    if folder not in {"css", "js", "img"}: abort(404)
    return send_from_directory(BASE / folder, filename)

@app.get("/api/projetos")
def api_projetos():
    with conn() as c:
        return jsonify([dict(r) for r in c.execute("SELECT * FROM projetos ORDER BY id DESC")])

@app.post("/contato/enviar")
def enviar():
    nome = request.form.get("nome", "").strip()[:100]
    email = request.form.get("email", "").strip()[:100]
    texto = request.form.get("texto", "").strip()[:5000]
    if not nome or not texto or not email or "@" not in email: return "Preencha nome, e-mail e mensagem corretamente.", 400
    with conn() as c:
        c.execute("INSERT INTO mensagens (nome,email,texto) VALUES (?,?,?)", (nome,email,texto))
    return redirect("/pages/mensagem-enviada.html", code=303)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("admin"): return redirect("/login")
        return fn(*args, **kwargs)
    return wrapper

STYLE = """<style>body{font:16px system-ui;max-width:1000px;margin:35px auto;padding:0 16px;background:#f5f7fb;color:#17213a}a{color:#2459b8}nav{display:flex;gap:20px;flex-wrap:wrap;margin:20px 0}table{border-collapse:collapse;width:100%;background:white}td,th{padding:10px;border:1px solid #ddd;text-align:left;overflow-wrap:anywhere}input,textarea,select{display:block;padding:9px;margin:8px 0 15px;max-width:100%;width:400px;box-sizing:border-box}button{padding:10px 16px;cursor:pointer}textarea{height:120px}main{overflow-x:auto}</style>"""

def page(title, body, **context):
    return render_template_string('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{title}}</title>'+STYLE+'<nav><a href="/">Portfólio</a>{% if session.get("admin") %}<a href="/admin">Painel</a><a href="/logout">Sair</a>{% endif %}</nav><main><h1>{{title}}</h1>'+body+'</main></html>',title=title,**context)

@app.route("/login",methods=["GET","POST"])
def login():
    password=os.environ.get("ADMIN_PASSWORD", "")
    if not password: return "Configure ADMIN_PASSWORD no servidor para ativar o painel.",503
    erro=""
    if request.method=="POST":
        if secrets.compare_digest(request.form.get("senha",""),password):
            session.clear();session["admin"]=True;return redirect("/admin")
        erro="Senha incorreta."
    return page("Acesso administrativo",'<p>{{erro}}</p><form method="post"><label>Senha administrativa<input type="password" name="senha" required></label><button>Entrar</button></form>',erro=erro)

@app.get("/logout")
def logout(): session.clear();return redirect("/")

def tabela_atual():
    t=request.values.get("tabela","projetos")
    if t not in ("projetos","mensagens"): abort(400)
    return t

@app.get("/admin")
@admin_required
def admin():
    t=tabela_atual()
    with conn() as c:
        rows=[dict(r) for r in c.execute("SELECT * FROM "+t+" ORDER BY id DESC")]
    body="""<p><a href="/admin?tabela=projetos">Projetos</a> | <a href="/admin?tabela=mensagens">Mensagens privadas</a></p>{% if tabela == "projetos" %}<p><a href="/admin/novo?tabela=projetos">+ Novo projeto</a></p>{% endif %}<table><tr>{% for coluna in colunas %}<th>{{coluna}}</th>{% endfor %}<th>Ações</th></tr>{% for row in rows %}<tr>{% for coluna in colunas %}<td>{% if coluna == "link_git" %}<a href="{{row[coluna]}}" target="_blank" rel="noopener noreferrer">GitHub</a>{% else %}{{row[coluna]}}{% endif %}</td>{% endfor %}<td>{% if tabela == "projetos" %}<a href="/admin/editar/{{row.id}}">Editar</a>{% endif %}<form method="post" action="/admin/excluir/{{row.id}}" onsubmit="return confirm('Excluir registro?')"><input type="hidden" name="tabela" value="{{tabela}}"><button>Excluir</button></form></td></tr>{% endfor %}</table>"""
    cols=["titulo","descricao","tecnologias","link_git"] if t=="projetos" else ["nome","email","texto","data_envio"]
    return page("Gerenciar "+t,body,tabela=t,rows=rows,colunas=cols)

def valid_git(url):
    u=urlparse(url)
    return u.scheme=="https" and u.hostname in ("github.com","www.github.com")

FORM="""<form method="post"><label>Título<input name="titulo" maxlength="120" value="{{dados.titulo}}" required></label><label>Descrição<textarea name="descricao">{{dados.descricao}}</textarea></label><label>Tecnologias<input name="tecnologias" maxlength="200" value="{{dados.tecnologias}}"></label><label>Link do GitHub<input type="url" name="link_git" maxlength="255" value="{{dados.link_git}}" required></label><p>{{erro}}</p><button>Salvar</button></form>"""

@app.route("/admin/novo",methods=["GET","POST"])
@admin_required
def novo():
    dados={"titulo":"","descricao":"","tecnologias":"","link_git":""};erro=""
    if request.method=="POST":
        dados={k:request.form.get(k,"").strip() for k in dados}
        if not dados["titulo"] or not valid_git(dados["link_git"]): erro="Informe título e link HTTPS válido do GitHub."
        else:
            with conn() as c: c.execute("INSERT INTO projetos(titulo,descricao,tecnologias,link_git) VALUES(?,?,?,?)",tuple(dados.values()))
            return redirect("/admin")
    return page("Novo projeto",FORM,dados=dados,erro=erro)

@app.route("/admin/editar/<int:id>",methods=["GET","POST"])
@admin_required
def editar(id):
    with conn() as c:
        r=c.execute("SELECT * FROM projetos WHERE id=?",(id,)).fetchone()
    if r is None: abort(404)
    dados={k:r[k] or "" for k in ("titulo","descricao","tecnologias","link_git")};erro=""
    if request.method=="POST":
        dados={k:request.form.get(k,"").strip() for k in dados}
        if not dados["titulo"] or not valid_git(dados["link_git"]): erro="Informe título e link HTTPS válido do GitHub."
        else:
            with conn() as c: c.execute("UPDATE projetos SET titulo=?,descricao=?,tecnologias=?,link_git=? WHERE id=?",(*dados.values(),id))
            return redirect("/admin")
    return page("Editar projeto",FORM,dados=dados,erro=erro)

@app.post("/admin/excluir/<int:id>")
@admin_required
def excluir(id):
    t=tabela_atual()
    with conn() as c: c.execute("DELETE FROM "+t+" WHERE id=?",(id,))
    return redirect("/admin?tabela="+t)

if __name__=="__main__":
    app.run(debug=False)
