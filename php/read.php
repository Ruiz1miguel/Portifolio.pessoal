<?php
require "conexao.php";

$stmt = $conexao->query("SELECT * FROM mensagens ORDER BY data_envio DESC");
$mensagens = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensagens Recebidas</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>

    <header>
        <h1>Painel de Mensagens</h1>
        <nav>
            <a href="../index.html">Voltar ao Site</a>
        </nav>
    </header>

    <main class="painel">

        <h1>Mensagens Recebidas (<?= count($mensagens) ?>)</h1>

        <table class="tabela-mensagens">
            <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Mensagem</th>
                <th>Data</th>
                <th>Ações</th>
            </tr>

            <?php if (count($mensagens) === 0): ?>
            <tr>
                <td colspan="5" class="sem-registros">Nenhuma mensagem recebida ainda.</td>
            </tr>
            <?php else: ?>

                <?php foreach ($mensagens as $msg): ?>
                <tr>
                    <td><?= htmlspecialchars($msg['nome']) ?></td>
                    <td><?= htmlspecialchars($msg['email']) ?></td>
                    <td><?= htmlspecialchars($msg['texto']) ?></td>
                    <td><?= $msg['data_envio'] ?></td>
                    <td>
                        <div class="acoes">
                            <a class="btn btn-editar" href="editar.php?id=<?= $msg['id'] ?>">Editar</a>
                            <a class="btn btn-excluir" href="deletar.php?id=<?= $msg['id'] ?>" onclick="return confirm('Tem certeza que deseja excluir esta mensagem?')">Excluir</a>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>

            <?php endif; ?>
        </table>

    </main>

    <footer>
        <p>&copy; 2026 Miguel Guimarães Ruiz Santos. Todos os direitos reservados.</p>
    </footer>

</body>
</html>