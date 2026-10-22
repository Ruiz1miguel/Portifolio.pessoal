<?php
// API em PHP: GET lista as mensagens, POST cadastra uma nova (JSON).

// CORS: permite que o fetch venha de outra origem (ex.: Live Server na porta 5500)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// O navegador envia um OPTIONS antes do POST com JSON (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require "conexao.php";

try {

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conexao->query("SELECT * FROM mensagens ORDER BY data_envio DESC, id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // O corpo chega como JSON, não em $_POST
        $dados = json_decode(file_get_contents("php://input"), true);

        $nome  = trim($dados['nome']  ?? '');
        $email = trim($dados['email'] ?? '');
        $texto = trim($dados['texto'] ?? '');

        if ($nome === '' || $email === '' || $texto === '') {
            http_response_code(400);
            echo json_encode(["erro" => "Preencha nome, e-mail e mensagem."]);
            exit;
        }

        $stmt = $conexao->prepare("INSERT INTO mensagens (nome, email, texto) VALUES (?, ?, ?)");
        $stmt->execute([$nome, $email, $texto]);

        $id = $conexao->lastInsertId();
        $stmt = $conexao->prepare("SELECT * FROM mensagens WHERE id = ?");
        $stmt->execute([$id]);

        http_response_code(201);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        exit;
    }

    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao acessar o banco de dados."]);
}
