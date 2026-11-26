# Publicação InfinityFree

1. Crie site e banco MySQL no painel.
2. Anote host, nome, usuário e senha exatamente como exibidos; não presuma localhost.
3. Confira versão PHP e extensões PDO/pdo_mysql.
4. Copie config/app.example.php para config/app.php e config/database.example.php para config/database.php. Nunca comite os arquivos reais.
5. Importe database/schema.sql e database/seeds/initial.sql via phpMyAdmin.
6. Idealmente configure document root para public/, mantendo app/config/database fora da raiz web.
7. Se usar htdocs, envie apenas conteúdo de public para htdocs e mantenha pastas privadas fora dele, ajustando o bootstrap. Se isso não for possível, bloqueie acesso HTTP às pastas privadas e teste URLs sensíveis.
8. Envie arquivos pelo método permitido no painel e ative HTTPS quando disponível.
9. Teste cadastro, login, logout, criação e persistência de personagem.

Não usar Node.js, npm, WebSockets, Redis, workers, cron, SSH, processos persistentes ou polling abusivo. Build e testes ocorrem localmente. Publicação real ainda precisa ser validada no painel.
