// Cliente REST simples para Supabase (sem bibliotecas externas).
function configurado() {
    return window.SUPABASE_URL && window.SUPABASE_KEY &&
        window.SUPABASE_URL.indexOf('COLE_') === -1 &&
        window.SUPABASE_KEY.indexOf('COLE_') === -1;
}
async function requisicaoSupabase(caminho, opcoes, token) {
    if (!configurado()) throw new Error('Configure js/config.js com a URL e a chave pública do Supabase.');
    let headers = { 'apikey': window.SUPABASE_KEY };
    // A chave sb_publishable_ nao e JWT: so envie Bearer com o token de login.
    if (token) headers['Authorization'] = 'Bearer ' + token;
    else if (window.SUPABASE_KEY.startsWith('eyJ')) headers['Authorization'] = 'Bearer ' + window.SUPABASE_KEY;
    if (opcoes && opcoes.body) headers['Content-Type'] = 'application/json';
    if (opcoes && opcoes.method && opcoes.method !== 'GET') headers['Prefer'] = 'return=representation';
    let resposta = await fetch(window.SUPABASE_URL.replace(/\/$/, '') + caminho, {
        method: (opcoes && opcoes.method) || 'GET',
        headers: headers,
        body: opcoes && opcoes.body ? JSON.stringify(opcoes.body) : undefined
    });
    let texto = await resposta.text();
    let dados = texto ? JSON.parse(texto) : null;
    if (!resposta.ok) throw new Error((dados && (dados.message || dados.error_description || dados.msg)) || 'Erro HTTP ' + resposta.status);
    return dados;
}
async function obterProjetos() {
    return await requisicaoSupabase('/rest/v1/projetos?select=*&order=id.desc');
}
async function enviarMensagem(dados) {
    return await requisicaoSupabase('/rest/v1/mensagens', {method:'POST', body:dados});
}
async function loginAdmin(email, senha) {
    return await requisicaoSupabase('/auth/v1/token?grant_type=password', {method:'POST', body:{email:email,password:senha}});
}
