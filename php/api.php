<?php
// Retorna dados do MySQL em JSON para as paginas HTML (fetch do 4o bimestre).
include "conexao.php";
header("Content-Type: application/json; charset=utf-8");
if ($tabela == "mensagens") {
    $consulta = $conexao->query("SELECT * FROM mensagens");
} else {
    $consulta = $conexao->query("SELECT * FROM projetos");
}
echo json_encode($consulta->fetchAll());
