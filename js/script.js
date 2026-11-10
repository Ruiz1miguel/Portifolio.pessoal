// Versão GitHub Pages: galeria dinâmica via API Python Flask e MySQL.
let botoesPerguntas = document.querySelectorAll('.pergunta-botao');
let respostas = document.querySelectorAll('.resposta');
for (let i = 0; i < botoesPerguntas.length; i++) {
    botoesPerguntas[i].addEventListener('click', function () {
        respostas[i].classList.toggle('visivel');
    });
}
let saudacao = document.querySelector('#saudacao');
if (saudacao) saudacao.textContent = 'Bem-vindo ao meu portfólio!';
function criarTexto(tag, texto) {
    let elemento = document.createElement(tag);
    elemento.textContent = texto == null ? '' : String(texto);
    return elemento;
}
function criarLink(projeto) {
    if (!projeto.link_git || !/^https:\/\//i.test(projeto.link_git)) return null;
    let link = criarTexto('a', 'Ver no GitHub');
    link.className = 'botao';
    link.href = projeto.link_git;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
}
async function carregarProjetos() {
    let galeria = document.querySelector('#galeria-projetos');
    let destaque = document.querySelector('#projetos-destaque');
    let detalhe = document.querySelector('#detalhe-projeto');
    if (!galeria && !destaque && !detalhe) return;
    let status = document.querySelector('#status-projetos');
    try {
        let projetos = await obterProjetos();
        if (detalhe) {
            let id = new URLSearchParams(window.location.search).get('id');
            let projeto = projetos.find(function (item) { return String(item.id) === id; });
            detalhe.textContent = '';
            if (!projeto) { detalhe.appendChild(criarTexto('p', 'Projeto não encontrado.')); return; }
            let card = document.createElement('article');
            card.className = 'projeto';
            card.appendChild(criarTexto('h2', projeto.titulo));
            card.appendChild(criarTexto('h3', 'Descrição'));
            card.appendChild(criarTexto('p', projeto.descricao));
            card.appendChild(criarTexto('h3', 'Tecnologias utilizadas'));
            card.appendChild(criarTexto('p', projeto.tecnologias));
            let link = criarLink(projeto);
            if (link) card.appendChild(link);
            detalhe.appendChild(card);
            return;
        }
        let lista = galeria || destaque;
        lista.textContent = '';
        if (status) { lista.appendChild(status); status.textContent = projetos.length ? '' : 'Nenhum projeto cadastrado.'; }
        let limite = destaque ? 3 : projetos.length;
        for (let i = 0; i < projetos.length && i < limite; i++) {
            let projeto = projetos[i];
            let card = document.createElement('article');
            card.className = 'projeto';
            let numero = criarTexto('span', 'PROJETO ' + (i + 1));
            numero.className = 'numero-projeto';
            card.appendChild(numero);
            card.appendChild(criarTexto('h3', projeto.titulo));
            card.appendChild(criarTexto('p', projeto.descricao));
            let tec = criarTexto('span', projeto.tecnologias);
            tec.className = 'projeto-tec';
            card.appendChild(tec);
            let acoes = document.createElement('div');
            acoes.className = 'acoes-projeto';
            let link = criarLink(projeto);
            if (link) acoes.appendChild(link);
            let detalhes = criarTexto('a', 'Ver detalhes');
            detalhes.className = 'botao botao-secundario';
            detalhes.href = (destaque ? 'pages/' : '') + 'detalhes.html?id=' + encodeURIComponent(projeto.id);
            acoes.appendChild(detalhes);
            card.appendChild(acoes);
            lista.appendChild(card);
        }
        let pesquisa = document.querySelector('#pesquisa-projetos');
        if (pesquisa) pesquisa.addEventListener('input', function () {
            let termo = pesquisa.value.toLowerCase();
            let cards = lista.querySelectorAll('.projeto');
            let visiveis = 0;
            for (let i = 0; i < cards.length; i++) {
                let texto = cards[i].textContent.toLowerCase();
                let encontrou = texto.indexOf(termo) >= 0;
                cards[i].classList.toggle('oculto', !encontrou);
                if (encontrou) visiveis++;
            }
            if (status) status.textContent = visiveis ? '' : 'Nenhum projeto encontrado.';
        });
    } catch (erro) {
        if (status) status.textContent = erro.message;
        if (detalhe) detalhe.textContent = erro.message;
    }
}
async function configurarContato() {
    let formulario = document.querySelector('#form-contato');
    if (!formulario) return;
    formulario.addEventListener('submit', async function (evento) {
        evento.preventDefault();
        let status = document.querySelector('#status');
        let botao = formulario.querySelector('button[type=submit]');
        botao.disabled = true;
        status.textContent = 'Enviando...';
        try {
            await enviarMensagem({
                nome: formulario.elements.nome.value.trim(),
                email: formulario.elements.email.value.trim(),
                texto: formulario.elements.texto.value.trim()
            });
            formulario.reset();
            status.textContent = 'Mensagem enviada com sucesso!';
            status.className = 'status ok';
        } catch (erro) {
            status.textContent = 'Erro ao enviar: ' + erro.message;
            status.className = 'status erro';
        }
        botao.disabled = false;
    });
}
carregarProjetos();
configurarContato();
