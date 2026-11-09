**IMPORTANTE: Seu Supabase ja foi configurado. Leia LEIA_PRIMEIRO.txt e NAO execute supabase.sql novamente.**

# Portfólio GitHub Pages + Supabase

## 1. Criar banco e conta administrativa
1. Crie um projeto em https://supabase.com/.
2. Abra **SQL Editor** e execute `supabase.sql` (não execute a linha de exemplo do INSERT com texto placeholder).
3. Em **Authentication > Users**, crie manualmente um usuário administrador com e-mail e senha. Copie o **User UID** (UUID).
4. No SQL Editor execute: `insert into public.admins (user_id) values ('SEU-UUID-AQUI');` substituindo pelo UID real.
5. No arquivo `js/config.js`, preencha **Project URL** e **publishable key** (ou `anon` legacy key) encontradas nas configurações de API. **NUNCA** use `service_role`, secret key, senha ou token privado nesse arquivo.
6. No Supabase, revise as permissões de autenticação e configure URLs do site conforme necessário.

## 2. Publicar no GitHub Pages
Envie `index.html`, `pages/`, `css/`, `js/`, `img/` para a raiz de um repositório. Em Settings > Pages, selecione Deploy from a branch > main > /(root).

## 3. Usar o site
- `index.html` e `pages/projetos.html` exibem projetos diretamente do Supabase.
- `pages/detalhes.html?id=1` exibe o projeto de ID 1.
- `pages/contato.html` permite enviar mensagens ao banco.
- `pages/admin.html` é o painel de login e CRUD de projetos; também lista e exclui mensagens.
- A senha do administrador **não** é publicada no GitHub. O banco usa RLS para autorizar alterações.

## Atenção
- Sem URL, chave pública, usuário admin e SQL configurados, o CRUD ainda não funcionará.
- A chave pública no frontend é normal; a proteção vem das políticas RLS, que não devem ser desativadas.
- Inserção pública de mensagens pode receber spam. Para uso público intenso, implemente proteção anti-spam/CAPTCHA e limites de taxa em um backend/Edge Function.
- Os dados reais do MySQL **não** foram importados. Você deve cadastrá-los no painel ou migrá-los.
- A versão PHP/MySQL original deve ser preservada separadamente caso o professor exija essa tecnologia.
- Esta versão implementa CRUD completo de **projetos** e criação/leitura/exclusão de **mensagens**. Mensagens não são editáveis pelo painel.
