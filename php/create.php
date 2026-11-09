<?php
// CREATE: recebe dados do formulario pelo metodo POST.
include "conexao.php";
$erro = "";
$dados = ["id" => "", "titulo" => "", "descricao" => "", "tecnologias" => "", "link_git" => "", "nome" => "", "email" => "", "texto" => ""];
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    foreach ($dados as $campo => $valor) {
        if (isset($_POST[$campo])) {
            $dados[$campo] = trim($_POST[$campo]);
        }
    }
    if ($tabela == "projetos") {
        if ($dados["titulo"] == "" || $dados["link_git"] == "") $erro = "Preencha todos os campos obrigatórios.";
    } else {
        if ($dados["nome"] == "" || $dados["email"] == "" || $dados["texto"] == "") $erro = "Preencha todos os campos obrigatórios.";
        if ($dados["email"] != "" && !filter_var($dados["email"], FILTER_VALIDATE_EMAIL)) $erro = "Informe um e-mail válido.";
    }
    if ($erro == "") {
        if ($tabela == "projetos") {
            $stmt = $conexao->prepare("INSERT INTO projetos (titulo, descricao, tecnologias, link_git) VALUES (?, ?, ?, ?)");
            $stmt->execute([$dados["titulo"], $dados["descricao"], $dados["tecnologias"], $dados["link_git"]]);
        } else {
            $stmt = $conexao->prepare("INSERT INTO mensagens (nome, email, texto) VALUES (?, ?, ?)");
            $stmt->execute([$dados["nome"], $dados["email"], $dados["texto"]]);
        }
        if ($tabela == "mensagens") {
            header("Location: ../pages/mensagem-enviada.html");
        } else {
            header("Location: read.php?tabela=projetos&sucesso=cadastrado");
        }
        exit;
    }

}
$titulo = "Novo Projeto";
if ($tabela == "mensagens") $titulo = "Nova Mensagem";
inicioPagina($titulo, $tabela);
echo "<h1>" . $titulo . "</h1>";
formulario($tabela, "create.php", $dados, $erro);
fimPagina();
