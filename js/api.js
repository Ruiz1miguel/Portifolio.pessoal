// JavaScript Fetch/JSON: comunicação entre GitHub Pages e Python Flask.
async function api(caminho, metodo, dados, admin) {
    if (!window.API_URL || window.API_URL.includes('COLE_')) throw new Error('Configure a URL da API em js/config.js.');
    let cabecalhos = {};
    if (dados !== undefined) cabecalhos['Content-Type'] = 'application/json';
    if (admin && window.ADMIN_KEY) cabecalhos['X-Admin-Key'] = window.ADMIN_KEY;
    let resposta = await fetch(window.API_URL.replace(/\/$/, '') + caminho, {
        method: metodo || 'GET', headers: cabecalhos,
        body: dados === undefined ? undefined : JSON.stringify(dados)
    });
    let resultado = await resposta.json().catch(function () { return {}; });
    if (!resposta.ok) {
        let erro = new Error(resultado.erro || 'Erro HTTP ' + resposta.status);
        erro.status = resposta.status;
        throw erro;
    }
    return resultado;
}
async function obterProjetos() { return api('/api/projetos'); }
async function enviarMensagem(dados) { return api('/api/mensagens', 'POST', dados); }
