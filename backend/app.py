import os
import re
from functools import wraps
from urllib.parse import urlparse

import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import check_password_hash

app = Flask(__name__)
# Ex.: https://usuario.github.io e http://localhost:5500 (origens sem barra final).
origens = [x.strip().rstrip('/') for x in os.environ.get('ALLOWED_ORIGINS', '').split(',') if x.strip()]
CORS(app, resources={r'/api/*': {'origins': origens}}, allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

def conectar():
    return pymysql.connect(host=os.environ['DB_HOST'], port=int(os.environ.get('DB_PORT', '3306')),
        user=os.environ['DB_USER'], password=os.environ['DB_PASSWORD'], database=os.environ['DB_NAME'],
        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, connect_timeout=10,
        ssl={'ssl': {}} if os.environ.get('DB_SSL', 'false').lower() == 'true' else None)

def consultar(sql, parametros=(), um=False):
    con = conectar()
    try:
        with con.cursor() as cursor:
            cursor.execute(sql, parametros)
            resultado = cursor.fetchone() if um else cursor.fetchall()
        return resultado
    finally: con.close()

def executar(sql, parametros=()):
    con = conectar()
    try:
        with con.cursor() as cursor:
            cursor.execute(sql, parametros)
            ident = cursor.lastrowid
            linhas = cursor.rowcount
        con.commit()
        return ident, linhas
    except Exception:
        con.rollback()
        raise
    finally: con.close()

def serializer(): return URLSafeTimedSerializer(os.environ['SECRET_KEY'], salt='portfolio-admin')

def protegido(func):
    @wraps(func)
    def interno(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '): return jsonify(erro='Login necessário.'), 401
        try: dados = serializer().loads(auth[7:], max_age=3600)
        except (BadSignature, SignatureExpired): return jsonify(erro='Sessão inválida ou expirada. Entre novamente.'), 401
        if dados.get('role') != 'admin': return jsonify(erro='Sem permissão.'), 403
        return func(*args, **kwargs)
    return interno

@app.get('/api/health')
def health(): return jsonify(status='online')

@app.post('/api/login')
def login():
    dados = request.get_json(silent=True) or {}
    email = str(dados.get('email', '')).strip().lower()
    senha = str(dados.get('senha', ''))
    if (not os.environ.get('ADMIN_EMAIL') or not os.environ.get('ADMIN_PASSWORD_HASH')
        or email != os.environ['ADMIN_EMAIL'].strip().lower()
        or not check_password_hash(os.environ['ADMIN_PASSWORD_HASH'], senha)):
        return jsonify(erro='E-mail ou senha incorretos.'), 401
    return jsonify(token=serializer().dumps({'role': 'admin'}))

@app.get('/api/verificar')
@protegido
def verificar(): return jsonify(admin=True)

@app.get('/api/projetos')
def projetos():
    return jsonify(consultar('SELECT id, titulo, descricao, tecnologias, link_git FROM projetos ORDER BY id DESC'))

def validar_projeto(d):
    titulo = str(d.get('titulo', '')).strip()
    descricao = str(d.get('descricao', '')).strip()
    tecnologias = str(d.get('tecnologias', '')).strip()
    link = str(d.get('link_git', '')).strip()
    if not titulo or not descricao or not tecnologias or len(titulo)>160 or len(descricao)>5000 or len(tecnologias)>500:
        return None
    if len(link)>1000 or (link and (urlparse(link).scheme != 'https' or not urlparse(link).netloc)):
        return None
    return (titulo, descricao, tecnologias, link)

@app.post('/api/projetos')
@protegido
def criar_projeto():
    dados = validar_projeto(request.get_json(silent=True) or {})
    if not dados: return jsonify(erro='Dados do projeto inválidos.'), 400
    ident, _ = executar('INSERT INTO projetos (titulo, descricao, tecnologias, link_git) VALUES (%s,%s,%s,%s)', dados)
    return jsonify(id=ident, mensagem='Projeto criado.'), 201

@app.put('/api/projetos/<int:ident>')
@protegido
def editar_projeto(ident):
    dados = validar_projeto(request.get_json(silent=True) or {})
    if not dados: return jsonify(erro='Dados do projeto inválidos.'), 400
    _, linhas = executar('UPDATE projetos SET titulo=%s, descricao=%s, tecnologias=%s, link_git=%s WHERE id=%s', (*dados, ident))
    return jsonify(mensagem='Projeto atualizado.' if linhas else 'Nenhuma alteração realizada.')

@app.delete('/api/projetos/<int:ident>')
@protegido
def excluir_projeto(ident):
    _, linhas = executar('DELETE FROM projetos WHERE id=%s', (ident,))
    return jsonify(mensagem='Projeto excluído.', removidos=linhas)

@app.post('/api/mensagens')
def criar_mensagem():
    d = request.get_json(silent=True) or {}
    nome = str(d.get('nome', '')).strip()
    email = str(d.get('email', '')).strip()
    texto = str(d.get('texto', '')).strip()
    if not nome or len(nome)>120 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or len(email)>254 or not texto or len(texto)>3000:
        return jsonify(erro='Preencha corretamente os campos.'), 400
    executar('INSERT INTO mensagens (nome, email, texto) VALUES (%s,%s,%s)', (nome,email,texto))
    return jsonify(mensagem='Mensagem enviada.'), 201

@app.get('/api/mensagens')
@protegido
def mensagens():
    linhas = consultar('SELECT id, nome, email, texto, data_envio FROM mensagens ORDER BY data_envio DESC')
    for linha in linhas: linha['data_envio'] = linha['data_envio'].isoformat() if linha['data_envio'] else None
    return jsonify(linhas)

@app.delete('/api/mensagens/<int:ident>')
@protegido
def excluir_mensagem(ident):
    _, linhas = executar('DELETE FROM mensagens WHERE id=%s', (ident,))
    return jsonify(mensagem='Mensagem excluída.', removidos=linhas)

@app.errorhandler(413)
def muito_grande(e): return jsonify(erro='Requisição muito grande.'), 413
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.environ.get('PORT', '5000')), debug=False)
