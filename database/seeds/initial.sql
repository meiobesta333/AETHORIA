INSERT INTO vocations(code,name,description,base_health,base_mana) VALUES ('knight','Cavaleiro','Resistência e combate corpo a corpo.',140,35),('sorcerer','Feiticeiro','Poder arcano e dano mágico.',75,140),('druid','Druida','Suporte, cura e magia natural.',90,125),('ranger','Patrulheiro','Precisão, distância e mobilidade.',100,80) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description);
INSERT INTO maps(code,name,width,height,recommended_level) VALUES ('elarion','Elarion',18,15,1),('sylvar','Floresta de Sylvar',24,20,2) ON DUPLICATE KEY UPDATE name=VALUES(name),width=VALUES(width);

INSERT INTO world_creatures(map_code,code,name,tile_x,tile_y,level,health,max_health,experience_reward) VALUES
('elarion','slime_green','Limo Verde',6,7,1,45,45,18),
('elarion','wolf_young','Lobo Jovem',10,8,2,65,65,28),
('elarion','thorn_beetle','Besouro Espinhoso',8,5,1,55,55,22)
ON DUPLICATE KEY UPDATE name=VALUES(name),tile_x=VALUES(tile_x),tile_y=VALUES(tile_y),level=VALUES(level),max_health=VALUES(max_health),experience_reward=VALUES(experience_reward);
