# AETHORIA

**Um mundo. Milhares de histórias.**

MVP de RPG medieval para navegador, iniciado com PHP + MySQL para hospedagem compartilhada InfinityFree.

## Fase entregue
- Estrutura PHP modular e rotas amigáveis.
- Cadastro, login e logout com sessões e CSRF.
- Criação/seleção de personagem e quatro vocações.
- Persistência MySQL via PDO.
- Landing page e mapa isométrico inicial de Elarion em Canvas 2D.
- Movimento por WASD, setas e controles direcionais na tela.
- Salvamento autenticado da posição do personagem no MySQL.
- Criaturas PvE persistidas no banco e combate adjacente com recompensa de experiência.
- NPC Ancião Aldren com interação validada por proximidade.
- Primeira missão PvE persistente: derrotar o Limo Verde e reivindicar 35 XP.
- Validação de movimento no servidor: passo único, limites, obstáculos e células ocupadas.
- Documentação inicial de arquitetura, banco, segurança e deploy.

**Ainda não implementado:** Phaser 3, multiplayer em tempo real, combate avançado, IA de criaturas, respawn, inventário, cadeias de missões, mercado e recursos sociais. O mapa atual é uma primeira versão procedural em Canvas 2D, não o atlas final de sprites.

## Instalação
1. PHP 8.1+ com PDO/pdo_mysql; MySQL/MariaDB com InnoDB.
2. Copie `config/app.example.php` para `config/app.php`.
3. Copie `config/database.example.php` para `config/database.php` e preencha os dados.
4. Importe `database/schema.sql` e `database/seeds/initial.sql`.
5. Configure o document root para `public/` e acesse o site.

Para atualizar um banco criado na versão anterior, execute em ordem e uma única vez `database/migrations/2026_11_26_world_creatures.sql` e `database/migrations/2026_11_26_npcs_quests.sql`.

Consulte `docs/DEPLOY_INFINITYFREE.md`. Nenhum teste com banco real ou publicação InfinityFree foi executado nesta entrega. Nunca publique credenciais reais.
