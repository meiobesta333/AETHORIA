# Estado do mundo jogável — Elarion

## Implementado
- Mapa isométrico 2:1 em Canvas 2D, grade 18 × 15.
- Terreno procedural, caminho, árvores e rochas.
- Movimento por WASD, setas e controles na tela.
- Posição carregada e salva em `characters.tile_x/tile_y`.
- Endpoint de movimento autenticado com CSRF, validação de passo ortogonal, limites, obstáculos e células ocupadas por criaturas.
- Três criaturas PvE persistidas em `world_creatures`.
- Ataque adjacente com dano por vocação, transação SQL e recompensa de XP uma única vez ao derrotar a criatura.
- O estado de vida dos monstros é compartilhado entre jogadores.

## Atualização do banco
Para instalação nova, importar `database/schema.sql` e depois `database/seeds/initial.sql`.
Para banco criado na versão anterior, executar uma vez `database/migrations/2026_11_26_world_creatures.sql`.

## Limitações
- Arte e criaturas são desenhadas proceduralmente; o atlas conceitual ainda não está integrado.
- Combate é um protótipo: sem contra-ataque, IA, respawn, drops, animações ou balanceamento.
- Não há multiplayer em tempo real, inventário, missões ou sistemas sociais.
- Não foram executados testes de integração em PHP/MySQL nem na InfinityFree.

## Compatibilidade
PHP + MySQL + Canvas 2D + Fetch API. Não exige Node.js, WebSocket, daemon ou cron.
