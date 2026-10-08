<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require "conexao.php";

$stmt = $conexao->prepare(
    "INSERT INTO mensagens (nome, email, texto)
     VALUES (?, ?, ?)"
);

$stmt->execute([$_POST["nome"], $_POST["email"], $_POST["texto"]]);

header("Location: ../pages/contato.html?enviado=1");
exit;

?>