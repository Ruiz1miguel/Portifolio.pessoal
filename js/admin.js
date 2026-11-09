// Administração: login com Supabase Auth e permissões RLS no banco.
let sessao = null;
let projetosAtuais = [];
let formLogin = document.querySelector('#form-login');
let formProjeto = document.querySelector('#form-projeto');
let area = document.querySelector('#admin-area');
let loginArea = document.querySelector('#login-area');
let statusAdmin = document.querySelector('#admin-status');
function aviso(texto) { statusAdmin.textContent = texto; }
function elemento(tag, texto) { let e = document.createElement(tag); e.textContent = texto == null ? '' : String(texto); return e; }
function mostrarLogin() { sessao = null; area.hidden = true; loginArea.hidden = false; }
function mostrarAdmin() { area.hidden = false; loginArea.hidden = true; }
async function verificarSessao() {
    if (!sessao) throw new Error('Entre novamente para continuar.');
    // Renova o token pouco antes de expirar.
    if (Date.now() >= sessao.expira) {
        let dados = await requisicaoSupabase('/auth/v1/token?grant_type=refresh_token', {method:'POST', body:{refresh_token:sessao.refresh}});
        sessao = {token:dados.access_token,refresh:dados.refresh_token,expira:Date.now()+dados.expires_in*1000-60000};
    }
    return sessao.token;
}
async function adminRequest(caminho, opcoes) { return await requisicaoSupabase(caminho, opcoes, await verificarSessao()); }
function limparForm() {
    formProjeto.reset(); document.querySelector('#projeto-id').value = '';
    document.querySelector('#titulo-form').textContent = 'Cadastrar projeto';
}
async function atualizar() {
    projetosAtuais = await adminRequest('/rest/v1/projetos?select=*&order=id.desc');
    let lista = document.querySelector('#lista-admin-projetos'); lista.textContent = '';
    if (!projetosAtuais.length) lista.appendChild(elemento('p','Nenhum projeto cadastrado.'));
    for (let projeto of projetosAtuais) {
        let card = elemento('div',''); card.className = 'admin-registro';
        card.appendChild(elemento('strong',projeto.titulo));
        card.appendChild(elemento('p',projeto.descricao));
        let acoes = elemento('div',''); acoes.className = 'acoes';
        let editar = elemento('button','Editar'); editar.className = 'btn btn-editar'; editar.type = 'button';
        editar.addEventListener('click',function () {
            document.querySelector('#projeto-id').value = projeto.id;
            document.querySelector('#titulo').value = projeto.titulo;
            document.querySelector('#descricao').value = projeto.descricao;
            document.querySelector('#tecnologias').value = projeto.tecnologias;
            document.querySelector('#link-git').value = projeto.link_git || '';
            document.querySelector('#titulo-form').textContent = 'Editar projeto';
            formProjeto.scrollIntoView({behavior:'smooth'});
        });
        let excluir = elemento('button','Excluir'); excluir.className = 'btn btn-excluir'; excluir.type = 'button';
        excluir.addEventListener('click',async function () {
            if (!confirm('Excluir este projeto?')) return;
            try { await adminRequest('/rest/v1/projetos?id=eq.'+encodeURIComponent(projeto.id),{method:'DELETE'}); aviso('Projeto excluído.'); await atualizar(); }
            catch (erro) { aviso(erro.message); }
        });
        acoes.appendChild(editar); acoes.appendChild(excluir); card.appendChild(acoes); lista.appendChild(card);
    }
    let mensagens = await adminRequest('/rest/v1/mensagens?select=*&order=data_envio.desc');
    let caixa = document.querySelector('#lista-admin-mensagens'); caixa.textContent = '';
    if (!mensagens.length) caixa.appendChild(elemento('p','Nenhuma mensagem recebida.'));
    for (let mensagem of mensagens) {
        let card = elemento('div',''); card.className = 'admin-registro';
        card.appendChild(elemento('strong',mensagem.nome));
        card.appendChild(elemento('p',mensagem.email));
        card.appendChild(elemento('p',mensagem.texto));
        card.appendChild(elemento('small',mensagem.data_envio ? new Date(mensagem.data_envio).toLocaleString('pt-BR') : ''));
        let excluir = elemento('button','Excluir mensagem'); excluir.type = 'button'; excluir.className = 'btn btn-excluir';
        excluir.addEventListener('click',async function () {
            if (!confirm('Excluir esta mensagem?')) return;
            try { await adminRequest('/rest/v1/mensagens?id=eq.'+encodeURIComponent(mensagem.id),{method:'DELETE'}); aviso('Mensagem excluída.'); await atualizar(); }
            catch (erro) { aviso(erro.message); }
        });
        card.appendChild(excluir); caixa.appendChild(card);
    }
}
formLogin.addEventListener('submit',async function (evento) {
    evento.preventDefault(); aviso('Entrando...');
    try {
        let dados = await loginAdmin(document.querySelector('#admin-email').value.trim(),document.querySelector('#admin-senha').value);
        sessao = {token:dados.access_token,refresh:dados.refresh_token,expira:Date.now()+dados.expires_in*1000-60000};
        // Consulta protegida confirma que esta conta tem acesso de administrador.
        let permissao = await adminRequest('/rest/v1/admins?select=user_id&limit=1');
        if (!permissao || !permissao.length) throw new Error('Esta conta não é administradora.');
        formLogin.reset(); mostrarAdmin(); await atualizar(); aviso('Painel carregado.');
    } catch (erro) { mostrarLogin(); aviso('Não foi possível entrar: '+erro.message); }
});
formProjeto.addEventListener('submit',async function (evento) {
    evento.preventDefault(); aviso('Salvando...');
    let id = document.querySelector('#projeto-id').value;
    let dados = {
        titulo:document.querySelector('#titulo').value.trim(),
        descricao:document.querySelector('#descricao').value.trim(),
        tecnologias:document.querySelector('#tecnologias').value.trim(),
        link_git:document.querySelector('#link-git').value.trim()
    };
    try {
        if (id) await adminRequest('/rest/v1/projetos?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:dados});
        else await adminRequest('/rest/v1/projetos',{method:'POST',body:dados});
        limparForm(); await atualizar(); aviso('Projeto salvo com sucesso.');
    } catch (erro) { aviso('Erro ao salvar: '+erro.message); }
});
document.querySelector('#cancelar').addEventListener('click',limparForm);
document.querySelector('#sair').addEventListener('click',async function () {
    if (sessao) { try { await adminRequest('/auth/v1/logout',{method:'POST'}); } catch (erro) {} }
    sessao = null;
    mostrarLogin(); aviso('Sessão encerrada.');
});
