// Cliente da API Python Flask + MySQL.
async function api(caminho, metodo, dados, token) {
    if (!window.API_URL || window.API_URL.includes('COLE_')) throw new Error('Configure js/config.js com a URL HTTPS da API Flask.');
    let cabecalhos = {};
    if (dados !== undefined) cabecalhos['Content-Type'] = 'application/json';
    if (token) cabecalhos['Authorization'] = 'Bearer ' + token;
    let resposta = await fetch(window.API_URL.replace(/\/$/, '') + caminho, {
        method: metodo || 'GET', headers: cabecalhos,
        body: dados === undefined ? undefined : JSON.stringify(dados)
    });
    let resultado = await resposta.json().catch(function () { return {}; });
    if (!resposta.ok) throw new Error(resultado.erro || 'Erro HTTP ' + resposta.status);
    return resultado;
}
async function obterProjetos() { return api('/api/projetos'); }
async function enviarMensagem(dados) { return api('/api/mensagens', 'POST', dados); }
