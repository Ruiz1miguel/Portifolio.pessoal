<?php
// READ: mostra os registros cadastrados no painel.
include "conexao.php";
if ($tabela == "projetos") {
    $stmt = $conexao->query("SELECT * FROM projetos");
} else {
    $stmt = $conexao->query("SELECT * FROM mensagens");
}
$linhas = $stmt->fetchAll();
$titulo = "Projetos Cadastrados";
$novo = "Novo Projeto";
if ($tabela == "mensagens") {
    $titulo = "Mensagens Recebidas";
    $novo = "Nova Mensagem";
}
// Resumo com os registros ja consultados e a contagem da outra tabela.
$consultaProjetos = $conexao->query("SELECT * FROM projetos");
$totalProjetos = 0;
foreach ($consultaProjetos->fetchAll() as $projetoContado) {
    $totalProjetos = $totalProjetos + 1;
}
$consultaMensagens = $conexao->query("SELECT * FROM mensagens");
$totalMensagens = 0;
foreach ($consultaMensagens->fetchAll() as $mensagemContada) {
    $totalMensagens = $totalMensagens + 1;
}
$totalLinhas = 0;
foreach ($linhas as $linhaContada) {
    $totalLinhas = $totalLinhas + 1;
}
inicioPagina($titulo, $tabela);
?>
<p class="sobretitulo">GERENCIAMENTO DO PORTFÓLIO</p>
<div class="resumo-painel">
    <div class="resumo-item"><strong><?php echo $totalProjetos; ?></strong><span>Projetos cadastrados</span></div>
    <div class="resumo-item"><strong><?php echo $totalMensagens; ?></strong><span>Mensagens recebidas</span></div>
</div>
<?php
if (isset($_GET["sucesso"])) {
    if ($_GET["sucesso"] == "cadastrado") echo '<p class="status ok">Registro cadastrado com sucesso!</p>';
    if ($_GET["sucesso"] == "editado") echo '<p class="status ok">Registro atualizado com sucesso!</p>';
    if ($_GET["sucesso"] == "excluido") echo '<p class="status ok">Registro excluído com sucesso!</p>';
}
?>
<h1><?php echo $titulo; ?></h1>
<p class="intro-secao"><?php echo $totalLinhas; ?> registro(s) encontrado(s). Gerencie os dados abaixo.</p>
<p><a class="btn btn-salvar" href="create.php?tabela=<?php echo $tabela; ?>">+ <?php echo $novo; ?></a></p>
<br>
<div class="tabela-rolagem"><table class="tabela-mensagens">
<tr>
<?php if ($tabela == "projetos") { ?>
    <th>Título</th><th>Descrição</th><th>Tecnologias</th><th>Git</th>
<?php } else { ?>
    <th>Nome</th><th>E-mail</th><th>Mensagem</th><th>Data</th>
<?php } ?>
<th>Ações</th>
</tr>
<?php if ($totalLinhas == 0) { ?>
<tr><td colspan="5" class="sem-registros">Nenhum registro cadastrado ainda.</td></tr>
<?php } ?>
<?php foreach ($linhas as $linha) { ?>
<tr>
<?php if ($tabela == "projetos") { ?>
    <td><?php echo limpar($linha["titulo"]); ?></td>
    <td><?php echo limpar($linha["descricao"]); ?></td>
    <td><?php echo limpar($linha["tecnologias"]); ?></td>
    <td><a href="<?php echo limpar($linha["link_git"]); ?>" target="_blank" rel="noopener noreferrer">Repositório</a></td>
<?php } else { ?>
    <td><?php echo limpar($linha["nome"]); ?></td>
    <td><?php echo limpar($linha["email"]); ?></td>
    <td><?php echo limpar($linha["texto"]); ?></td>
    <td><?php echo limpar($linha["data_envio"]); ?></td>
<?php } ?>
<td><div class="acoes">
    <a class="btn btn-editar" href="update.php?tabela=<?php echo $tabela; ?>&id=<?php echo $linha["id"]; ?>">Editar</a>
    <form method="POST" action="delete.php" class="form-inline" onsubmit="return confirm('Tem certeza que deseja excluir?')">
        <input type="hidden" name="tabela" value="<?php echo $tabela; ?>">
        <input type="hidden" name="id" value="<?php echo $linha["id"]; ?>">
        <button type="submit" class="btn btn-excluir">Excluir</button>
    </form>
</div></td>
</tr>
<?php } ?>
</table></div>
<?php fimPagina(); ?>
