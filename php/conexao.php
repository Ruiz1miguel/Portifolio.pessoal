<?php
// Conexao PDO como na apostila do 3o bimestre.
// Antes de usar, importe banco.sql pelo phpMyAdmin.
$conexao = new PDO("mysql:host=127.0.0.1;dbname=portifolio_pessoal;charset=utf8mb4", "root", "root");
$conexao->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Somente duas tabelas conhecidas; nunca usar diretamente um nome enviado pelo usuario.
$tabela = "projetos";
if (isset($_GET["tabela"]) && $_GET["tabela"] == "mensagens") {
    $tabela = "mensagens";
}
if (isset($_POST["tabela"]) && $_POST["tabela"] == "mensagens") {
    $tabela = "mensagens";
}

function limpar($valor) {
    return htmlspecialchars($valor);
}

function inicioPagina($titulo, $tabela) {
    ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo limpar($titulo); ?> - Painel</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<header>
    <h1><a href="../index.html">Miguel Guimarães Ruiz Santos</a></h1>
    <nav>
        <a href="../index.html">Início</a>
        <a href="../pages/sobre.html">Sobre</a>
        <a href="../pages/projetos.html">Projetos</a>
        <a href="../pages/contato.html">Contato</a>
        <a href="read.php" class="ativo" aria-current="page">Painel</a>
    </nav>
</header>
<main class="painel">
<div class="abas">
    <a href="read.php?tabela=projetos" <?php if ($tabela == "projetos") echo 'class="ativo"'; ?>>Projetos</a>
    <a href="read.php?tabela=mensagens" <?php if ($tabela == "mensagens") echo 'class="ativo"'; ?>>Mensagens</a>
</div>
<?php
}

function fimPagina() {
    ?>
</main>
<footer><p>&copy; 2026 Miguel Guimarães Ruiz Santos. Todos os direitos reservados.</p></footer>
</body>
</html>
<?php
}

function formulario($tabela, $destino, $dados, $erro) {
    if ($erro != "") echo '<p class="status erro">' . limpar($erro) . '</p>';
    ?>
<form class="form-editar" method="POST" action="<?php echo $destino; ?>">
    <input type="hidden" name="tabela" value="<?php echo $tabela; ?>">
    <input type="hidden" name="id" value="<?php echo limpar($dados["id"]); ?>">
    <?php if ($tabela == "projetos") { ?>
        <label for="titulo">Título:</label>
        <input type="text" id="titulo" name="titulo" maxlength="120" required value="<?php echo limpar($dados["titulo"]); ?>">
        <label for="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao"><?php echo limpar($dados["descricao"]); ?></textarea>
        <label for="tecnologias">Tecnologias:</label>
        <input type="text" id="tecnologias" name="tecnologias" maxlength="200" placeholder="PHP, MySQL, JavaScript" value="<?php echo limpar($dados["tecnologias"]); ?>">
        <label for="link_git">Link do Git:</label>
        <input type="url" id="link_git" name="link_git" maxlength="255" placeholder="https://github.com/usuario/repositorio" required value="<?php echo limpar($dados["link_git"]); ?>">
    <?php } else { ?>
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" maxlength="100" required value="<?php echo limpar($dados["nome"]); ?>">
        <label for="email">E-mail:</label>
        <input type="email" id="email" name="email" maxlength="100" required value="<?php echo limpar($dados["email"]); ?>">
        <label for="texto">Mensagem:</label>
        <textarea id="texto" name="texto" required><?php echo limpar($dados["texto"]); ?></textarea>
    <?php } ?>
    <div class="acoes-form">
        <button type="submit" class="btn btn-salvar">Salvar</button>
        <a class="btn btn-voltar" href="read.php?tabela=<?php echo $tabela; ?>">Cancelar</a>
    </div>
</form>
<?php
}
