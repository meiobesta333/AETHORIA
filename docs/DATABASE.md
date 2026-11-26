# Banco de dados

Importe database/schema.sql e depois database/seeds/initial.sql pelo phpMyAdmin. Tabelas atuais: users, vocations, maps e characters. InnoDB, utf8mb4, chaves estrangeiras e índices básicos. PDO usa prepared statements e desativa emulação.

Schema usa CREATE TABLE IF NOT EXISTS para evitar apagar dados em reimportação. Evoluções devem usar migrations versionadas e não destrutivas.
