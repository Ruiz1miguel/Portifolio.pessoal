// Painel de administração: token guardado somente nesta aba (em memória).
let tokenAdmin = '';
let projetosAtuais = [];
let loginArea = document.querySelector('#login-area');
let area = document.querySelector('#admin-area');
let statusAdmin = document.querySelector('#admin-status');
let formProjeto = document.querySelector('#form-projeto');
function aviso(t) { statusAdmin.textContent = t; }
function elemento(tag, texto) { let e = document.createElement(tag); e.textContent = texto == null ? '' : String(texto); return e; }
function limparForm() { formProjeto.reset(); document.querySelector('#projeto-id').value = ''; document.querySelector('#titulo-form').textContent = 'Cadastrar projeto'; }
function sair() { tokenAdmin = ''; area.hidden = true; loginArea.hidden = false; limparForm(); }
function adm(caminho, metodo, dados) { return api(caminho, metodo, dados, tokenAdmin); }
async function atualizar() {
    projetosAtuais = await adm('/api/projetos');
    let lista = document.querySelector('#lista-admin-projetos'); lista.textContent = '';
    if (!projetosAtuais.length) lista.appendChild(elemento('p', 'Nenhum projeto cadastrado.'));
    for (let projeto of projetosAtuais) {
        let card = elemento('div', ''); card.className = 'admin-registro';
        card.appendChild(elemento('strong', projeto.titulo));
        card.appendChild(elemento('p', projeto.descricao));
        let acoes = elemento('div', ''); acoes.className = 'acoes';
        let editar = elemento('button', 'Editar'); editar.type = 'button'; editar.className = 'btn btn-editar';
        editar.addEventListener('click', function () {
            document.querySelector('#projeto-id').value = projeto.id;
            document.querySelector('#titulo').value = projeto.titulo;
            document.querySelector('#descricao').value = projeto.descricao;
            document.querySelector('#tecnologias').value = projeto.tecnologias;
            document.querySelector('#link-git').value = projeto.link_git || '';
            document.querySelector('#titulo-form').textContent = 'Editar projeto';
            formProjeto.scrollIntoView({behavior:'smooth'});
        });
        let excluir = elemento('button', 'Excluir'); excluir.type = 'button'; excluir.className = 'btn btn-excluir';
        excluir.addEventListener('click', async function () {
            if (!confirm('Excluir este projeto?')) return;
            try { await adm('/api/projetos/' + projeto.id, 'DELETE'); aviso('Projeto excluído.'); await atualizar(); } catch (e) { aviso(e.message); }
        });
        acoes.appendChild(editar); acoes.appendChild(excluir); card.appendChild(acoes); lista.appendChild(card);
    }
    let mensagens = await adm('/api/mensagens');
    let caixa = document.querySelector('#lista-admin-mensagens'); caixa.textContent = '';
    if (!mensagens.length) caixa.appendChild(elemento('p', 'Nenhuma mensagem recebida.'));
    for (let m of mensagens) {
        let card = elemento('div', ''); card.className = 'admin-registro';
        card.appendChild(elemento('strong', m.nome)); card.appendChild(elemento('p', m.email)); card.appendChild(elemento('p', m.texto));
        card.appendChild(elemento('small', m.data_envio || ''));
        let excluir = elemento('button', 'Excluir mensagem'); excluir.type = 'button'; excluir.className = 'btn btn-excluir';
        excluir.addEventListener('click', async function () {
            if (!confirm('Excluir esta mensagem?')) return;
            try { await adm('/api/mensagens/' + m.id, 'DELETE'); aviso('Mensagem excluída.'); await atualizar(); } catch (e) { aviso(e.message); }
        });
        card.appendChild(excluir); caixa.appendChild(card);
    }
}
document.querySelector('#form-login').addEventListener('submit', async function (evento) {
    evento.preventDefault(); aviso('Entrando...');
    try {
        let dados = await api('/api/login', 'POST', {email:document.querySelector('#admin-email').value.trim(), senha:document.querySelector('#admin-senha').value});
        tokenAdmin = dados.token;
        await adm('/api/verificar');
        loginArea.hidden = true; area.hidden = false; document.querySelector('#form-login').reset();
        await atualizar(); aviso('Painel carregado.');
    } catch (e) { sair(); aviso('Erro ao entrar: ' + e.message); }
});
formProjeto.addEventListener('submit', async function (evento) {
    evento.preventDefault(); aviso('Salvando...');
    let id = document.querySelector('#projeto-id').value;
    let dados = {titulo:document.querySelector('#titulo').value.trim(), descricao:document.querySelector('#descricao').value.trim(), tecnologias:document.querySelector('#tecnologias').value.trim(), link_git:document.querySelector('#link-git').value.trim()};
    try { await adm(id ? '/api/projetos/' + id : '/api/projetos', id ? 'PUT' : 'POST', dados); limparForm(); await atualizar(); aviso('Projeto salvo!'); }
    catch (e) { aviso(e.message); }
});
document.querySelector('#cancelar').addEventListener('click', limparForm);
document.querySelector('#sair').addEventListener('click', function () { sair(); aviso('Você saiu do painel.'); });
