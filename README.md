# Portfólio para GitHub Pages

Versão estática do portfólio: HTML, CSS, JavaScript e JSON.

## Publicação
1. Envie **o conteúdo desta pasta** para a raiz de um repositório GitHub.
2. Acesse Settings > Pages > Build and deployment.
3. Escolha Deploy from a branch, branch `main`, pasta `/ (root)` e Save.
4. Aguarde a publicação e abra o endereço exibido pelo GitHub.

## Editar projetos
Abra `data/projetos.json` e altere os registros, mantendo JSON válido. Cada projeto usa `id`, `titulo`, `descricao`, `tecnologias` e `link_git`. Para mostrar o botão do GitHub, coloque a URL real em `link_git`; vazio esconde o botão.

**Importante:** não foi possível recuperar os registros reais do seu MySQL. Incluí um exemplo `Carta_AnaJulia` com dados visíveis na captura, descrição provisória e sem link inventado. Substitua ou acrescente seus registros reais.

A versão GitHub Pages não executa PHP, MySQL, CRUD ou envio de mensagens. O formulário foi substituído por aviso. Guarde o ZIP original para rodar o backend no XAMPP.

Para testar `fetch()` localmente, use um servidor HTTP (por exemplo, VS Code Live Server), e não abra `index.html` diretamente com `file://`.
