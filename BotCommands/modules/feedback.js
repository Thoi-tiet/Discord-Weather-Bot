const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    Events
} = require("discord.js");
const { Pool } = require("pg");
// const { client } = require('../../bot.js');
require("dotenv").config();
const { admin_id } = require('./../../config.json');

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, // important for production, keep this in .env and not hardcoded
    // connectionString: process.env.DATABASE_URL,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false } // for secure connection to managed databases, adjust as needed
});

db.connect()
    .then(() => console.log("✅ [feedback] PostgreSQL connected."))
    .catch(console.error);

db.query(`
    CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`)
    .then(() => console.log("✅ [feedback] PostgreSQL ready."))
    .catch(console.error);

class Feedback {
    constructor() { }

    async feedback(interaction) {
        // save into  database
        // Implementation for saving feedback
        const user_id = interaction.user.id;
        const message = interaction.options.getString("message") + "\nCommand: " + interaction.options.getString("command");

        await db.query("INSERT INTO feedback (user_id, message) VALUES ($1, $2)", [user_id, message])
            .then(() => {
                console.log("Feedback saved successfully.");
            })
            .catch((error) => {
                console.error("Error saving feedback:", error);
            });
    }
}

module.exports = {
    Feedback
}