# AETHORIA

**Um mundo. Milhares de histórias.**

MVP de RPG medieval para navegador, iniciado com PHP + MySQL para hospedagem compartilhada InfinityFree.

## Fase entregue
- Estrutura PHP modular e rotas amigáveis.
- Cadastro, login e logout com sessões e CSRF.
- Criação/seleção de personagem e quatro vocações.
- Persistência MySQL via PDO.
- Landing page e prévia ilustrativa do mundo.
- Documentação inicial de arquitetura, banco, segurança e deploy.

**Ainda não implementado:** Phaser 3, mapa interativo, movimentação validada, combate, criaturas, inventário, quests, mercado e recursos sociais. Não são apresentados como concluídos.

## Instalação
1. PHP 8.1+ com PDO/pdo_mysql; MySQL/MariaDB com InnoDB.
2. Copie `config/app.example.php` para `config/app.php`.
3. Copie `config/database.example.php` para `config/database.php` e preencha os dados.
4. Importe `database/schema.sql` e `database/seeds/initial.sql`.
5. Configure o document root para `public/` e acesse o site.

Consulte `docs/DEPLOY_INFINITYFREE.md`. Nenhum teste com banco real ou publicação InfinityFree foi executado nesta entrega. Nunca publique credenciais reais.
