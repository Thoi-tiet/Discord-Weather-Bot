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
require("dotenv").config();

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, // important for production, keep this in .env and not hardcoded
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // for secure connection to managed databases, adjust as needed
});

db.connect()
    .then(() => console.log("✅ [report] PostgreSQL connected."))
    .catch(console.error);

db.query(`
  CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    username TEXT,
    command TEXT,
    query TEXT,
    description TEXT,
    timestamp TEXT
  );
`)
    .then(() => console.log("✅ [report] PostgreSQL ready."))
    .catch(console.error);

class WeatherReport {
    constructor() { }

    // 🧱 Tạo nút báo cáo
    createReportButton(command, query) {
        const button = new ButtonBuilder()
            .setCustomId(`report_weather_${command}_${query}`)
            .setLabel("📢 Báo sai thời tiết")
            .setStyle(ButtonStyle.Danger);
        return new ActionRowBuilder().addComponents(button);
    }

    // ⚙️ Gắn listener xử lý vào client
    attach(client, adminChannelId = null) {
        client.on(Events.InteractionCreate, async (interaction) => {
            // --- Khi người dùng bấm nút ---
            if (interaction.isButton() && interaction.customId.startsWith("report_weather_")) {
                const parts = interaction.customId.split("_");
                const command = parts[2];
                const query = decodeURIComponent(parts.slice(3).join("_"));

                const shortQuery = query.length > 20 ? query.slice(0, 20) + "…" : query;

                const modal = new ModalBuilder()
                    .setCustomId(`report_${command}_${shortQuery}`)
                    .setTitle(`Báo sai thời tiết (${shortQuery})`);


                const descInput = new TextInputBuilder()
                    .setCustomId("report_description")
                    .setLabel("Mô tả vấn đề bạn gặp phải")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("Ví dụ: Dự báo sai, nhiệt độ lệch nhiều, v.v.")
                    .setRequired(true);

                const row = new ActionRowBuilder().addComponents(descInput);
                modal.addComponents(row);

                await interaction.showModal(modal);
            }

            // --- Khi người dùng gửi form ---
            else if (interaction.isModalSubmit() && interaction.customId.startsWith("report_modal_")) {
                const parts = interaction.customId.split("_");
                const command = parts[2];
                const query = decodeURIComponent(parts.slice(3).join("_"));
                const description = interaction.fields.getTextInputValue("report_description");
                const timestamp = new Date().toISOString();

                db.query(
                    `INSERT INTO reports (username, command, query, description, timestamp)
VALUES ($1, $2, $3, $4, $5)`,
                    [interaction.user.tag, command, query, description, timestamp],
                    async (err) => {
                        if (err) {
                            console.error("❌ Lỗi lưu report:", err);
                            return interaction.reply({ content: "⚠️ Có lỗi khi lưu báo cáo!", ephemeral: true });
                        }

                        await interaction.reply({
                            content: `✅ Cảm ơn **${interaction.user.username}**! Báo cáo về **${query}** đã được ghi nhận.`,
                            ephemeral: true,
                        });

                        // --- Gửi về channel admin nếu có ---
                        if (adminChannelId) {
                            const embed = new EmbedBuilder()
                                .setColor(0xff5555)
                                .setTitle("📢 Báo cáo sai dữ liệu thời tiết")
                                .addFields(
                                    { name: "👤 Người gửi", value: interaction.user.tag, inline: true },
                                    { name: "🧭 Lệnh", value: command, inline: true },
                                    { name: "🌍 Truy vấn", value: query, inline: true },
                                    { name: "📝 Nội dung", value: description }
                                )
                                .setTimestamp();

                            const channel = client.channels.cache.get(adminChannelId);
                            if (channel) channel.send({ embeds: [embed] });
                        }
                        console.log(`✅ Báo cáo mới từ ${interaction.user.tag} về ${query}: ${description}`);
                    }
                );
            }
        });
    }
}
module.exports = {
    WeatherReport
};