<?php
require "conexao.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conexao->prepare("UPDATE mensagens SET nome = ?, email = ?, texto = ? WHERE id = ?");
    $stmt->execute([$_POST['nome'], $_POST['email'], $_POST['texto'], $_POST['id']]);
    header("Location: read.php");
    exit;
}

$id = $_GET['id'];
$stmt = $conexao->prepare("SELECT * FROM mensagens WHERE id = ?");
$stmt->execute([$id]);
$msg = $stmt->fetch(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Mensagem</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>

    <header>
        <h1>Editar Mensagem</h1>
        <nav>
            <a href="read.php">Voltar</a>
        </nav>
    </header>

    <main class="painel">

        <form class="form-editar" method="POST">
            <input type="hidden" name="id" value="<?= $msg['id'] ?>">

            <label for="nome">Nome:</label>
            <input type="text" id="nome" name="nome" value="<?= htmlspecialchars($msg['nome']) ?>">

            <label for="email">E-mail:</label>
            <input type="email" id="email" name="email" value="<?= htmlspecialchars($msg['email']) ?>">

            <label for="texto">Mensagem:</label>
            <textarea id="texto" name="texto"><?= htmlspecialchars($msg['texto']) ?></textarea>

            <div class="acoes-form">
                <button type="submit" class="btn btn-salvar">Salvar Alterações</button>
                <a class="btn btn-voltar" href="read.php">Cancelar</a>
            </div>
        </form>

    </main>

    <footer>
        <p>&copy; 2026 Miguel Guimarães Ruiz Santos. Todos os direitos reservados.</p>
    </footer>

</body>
</html>