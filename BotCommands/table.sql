CREATE TABLE guild_settings (
    guild_id VARCHAR(32) PRIMARY KEY,
    prefix VARCHAR(10) DEFAULT 'wt!'
);