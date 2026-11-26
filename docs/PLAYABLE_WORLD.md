# Estado do mundo jogável — Elarion

## Implementado nesta etapa
- Mapa isométrico 2:1 desenhado proceduralmente em Canvas 2D, sem dependência de build ou bibliotecas externas.
- Grade de 18 × 15 células com terreno, caminho central, árvores e rochas.
- Movimento por WASD, setas e controles direcionais na tela.
- Bloqueio local de células ocupadas por árvores e rochas.
- Posição inicial lida da tabela `characters` e persistida em `tile_x` / `tile_y`.
- Endpoint PHP `POST /game/move`, autenticado, com token CSRF e atualização restrita ao personagem pertencente ao usuário.
- Layout responsivo básico.

## Limitações conhecidas
- O mapa é uma demonstração procedural; não usa ainda o atlas conceitual como spritesheet.
- O servidor valida limites da grade e propriedade do personagem, mas colisões ainda são verificadas no cliente. Antes de PvP ou economia, a movimentação deverá migrar para validação autoritativa no servidor.
- Não há sincronização multiplayer em tempo real, combate, NPCs ou persistência de mundo compartilhado.
- Não foi executado teste de integração com PHP/MySQL nem hospedagem InfinityFree nesta alteração.

## Compatibilidade de hospedagem
A implementação usa PHP, MySQL, sessão, PDO, Canvas 2D e Fetch API. Não exige Node.js, WebSocket, daemon, cron ou processo persistente.