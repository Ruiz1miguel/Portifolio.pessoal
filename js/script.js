// Versao GitHub Pages: projetos sao lidos de data/projetos.json.
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
    elemento.textContent = texto || '';
    return elemento;
}
function criarLink(projeto) {
    if (!projeto.link_git) return null;
    let link = criarTexto('a', 'Ver no GitHub');
    link.className = 'botao';
    link.href = projeto.link_git;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
}
function carregarProjetos() {
    let galeria = document.querySelector('#galeria-projetos');
    let destaque = document.querySelector('#projetos-destaque');
    let detalhe = document.querySelector('#detalhe-projeto');
    if (!galeria && !destaque && !detalhe) return;
    let caminho = destaque ? 'data/projetos.json' : '../data/projetos.json';
    fetch(caminho)
        .then(function (resposta) {
            if (!resposta.ok) throw new Error('Falha ao carregar JSON');
            return resposta.json();
        })
        .then(function (projetos) {
            if (detalhe) {
                let parametros = new URLSearchParams(window.location.search);
                let id = parametros.get('id');
                let encontrados = [];
                for (let i = 0; i < projetos.length; i++) {
                    if (String(projetos[i].id) === id) encontrados.push(projetos[i]);
                }
                if (encontrados.length === 0) {
                    detalhe.appendChild(criarTexto('p', 'Projeto não encontrado. Volte à galeria.'));
                    return;
                }
                let projeto = encontrados[0];
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
            let status = document.querySelector('#status-projetos');
            if (status) status.textContent = projetos.length === 0 ? 'Nenhum projeto disponível.' : '';
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
            if (pesquisa) {
                pesquisa.addEventListener('input', function () {
                    let termo = pesquisa.value.toLowerCase();
                    let cards = lista.querySelectorAll('.projeto');
                    let visiveis = 0;
                    for (let i = 0; i < cards.length; i++) {
                        let texto = cards[i].textContent.toLowerCase();
                        if (texto.indexOf(termo) >= 0) {
                            cards[i].classList.remove('oculto');
                            visiveis++;
                        } else {
                            cards[i].classList.add('oculto');
                        }
                    }
                    if (status) status.textContent = visiveis === 0 ? 'Nenhum projeto encontrado.' : '';
                });
            }
        })
        .catch(function () {
            let status = document.querySelector('#status-projetos');
            if (status) status.textContent = 'Não foi possível carregar data/projetos.json. Abra pelo GitHub Pages ou por um servidor local.';
            if (detalhe) detalhe.textContent = 'Não foi possível carregar os detalhes.';
        });
}
carregarProjetos();

sb_publishable_FnqjQVDSbwncvbmt8N81Iw_NfvfzPNW