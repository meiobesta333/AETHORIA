# Arquitetura

MVP assíncrono: navegador apresenta a interface, PHP processa requisições HTTP curtas e MySQL persiste estado. Sem simulação contínua no servidor. Camadas atuais: apresentação em public; roteamento em public/index.php; bootstrap/PDO em app/bootstrap.php; segurança em app/Security.php; controladores em app/Controllers; persistência MySQL/InnoDB.

Evolução: extrair regras para AuthService, CharacterService, MovementService, CombatService, InventoryService e QuestService. O domínio deve ser independente de HTTP e sessão para futura integração com servidor externo. Phaser 3 deverá ser incluído como runtime local compilado e publicado como asset estático; nenhum build na InfinityFree.
