// Saudacao fixa: texto e DOM, sem API de datas nao confirmada nas apostilas.
let saudacao = document.querySelector("#saudacao");
if (saudacao) {
    saudacao.textContent = "Bem-vindo ao meu portfólio!";
}

// Perguntas interativas: querySelectorAll, addEventListener e classList.toggle.
let botoesPerguntas = document.querySelectorAll(".pergunta-botao");
let respostas = document.querySelectorAll(".resposta");
for (let i = 0; i < botoesPerguntas.length; i++) {
    botoesPerguntas[i].addEventListener("click", function () {
        respostas[i].classList.toggle("visivel");
    });
}


// Busca os registros com fetch e JSON, como na apostila do 4o bimestre.
function criarTexto(elemento, texto) {
    let novo = document.createElement(elemento);
    novo.textContent = texto;
    return novo;
}

// Detalhes de projetos: criados com DOM e exibidos por clique.
function mostrarDetalhes(projetos) {
    let lista = document.querySelector("#detalhe-projeto");
    if (!lista) return;
    if (projetos.length === 0) {
        lista.appendChild(criarTexto("p", "Nenhum projeto cadastrado."));
    }
    for (let i = 0; i < projetos.length; i++) {
        let projeto = projetos[i];
        let card = document.createElement("article");
        card.classList.add("projeto");
        card.appendChild(criarTexto("h2", projeto.titulo));
        let botao = criarTexto("button", "Mostrar ou ocultar detalhes");
        botao.classList.add("botao");
        let conteudo = document.createElement("div");
        conteudo.classList.add("conteudo-detalhe");
        conteudo.classList.add("oculto");
        conteudo.appendChild(criarTexto("p", projeto.descricao));
        conteudo.appendChild(criarTexto("h3", "Tecnologias utilizadas"));
        conteudo.appendChild(criarTexto("p", projeto.tecnologias));
        let link = criarTexto("a", "Ver no GitHub");
        link.classList.add("botao");
        link.setAttribute("href", projeto.link_git);
        link.setAttribute("target", "_blank");
        conteudo.appendChild(link);
        botao.addEventListener("click", function () {
            conteudo.classList.toggle("oculto");
        });
        card.appendChild(botao);
        card.appendChild(conteudo);
        lista.appendChild(card);
    }
}

// Pesquisa simples usando apenas lacos, comparacoes e arrays.
// A busca diferencia maiusculas de minusculas.
function contemTexto(texto, termo) {
    if (termo === "") return true;
    for (let i = 0; i <= texto.length - termo.length; i++) {
        let igual = true;
        for (let j = 0; j < termo.length; j++) {
            if (texto[i + j] !== termo[j]) igual = false;
        }
        if (igual) return true;
    }
    return false;
}

function carregarProjetos() {
    let lista = document.querySelector("#galeria-projetos");
    let limite = 100000;
    if (!lista) {
        lista = document.querySelector("#projetos-destaque");
        limite = 3;
    }
    let detalhe = document.querySelector("#detalhe-projeto");
    if (!lista && !detalhe) return;
    let status = document.querySelector("#status-projetos");
    fetch(detalhe || (lista && lista.id == "galeria-projetos") ? "../php/api.php?tabela=projetos" : "php/api.php?tabela=projetos")
        .then(function (resposta) { return resposta.json(); })
        .then(function (projetos) {
            if (detalhe) {
                mostrarDetalhes(projetos);
                return;
            }
            status.textContent = "";
            if (projetos.length == 0) status.textContent = "Nenhum projeto cadastrado. Use o painel para adicionar.";
            for (let i = 0; i < projetos.length && i < limite; i++) {
                let projeto = projetos[i];
                let card = document.createElement("article");
                card.className = "projeto";
                let numero = criarTexto("span", "PROJETO");
                numero.className = "numero-projeto";
                card.appendChild(numero);
                card.appendChild(criarTexto("h3", projeto.titulo));
                card.appendChild(criarTexto("p", projeto.descricao));
                card.appendChild(criarTexto("p", projeto.tecnologias));
                let link = criarTexto("a", "Ver no Git");
                link.className = "botao";
                link.href = projeto.link_git;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                let acoes = document.createElement("div");
                acoes.className = "acoes-projeto";
                acoes.appendChild(link);
                let detalhes = criarTexto("a", "Ver detalhes dos projetos");
                detalhes.className = "botao botao-secundario";
                detalhes.setAttribute("href", lista.id == "galeria-projetos" ? "detalhes.html" : "pages/detalhes.html");
                acoes.appendChild(detalhes);
                card.appendChild(acoes);
                lista.appendChild(card);
            }
        })
        .catch(function () {
            if (status) status.textContent = "Não foi possível carregar os projetos. Verifique o Apache e o MySQL.";
            if (detalhe) detalhe.textContent = "Não foi possível carregar o projeto.";
        });
}

function carregarMensagens() {
    let lista = document.querySelector("#lista-mensagens");
    if (!lista) return;
    let status = document.querySelector("#status-mensagens");
    fetch("../php/api.php?tabela=mensagens")
        .then(function (resposta) { return resposta.json(); })
        .then(function (mensagens) {
            status.textContent = "";
            document.querySelector("#titulo-mensagens").textContent = "Mensagens enviadas (" + mensagens.length + ")";
            for (let i = 0; i < mensagens.length; i++) {
                let item = document.createElement("li");
                item.className = "mensagem-card";
                item.appendChild(criarTexto("strong", mensagens[i].nome));
                let email = criarTexto("span", mensagens[i].email);
                email.className = "mensagem-email";
                item.appendChild(email);
                item.appendChild(criarTexto("p", mensagens[i].texto));
                item.appendChild(criarTexto("small", mensagens[i].data_envio));
                lista.appendChild(item);
            }
        })
        .catch(function () { status.textContent = "Não foi possível carregar as mensagens. Verifique o Apache e o MySQL."; });
}

// Pesquisa local: usa os cards que ja foram carregados pelo fetch.
let pesquisa = document.querySelector("#pesquisa-projetos");
if (pesquisa) {
    pesquisa.addEventListener("input", function () {
        let termo = pesquisa.value;
        let cards = document.querySelectorAll("#galeria-projetos .projeto");
        for (let i = 0; i < cards.length; i++) {
            let texto = cards[i].textContent;
            if (contemTexto(texto, termo)) {
                cards[i].classList.remove("oculto");
            } else {
                cards[i].classList.add("oculto");
            }
        }
    });
}

carregarProjetos();
carregarMensagens();
