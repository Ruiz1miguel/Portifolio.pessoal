"""API Flask + MySQL do portfólio (equivalente ao CRUD PHP das apostilas)."""
import os
import re
import hmac
from urllib.parse import urlparse
import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024
origens = [x.strip().rstrip('/') for x in os.environ.get('ALLOWED_ORIGINS', '').split(',') if x.strip()]
CORS(app, resources={r'/api/*': {'origins': origens}}, allow_headers=['Content-Type', 'X-Admin-Key'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])


def conectar():
    return pymysql.connect(host=os.environ['DB_HOST'], port=int(os.environ.get('DB_PORT', '3306')),
        user=os.environ['DB_USER'], password=os.environ['DB_PASSWORD'], database=os.environ['DB_NAME'],
        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, connect_timeout=10,
        ssl={'ssl': {}} if os.environ.get('DB_SSL', 'false').lower() == 'true' else None)


def consultar(sql, parametros=()):
    con = conectar()
    try:
        with con.cursor() as cursor:
            cursor.execute(sql, parametros)
            return cursor.fetchall()
    finally:
        con.close()


def executar(sql, parametros=()):
    con = conectar()
    try:
        with con.cursor() as cursor:
            cursor.execute(sql, parametros)
            identificador, linhas = cursor.lastrowid, cursor.rowcount
        con.commit()
        return identificador, linhas
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def autorizar_admin():
    chave = os.environ.get('ADMIN_API_KEY', '')
    # Modo demonstração SEM chave: somente acesso direto do próprio computador.
    if not chave:
        if os.environ.get('ADMIN_MODE') == 'local' and request.remote_addr in ('127.0.0.1', '::1'):
            return None
        return jsonify(erro='Configure ADMIN_API_KEY no servidor para habilitar o CRUD.'), 403
    if not hmac.compare_digest(request.headers.get('X-Admin-Key', ''), chave):
        return jsonify(erro='Chave administrativa necessária ou incorreta.'), 401
    return None


@app.get('/api/health')
def health():
    return jsonify(status='online')


@app.get('/api/projetos')
def listar_projetos():
    return jsonify(consultar('SELECT id, titulo, descricao, tecnologias, link_git FROM projetos ORDER BY id DESC'))


def validar_projeto(d):
    titulo = str(d.get('titulo', '')).strip()
    descricao = str(d.get('descricao', '')).strip()
    tecnologias = str(d.get('tecnologias', '')).strip()
    link = str(d.get('link_git', '')).strip()
    if not titulo or not descricao or not tecnologias or len(titulo) > 160 or len(descricao) > 5000 or len(tecnologias) > 500:
        return None
    if len(link) > 1000 or (link and (urlparse(link).scheme != 'https' or not urlparse(link).netloc)):
        return None
    return titulo, descricao, tecnologias, link


@app.post('/api/projetos')
def cadastrar_projeto():
    erro = autorizar_admin()
    if erro: return erro
    dados = validar_projeto(request.get_json(silent=True) or {})
    if not dados: return jsonify(erro='Preencha corretamente os dados do projeto.'), 400
    ident, _ = executar('INSERT INTO projetos (titulo, descricao, tecnologias, link_git) VALUES (%s,%s,%s,%s)', dados)
    return jsonify(id=ident, mensagem='Projeto cadastrado.'), 201


@app.put('/api/projetos/<int:ident>')
def atualizar_projeto(ident):
    erro = autorizar_admin()
    if erro: return erro
    dados = validar_projeto(request.get_json(silent=True) or {})
    if not dados: return jsonify(erro='Dados inválidos.'), 400
    _, linhas = executar('UPDATE projetos SET titulo=%s, descricao=%s, tecnologias=%s, link_git=%s WHERE id=%s', (*dados, ident))
    return jsonify(mensagem='Projeto atualizado.' if linhas else 'Nenhuma linha alterada.')


@app.delete('/api/projetos/<int:ident>')
def apagar_projeto(ident):
    erro = autorizar_admin()
    if erro: return erro
    _, linhas = executar('DELETE FROM projetos WHERE id=%s', (ident,))
    return jsonify(mensagem='Projeto excluído.', removidos=linhas)


@app.post('/api/mensagens')
def enviar_mensagem():
    d = request.get_json(silent=True) or {}
    nome, email, texto = (str(d.get(k, '')).strip() for k in ('nome', 'email', 'texto'))
    if not nome or len(nome) > 120 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or len(email) > 254 or not texto or len(texto) > 3000:
        return jsonify(erro='Preencha corretamente o formulário.'), 400
    executar('INSERT INTO mensagens (nome, email, texto) VALUES (%s,%s,%s)', (nome, email, texto))
    return jsonify(mensagem='Mensagem enviada.'), 201


@app.get('/api/mensagens')
def listar_mensagens():
    erro = autorizar_admin()
    if erro: return erro
    linhas = consultar('SELECT id, nome, email, texto, data_envio FROM mensagens ORDER BY data_envio DESC')
    for linha in linhas:
        linha['data_envio'] = linha['data_envio'].isoformat() if linha['data_envio'] else None
    return jsonify(linhas)


@app.delete('/api/mensagens/<int:ident>')
def apagar_mensagem(ident):
    erro = autorizar_admin()
    if erro: return erro
    _, linhas = executar('DELETE FROM mensagens WHERE id=%s', (ident,))
    return jsonify(mensagem='Mensagem excluída.', removidos=linhas)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.environ.get('PORT', '5000')), debug=False)
