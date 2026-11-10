// Painel público: exibe somente projetos. Nenhum dado privado é exposto.
let statusAdmin = document.querySelector('#admin-status');
function elemento(tag, texto) {
    let e = document.createElement(tag);
    e.textContent = texto == null ? '' : String(texto);
    return e;
}
async function atualizar() {
    let lista = document.querySelector('#lista-admin-projetos');
    lista.textContent = '';
    try {
        let projetos = await obterProjetos();
        if (!projetos.length) lista.appendChild(elemento('p', 'Nenhum projeto cadastrado.'));
        for (let projeto of projetos) {
            let card = elemento('div', '');
            card.className = 'admin-registro';
            card.appendChild(elemento('strong', projeto.titulo));
            card.appendChild(elemento('p', projeto.descricao));
            card.appendChild(elemento('p', 'Tecnologias: ' + projeto.tecnologias));
            if (projeto.link_git && /^https:\/\//.test(projeto.link_git)) {
                let link = elemento('a', 'Ver no GitHub');
                link.href = projeto.link_git;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                card.appendChild(link);
            }
            lista.appendChild(card);
        }
        statusAdmin.textContent = 'Projetos carregados.';
    } catch (erro) {
        statusAdmin.textContent = 'Não foi possível carregar os projetos: ' + erro.message;
    }
}
atualizar();
