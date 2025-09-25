const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function getGuildSettings(guildId) {
    const [rows] = await db.query("SELECT * FROM guild_settings WHERE guild_id = ?", [guildId]);
    if (rows.length === 0) {
        await db.query("INSERT INTO guild_settings (guild_id) VALUES (?)", [guildId]);
        return { prefix: 'w!' };
    }
    return rows[0];
}

async function setGuildPrefix(guildId, prefix) {
    await db.query("UPDATE guild_settings SET prefix = ? WHERE guild_id = ?", [prefix, guildId]);
}

module.exports = {
    db,
    getGuildSettings,
    setGuildPrefix
}