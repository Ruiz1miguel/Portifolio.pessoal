# Portfólio GitHub Pages + Flask + MySQL

## Arquitetura
- **GitHub Pages:** `index.html`, `pages/`, `css/`, `js/`, `img/`.
- **API Flask:** `backend/app.py` executada em **hospedagem Python externa**, acessível por HTTPS.
- **MySQL:** banco em servidor persistente acessível pela API, não pelo navegador.
- **Sem Supabase.** O GitHub Pages **não executa Python nem MySQL**.

## 1. Banco de dados
No MySQL, execute `backend/banco.sql`. Se o provedor já criou o banco, remova as duas primeiras instruções (`CREATE DATABASE` e `USE`) e execute apenas os `CREATE TABLE`.

## 2. Configurar a API
Hospede a pasta `backend/` em um serviço que rode Python e consiga acessar seu MySQL. Instale `requirements.txt`. Configure as variáveis listadas em `backend/.env.example` **no painel privado da hospedagem**, nunca em arquivos públicos.

Para criar a senha administrativa em hash, no terminal Python com Flask instalado:

```bash
python -c "from werkzeug.security import generate_password_hash; import getpass; print(generate_password_hash(getpass.getpass('Senha do admin: ')))"
```

Copie o hash resultante para `ADMIN_PASSWORD_HASH`. Gere `SECRET_KEY` com:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Configure `ADMIN_EMAIL` e `ALLOWED_ORIGINS` com a origem exata `https://SEU_USUARIO.github.io` (sem caminho do repositório), podendo adicionar `http://localhost:5500` para testes locais.

Comando de inicialização recomendado na hospedagem (na pasta `backend`):

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

Em ambiente local, instale dependências e execute `python app.py` com as variáveis de ambiente configuradas. Acesse `/api/health` para confirmar que a API está online. **A API precisa de HTTPS no ambiente publicado.**

## 3. Configurar o frontend
Abra `js/config.js` e substitua `COLE_A_URL_DA_API_AQUI` pelo endereço HTTPS da API, como `https://minha-api.exemplo.com` (sem barra final). **Não coloque credenciais MySQL nem senha administrativa no frontend.**

## 4. Publicar GitHub Pages
Suba o conteúdo da pasta raiz ao repositório. Em Settings > Pages, use Deploy from a branch > main > / (root). O site abre em `https://SEU_USUARIO.github.io/REPOSITORIO/` e o painel em `pages/admin.html`.

## 5. Testes
1. Verifique `/api/health` na API.
2. Abra o site e confira a galeria (a tabela pode estar vazia).
3. Acesse `pages/admin.html`, entre com `ADMIN_EMAIL` e a senha que gerou o hash.
4. Cadastre, edite e exclua um projeto; veja a atualização na galeria.
5. Envie uma mensagem no formulário e confirme no painel.

## Segurança e limites
- Consultas MySQL parametrizadas; login com hash de senha; token assinado que expira em 1 hora; CORS restrito.
- O token fica somente em memória: atualizar a página do painel exige novo login.
- O endpoint público de mensagens pode receber spam: antes de produção ampla, adicione limitação de requisições/CAPTCHA e monitore o uso.
- A proteção de login é básica para projeto escolar; para produção, acrescente rate limiting e observabilidade.
- Use hospedagem com **MySQL persistente**; hospedagens efêmeras podem apagar dados locais.
- O SQL do Supabase e a chave pública anterior não são utilizados nesta versão.
- O projeto está preparado, mas **não está publicado nem testado em hospedagem real**.
