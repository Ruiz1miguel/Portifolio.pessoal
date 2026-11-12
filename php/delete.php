<?php
// DELETE: remove o registro selecionado no painel.
include "conexao.php";
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["id"])) {
    $id = (int) $_POST["id"];
    if ($tabela == "projetos") {
        $stmt = $conexao->prepare("DELETE FROM projetos WHERE id = ?");
    } else {
        $stmt = $conexao->prepare("DELETE FROM mensagens WHERE id = ?");
    }
    $stmt->execute([$id]);
}
header("Location: read.php?tabela=" . $tabela . "&sucesso=excluido");
exit;
