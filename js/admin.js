
// CRUD completo: CREATE, READ, UPDATE, DELETE com Fetch e DOM (apostilas DWS).
let statusAdmin = document.querySelector('#admin-status');
let formularioProjeto = document.querySelector('#form-projeto');
let projetosAtuais = [];
window.ADMIN_KEY = '';

function mostrarStatus(texto) { statusAdmin.textContent = texto; }
function criarElemento(tag, texto) {
    let item = document.createElement(tag);
    item.textContent = texto == null ? '' : String(texto);
    return item;
}

// O painel abre diretamente, sem formulário de e-mail e senha.
// Em produção, uma chave é solicitada apenas quando o servidor exige autorização.
async function acaoAdmin(caminho, metodo, dados) {
    try {
        return await api(caminho, metodo, dados, true);
    } catch (erro) {
        if (erro.status !== 401) throw erro;
        let chave = window.prompt('Para alterar dados no servidor, informe a chave administrativa:');
        if (!chave) throw new Error('Operação cancelada.');
        window.ADMIN_KEY = chave;
        return await api(caminho, metodo, dados, true);
    }
}

async function listarProjetosAdmin() {
    let lista = document.querySelector('#lista-admin-projetos');
    lista.textContent = '';
    try {
        projetosAtuais = await obterProjetos();
        if (!projetosAtuais.length) lista.appendChild(criarElemento('p', 'Nenhum projeto cadastrado.'));
        for (let projeto of projetosAtuais) {
            let card = criarElemento('article', '');
            card.className = 'admin-registro';
            card.appendChild(criarElemento('h3', projeto.titulo));
            card.appendChild(criarElemento('p', projeto.descricao));
            card.appendChild(criarElemento('p', 'Tecnologias: ' + projeto.tecnologias));
            let editar = criarElemento('button', 'Editar');
            editar.type = 'button';
            editar.addEventListener('click', function () { editarProjeto(projeto.id); });
            let excluir = criarElemento('button', 'Excluir');
            excluir.type = 'button';
            excluir.addEventListener('click', function () { excluirProjeto(projeto.id); });
            card.appendChild(editar);
            card.appendChild(excluir);
            lista.appendChild(card);
        }
        mostrarStatus('Projetos carregados.');
    } catch (erro) { mostrarStatus('Erro ao listar projetos: ' + erro.message); }
}

function editarProjeto(id) {
    let projeto = projetosAtuais.find(function (item) { return item.id === id; });
    if (!projeto) return;
    document.querySelector('#projeto-id').value = projeto.id;
    document.querySelector('#titulo').value = projeto.titulo;
    document.querySelector('#descricao').value = projeto.descricao;
    document.querySelector('#tecnologias').value = projeto.tecnologias;
    document.querySelector('#link-git').value = projeto.link_git || '';
    document.querySelector('#titulo-form').textContent = 'Editar projeto';
    formularioProjeto.scrollIntoView({behavior: 'smooth'});
}

function limparFormulario() {
    formularioProjeto.reset();
    document.querySelector('#projeto-id').value = '';
    document.querySelector('#titulo-form').textContent = 'Cadastrar projeto';
}

document.querySelector('#cancelar').addEventListener('click', limparFormulario);
formularioProjeto.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    let id = document.querySelector('#projeto-id').value;
    let dados = {
        titulo: document.querySelector('#titulo').value.trim(),
        descricao: document.querySelector('#descricao').value.trim(),
        tecnologias: document.querySelector('#tecnologias').value.trim(),
        link_git: document.querySelector('#link-git').value.trim()
    };
    try {
        await acaoAdmin(id ? '/api/projetos/' + id : '/api/projetos', id ? 'PUT' : 'POST', dados);
        limparFormulario();
        await listarProjetosAdmin();
        mostrarStatus(id ? 'Projeto atualizado!' : 'Projeto cadastrado!');
    } catch (erro) { mostrarStatus('Não foi possível salvar: ' + erro.message); }
});

async function excluirProjeto(id) {
    if (!window.confirm('Deseja realmente excluir este projeto?')) return;
    try {
        await acaoAdmin('/api/projetos/' + id, 'DELETE');
        await listarProjetosAdmin();
        mostrarStatus('Projeto excluído!');
    } catch (erro) { mostrarStatus('Erro ao excluir: ' + erro.message); }
}

async function listarMensagens() {
    let lista = document.querySelector('#lista-admin-mensagens');
    lista.textContent = '';
    try {
        let mensagens = await acaoAdmin('/api/mensagens', 'GET');
        if (!mensagens.length) lista.appendChild(criarElemento('p', 'Nenhuma mensagem recebida.'));
        for (let mensagem of mensagens) {
            let card = criarElemento('article', '');
            card.className = 'admin-registro';
            card.appendChild(criarElemento('h3', mensagem.nome));
            card.appendChild(criarElemento('p', mensagem.email));
            card.appendChild(criarElemento('p', mensagem.texto));
            let excluir = criarElemento('button', 'Excluir mensagem');
            excluir.type = 'button';
            excluir.addEventListener('click', async function () {
                if (!window.confirm('Excluir esta mensagem?')) return;
                try {
                    await acaoAdmin('/api/mensagens/' + mensagem.id, 'DELETE');
                    await listarMensagens();
                } catch (erro) { mostrarStatus(erro.message); }
            });
            card.appendChild(excluir);
            lista.appendChild(card);
        }
    } catch (erro) { mostrarStatus('Erro ao consultar mensagens: ' + erro.message); }
}

document.querySelector('#carregar-mensagens').addEventListener('click', listarMensagens);
listarProjetosAdmin();
