const {
    Client,
    Events,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {
    guild_create(client) {
        client.on(Events.GuildCreate, async guild => {
            guild.systemChannel?.send(`👋 Cảm ơn bạn đã thêm ${client.user.username} vào server của bạn! Sử dụng lệnh \`/help\` để xem danh sách các lệnh của mình nhé!`);
            // Khi bot được thêm vào server mới, gửi DM cho owner
            try {
                const owner = await guild.fetchOwner();
                const guildCreate_embed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle(`👋 Cảm ơn bạn đã thêm ${client.user.username} vào server của bạn!`)
                    .setDescription(`Sử dụng lệnh \`/help\` để xem danh sách các lệnh của mình nhé!
        Nếu bạn thích bot, bạn có thể ủng hộ mình qua Patreon hoặc BuyMeACoffee để giúp bot phát triển hơn nữa!`)
                    .setFooter({ text: 'Dev by <@1372581695328620594> (@therealnhan)' })
                    .setTimestamp()
                await owner.send({ embeds: [guildCreate_embed] });
                const voteButton = new ButtonBuilder()
                    .setLabel('Vote trên top.gg')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://top.gg/bot/${topgg_botid}/vote`)
                    .setEmoji('⭐');
                const donate_btn = new ButtonBuilder()
                    .setLabel('Ủng hộ qua Patreon')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.patreon.com/${patreon_id}`)
                    .setEmoji('💖');
                const buymeacoffee_btn = new ButtonBuilder()
                    .setLabel('Mời mình một ly cà phê')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.buymeacoffee.com/${buymeacoffee_id}`)
                    .setEmoji('☕');
                const row = new ActionRowBuilder()
                    .addComponents(voteButton, donate_btn, buymeacoffee_btn);
                // nếu đợi lâu quá thì disable nút
                setTimeout(async () => {
                    const disabledRow = new ActionRowBuilder()
                        .addComponents(voteButton.setDisabled(true), donate_btn.setDisabled(true), buymeacoffee_btn.setDisabled(true));
                    owner.edit({ embeds: [guildCreate_embed], components: [disabledRow] });
                }, 60000); // 1 phút
                owner.send({ embeds: [guildCreate_embed], components: [row] });
            } catch (error) {
                console.error(`Không thể gửi tin nhắn cho chủ server: ${error}`);
            }
        });
    }
}