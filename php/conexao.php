<?php

$conexao = new PDO(
    "mysql:host=localhost;dbname=portifolio_pessoal",
    "root",
    ""
);

$conexao->setAttribute(
    PDO::ATTR_ERRMODE,
    PDO::ERRMODE_EXCEPTION
);

?>