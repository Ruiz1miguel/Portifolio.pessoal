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