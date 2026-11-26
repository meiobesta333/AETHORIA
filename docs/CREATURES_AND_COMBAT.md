# Criaturas e combate inicial

## Conteúdo
- Três criaturas fixas no Vale do Amanhecer: Limo Verde, Lobo Jovem e Besouro Espinhoso.
- Criaturas persistidas em `world_creatures`, com posição, nível, vida e recompensa de experiência.
- Ataque disponível quando o personagem está em uma célula ortogonal adjacente.
- Dano base por vocação; ao derrotar, a criatura tem vida zerada e concede XP uma única vez.
- O estado de vida das criaturas é compartilhado entre contas, pois fica no banco de dados.

## Segurança
- Movimento exige sessão autenticada, CSRF, passo ortogonal único, limites do mapa e célula não bloqueada calculada no servidor.
- Células ocupadas por criaturas vivas não podem ser atravessadas.
- Ataque exige personagem do usuário, criatura cadastrada e adjacência; as linhas são bloqueadas com `FOR UPDATE` durante a transação.
- O cliente só exibe os resultados retornados pelo servidor.

## Atualização de banco
- Instalação nova: importe `database/schema.sql` e depois `database/seeds/initial.sql`.
- Banco existente: execute uma vez `database/migrations/2026_11_26_world_creatures.sql`.

## Limitações
Combate é um protótipo PvE de um golpe por requisição, sem contra-ataque, respawn, animação, drops ou balanceamento final. O servidor valida a movimentação ortogonal e bloqueios procedurais; o atlas gráfico e multiplayer em tempo real continuam fora desta etapa.
