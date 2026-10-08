<?php
require "conexao.php";

$id = $_GET['id'];

$stmt = $conexao->prepare("DELETE FROM mensagens WHERE id = ?");
$stmt->execute([$id]);

header("Location: read.php");
exit;