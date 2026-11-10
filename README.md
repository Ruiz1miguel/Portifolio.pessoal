# Portfólio com Python e Flask

Conversão do projeto PHP original. Preserva HTML, CSS, imagens, JS e funcionalidades de projetos/contato. Banco de dados SQLite.

## Executar localmente

1. Instale Python 3.10+.
2. Abra o terminal na pasta do projeto e execute `pip install -r requirements.txt`.
3. Defina as variáveis `ADMIN_PASSWORD` (uma senha forte) e `SECRET_KEY` (uma chave aleatória) no ambiente. Não coloque senhas no Git.
4. Execute `python app.py` e abra `http://127.0.0.1:5000`.
5. Acesse `/login` para cadastrar projetos no painel.

## Publicar no Render a partir do GitHub

1. Crie um repositório GitHub e envie os arquivos desta pasta (não envie o ZIP fechado).
2. No Render, crie um **Web Service** conectado ao repositório (ou use o `render.yaml`).
3. Build: `pip install -r requirements.txt`; Start: `gunicorn app:app`.
4. Configure `ADMIN_PASSWORD` e `SECRET_KEY` como variáveis de ambiente.
5. Abra a URL fornecida pelo Render. O GitHub Pages sozinho não executa Flask.

**Persistência:** o SQLite local do Render pode ser perdido em reinicializações/redeploys se estiver em armazenamento efêmero. Para dados duráveis, configure disco persistente e `DATABASE_PATH` apontando para ele, se disponível no plano escolhido, ou migre para banco externo persistente (ex.: PostgreSQL). Faça isso **antes de usar o formulário de contato em produção**.

**Segurança:** mensagens não são públicas; painel exige senha. Para publicação aberta, acrescente proteção anti-spam e CSRF aos formulários, limite de requisições e HTTPS (fornecido pelo host). Não use uma senha fraca.
