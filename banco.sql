-- =====================================================
-- banco.sql - banco de dados completo do portfólio
-- Lido manualmente por php/conexao.php (não apague).
-- Cria o banco e todas as tabelas. Pode rodar mais de uma
-- vez: nada é apagado (usa IF NOT EXISTS).
--
-- =====================================================

CREATE DATABASE IF NOT EXISTS `portifolio_pessoal`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `portifolio_pessoal`;

-- Mensagens do formulário de contato
CREATE TABLE IF NOT EXISTS `mensagens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `texto` text DEFAULT NULL,
  `data_envio` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Projetos (CRUD com link do Git)
CREATE TABLE IF NOT EXISTS `projetos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(120) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tecnologias` varchar(200) DEFAULT NULL,
  `link_git` varchar(255) NOT NULL,
  `data_criacao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
