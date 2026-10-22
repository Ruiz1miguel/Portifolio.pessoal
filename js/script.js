// ========================================
// MENU
// ========================================

let linksMenu = document.querySelectorAll("nav a");

linksMenu.forEach(link => {

    link.addEventListener("click", function () {

        linksMenu.forEach(item => {
            item.classList.remove("ativo");
        });

        this.classList.add("ativo");

    });

});


// ========================================
// FORMULÁRIO DE CONTATO
// ========================================

let formulario = document.querySelector("form");

if (formulario) {

    formulario.addEventListener("submit", function(event) {

        let nome = document.querySelector("#nome").value;

        if (nome.trim() === "") {
            event.preventDefault();
            alert("Por favor, informe seu nome.");
            return;
        }

    });

}

// ========================================
// Saudar o visitante
// ========================================

const saudacao = document.querySelector('#saudacao');

if (saudacao) {

    const hora = new Date().getHours();

    if (hora < 12) {
        saudacao.textContent = 'Bom dia! Seja bem-vindo(a).';
    } else if (hora < 18) {
        saudacao.textContent = 'Boa tarde! Seja bem-vindo(a).';
    } else {
        saudacao.textContent = 'Boa noite! Seja bem-vindo(a).';
    }

}


// ========================================
// INTEGRAÇÃO COM A API (GET + POST)
// Este arquivo conversa com o php/mensagens.php usando fetch,
// sem precisar recarregar a página.
// ========================================
 
// Endereço da API. É relativo à página (pages/contato.html),
// por isso sobe uma pasta (..) e entra em php/.
const API_URL = "../php/mensagens.php";
 
 
// ----------------------------------------
// GET: busca as mensagens salvas no banco
// ----------------------------------------
// "async" permite usar "await" dentro da função:
// o código espera a resposta do servidor antes de continuar.
async function listarMensagens() {
    // fetch sem opções faz uma requisição GET (é o padrão)
    const resposta = await fetch(API_URL);
 
    // resposta.ok é false para status 400, 404, 500...
    // Nesse caso lançamos um erro, que será pego pelo try/catch de quem chamou.
    if (!resposta.ok) {
        throw new Error("Não foi possível carregar as mensagens (status " + resposta.status + ").");
    }
 
    // Converte o corpo da resposta (texto JSON) em array de objetos JavaScript
    return await resposta.json();
}
 
 
// ----------------------------------------
// POST: cadastra uma nova mensagem
// ----------------------------------------
// "dados" é um objeto, por exemplo { nome: "Ana", email: "a@b.com", texto: "Oi" }
async function cadastrarMensagem(dados) {
    const resposta = await fetch(API_URL, {
        method: "POST", // muda o método de GET para POST
 
        // Avisa ao servidor que o corpo da requisição está em formato JSON
        headers: { "Content-Type": "application/json" },
 
        // Objetos JS não viajam pela rede: JSON.stringify converte em texto JSON
        body: JSON.stringify(dados),
    });
 
    // Lê a resposta do servidor (a mensagem criada ou { erro: "..." })
    const corpo = await resposta.json();
 
    // Se o servidor recusou (ex.: 400 por campo vazio), mostra o erro que ele enviou
    if (!resposta.ok) {
        throw new Error(corpo.erro || "Erro ao enviar a mensagem.");
    }
 
    return corpo;
}
 
 
// ----------------------------------------
// Feedback para o usuário
// ----------------------------------------
// tipo: "ok" (verde) ou "erro" (vermelho). As cores estão no style.css.
function mostrarStatus(texto, tipo) {
    const status = document.querySelector("#status");
    status.textContent = texto;
    status.className = "status " + tipo; // troca a classe CSS conforme o tipo
}
 
 
// ----------------------------------------
// Desenha a lista de mensagens na tela
// ----------------------------------------
// Recebe o array vindo do GET e cria os elementos HTML dinamicamente.
// Usa textContent (e não innerHTML) para que um texto como "<script>"
// seja mostrado como texto e nunca executado.
function renderizarMensagens(mensagens) {
    const lista = document.querySelector("#lista-mensagens");
 
    // Limpa a lista antiga antes de desenhar a nova
    lista.innerHTML = "";
 
    // Atualiza o contador no título "Mensagens enviadas (N)"
    document.querySelector("#total").textContent = mensagens.length;
 
    // Caso não exista nenhuma mensagem, mostra um aviso e para por aqui
    if (mensagens.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "sem-registros";
        vazio.textContent = "Nenhuma mensagem enviada ainda.";
        lista.appendChild(vazio);
        return;
    }
 
    // Para cada mensagem do banco, monta um "card"
    mensagens.forEach(function (msg) {
        const item = document.createElement("li");
        item.className = "mensagem-card";
 
        const titulo = document.createElement("strong");
        titulo.textContent = msg.nome;
 
        const email = document.createElement("span");
        email.className = "mensagem-email";
        email.textContent = msg.email;
 
        const texto = document.createElement("p");
        texto.textContent = msg.texto;
 
        const data = document.createElement("small");
        data.textContent = msg.data_envio;
 
        // Coloca todos os elementos dentro do <li> e o <li> dentro da <ul>
        item.append(titulo, email, texto, data);
        lista.appendChild(item);
    });
}
 
 
// ----------------------------------------
// Busca as mensagens e mostra na tela
// ----------------------------------------
// try/catch: se o servidor estiver desligado ou o fetch falhar,
// o erro é mostrado ao usuário em vez de quebrar a página.
async function carregarMensagens() {
    try {
        renderizarMensagens(await listarMensagens());
    } catch (erro) {
        mostrarStatus("Erro: não consegui falar com o servidor. O Apache/MySQL estão ligados? (" + erro.message + ")", "erro");
    }
}
 
 
// ----------------------------------------
// Formulário de contato
// ----------------------------------------
const formContato = document.querySelector("#form-contato");
 
// Só roda se o formulário existir (este script também é carregado em
// páginas que não têm o formulário, e aí nada deve acontecer)
if (formContato) {
 
    // Ao abrir a página, já mostra as mensagens que existem no banco
    carregarMensagens();
 
    formContato.addEventListener("submit", async function (event) {
        // Impede o envio padrão do formulário, que recarregaria a página
        event.preventDefault();
 
        // Lê o que o usuário digitou; trim() tira espaços do começo e do fim
        const dados = {
            nome: document.querySelector("#nome").value.trim(),
            email: document.querySelector("#email").value.trim(),
            texto: document.querySelector("#mensagem").value.trim(),
        };
 
        // Validação simples no navegador antes de chamar o servidor
        if (dados.nome === "") {
            mostrarStatus("Por favor, informe seu nome.", "erro");
            return;
        }
 
        try {
            // Envia o POST e espera o servidor confirmar o cadastro
            await cadastrarMensagem(dados);
 
            mostrarStatus("Mensagem enviada com sucesso! Obrigado pelo contato.", "ok");
            formContato.reset(); // limpa os campos do formulário
 
            // Busca a lista de novo: a nova mensagem aparece sem recarregar a página
            await carregarMensagens();
        } catch (erro) {
            // Qualquer falha (rede, servidor, validação) cai aqui
            mostrarStatus("Erro: " + erro.message, "erro");
        }
    });
}