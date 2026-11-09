<?php
// UPDATE: carrega um registro e salva as alteracoes.
include "conexao.php";
$erro = "";
$id = 0;
if (isset($_GET["id"])) $id = (int) $_GET["id"];
if (isset($_POST["id"])) $id = (int) $_POST["id"];
if ($id <= 0) {
    header("Location: read.php?tabela=" . $tabela);
    exit;
}
if ($tabela == "projetos") {
    $stmt = $conexao->prepare("SELECT * FROM projetos WHERE id = ?");
} else {
    $stmt = $conexao->prepare("SELECT * FROM mensagens WHERE id = ?");
}
$stmt->execute([$id]);
$dados = $stmt->fetch();
if (!$dados) {
    header("Location: read.php?tabela=" . $tabela);
    exit;
}
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if ($tabela == "projetos") {
        $dados["titulo"] = trim($_POST["titulo"]);
        $dados["descricao"] = trim($_POST["descricao"]);
        $dados["tecnologias"] = trim($_POST["tecnologias"]);
        $dados["link_git"] = trim($_POST["link_git"]);
        if ($dados["titulo"] == "" || $dados["link_git"] == "") $erro = "Preencha todos os campos obrigatórios.";
        if ($erro == "") {
            $stmt = $conexao->prepare("UPDATE projetos SET titulo = ?, descricao = ?, tecnologias = ?, link_git = ? WHERE id = ?");
            $stmt->execute([$dados["titulo"], $dados["descricao"], $dados["tecnologias"], $dados["link_git"], $id]);
        }
    } else {
        $dados["nome"] = trim($_POST["nome"]);
        $dados["email"] = trim($_POST["email"]);
        $dados["texto"] = trim($_POST["texto"]);
        if ($dados["nome"] == "" || $dados["email"] == "" || $dados["texto"] == "") $erro = "Preencha todos os campos obrigatórios.";
        if ($dados["email"] != "" && !filter_var($dados["email"], FILTER_VALIDATE_EMAIL)) $erro = "Informe um e-mail válido.";
        if ($erro == "") {
            $stmt = $conexao->prepare("UPDATE mensagens SET nome = ?, email = ?, texto = ? WHERE id = ?");
            $stmt->execute([$dados["nome"], $dados["email"], $dados["texto"], $id]);
        }
    }
    if ($erro == "") {
        header("Location: read.php?tabela=" . $tabela . "&sucesso=editado");
        exit;
    }
}
$titulo = "Editar Projeto";
if ($tabela == "mensagens") $titulo = "Editar Mensagem";
inicioPagina($titulo, $tabela);
echo "<h1>" . $titulo . "</h1>";
formulario($tabela, "update.php", $dados, $erro);
fimPagina();
