-- AETHORIA: NPCs e primeira missão PvE. Executar uma vez em bancos existentes.
CREATE TABLE IF NOT EXISTS world_npcs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 map_code VARCHAR(40) NOT NULL,
 code VARCHAR(40) NOT NULL,
 name VARCHAR(60) NOT NULL,
 tile_x SMALLINT UNSIGNED NOT NULL,
 tile_y SMALLINT UNSIGNED NOT NULL,
 dialogue VARCHAR(255) NOT NULL,
 UNIQUE KEY uq_npc_map_code(map_code,code),
 CONSTRAINT fk_npc_map FOREIGN KEY(map_code) REFERENCES maps(code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quests (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 code VARCHAR(40) NOT NULL UNIQUE,
 npc_code VARCHAR(40) NOT NULL,
 title VARCHAR(100) NOT NULL,
 description VARCHAR(255) NOT NULL,
 target_creature_code VARCHAR(40) NOT NULL,
 target_count SMALLINT UNSIGNED NOT NULL DEFAULT 1,
 reward_experience INT UNSIGNED NOT NULL DEFAULT 25
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS character_quests (
 character_id BIGINT UNSIGNED NOT NULL,
 quest_id BIGINT UNSIGNED NOT NULL,
 status ENUM('accepted','completed','claimed') NOT NULL DEFAULT 'accepted',
 progress SMALLINT UNSIGNED NOT NULL DEFAULT 0,
 accepted_at DATETIME NOT NULL,
 completed_at DATETIME NULL,
 claimed_at DATETIME NULL,
 PRIMARY KEY(character_id,quest_id),
 CONSTRAINT fk_character_quest_character FOREIGN KEY(character_id) REFERENCES characters(id) ON DELETE CASCADE,
 CONSTRAINT fk_character_quest_quest FOREIGN KEY(quest_id) REFERENCES quests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO world_npcs(map_code,code,name,tile_x,tile_y,dialogue)
VALUES ('elarion','elder_aldren','Ancião Aldren',5,8,'O vale está inquieto. Um limo verde ameaça os viajantes. Ajude-nos e será recompensado.')
ON DUPLICATE KEY UPDATE name=VALUES(name),tile_x=VALUES(tile_x),tile_y=VALUES(tile_y),dialogue=VALUES(dialogue);

INSERT INTO quests(code,npc_code,title,description,target_creature_code,target_count,reward_experience)
VALUES ('green_threat','elder_aldren','A ameaça verde','Derrote o Limo Verde que ronda o Vale do Amanhecer.', 'slime_green',1,35)
ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),target_creature_code=VALUES(target_creature_code),target_count=VALUES(target_count),reward_experience=VALUES(reward_experience);
