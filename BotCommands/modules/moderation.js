const {
    Client,
    Events,
    PermissionsBitField
} = require("discord.js");

const { topgg_botid, buymeacoffee_id, patreon_id, react_emoji, prefix } = require('./../../config.json');

const OWNER_SERVERS = process.env.OWNER_SERVERS.split(",").map(id => id.trim());


module.exports = {
    execute(client) {
        client.on(Events.MessageCreate, async (msg) => {
            // Tránh lặp lại tin nhắn trong vòng 1 giây
            const recentMessages = new Set();
            if (recentMessages.has(msg.content)) {
                return;
            }
            recentMessages.add(msg.content);
            setTimeout(() => recentMessages.delete(msg.content), 1000);
            let lwrcase_msg = msg.content.toLowerCase();
            // Kích hoạt khi có người ping bot @Thời tiết
            if (msg.mentions.has(client.user)) {
                // Check xem có những permissions cần thiết không: SEND_MESSAGES, SEND_MESSAGES_IN_THREADS, EMBED_LINKS, USE_EXTERNAL_EMOJIS, USE_SLASH_COMMANDS, READ_MESSAGE_HISTORY
                const requiredPermissions = [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.SendMessagesInThreads,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.UseExternalEmojis,
                    PermissionsBitField.Flags.UseApplicationCommands,
                    PermissionsBitField.Flags.ReadMessageHistory
                ];
                const botMember = await msg.guild.members.fetchMe();
                if (!botMember.permissions.has(requiredPermissions)) {
                    // Nếu không có quyền, gửi DM cho chủ server nếu có thể
                    const owner = await msg.guild.fetchOwner();
                    try {
                        await owner.send(`⚠️ Mình không có đủ quyền trong server **${msg.guild.name}** để hoạt động đúng cách.\nVui lòng cấp cho mình các quyền sau: ${requiredPermissions.map(perm => `\`${PermissionsBitField.Flags[perm]}\``).join(', ')}.`);
                        console.log(`Thiếu quyền: ${requiredPermissions.map(perm => `\`${PermissionsBitField.Flags[perm]}\``).join(', ')}`);
                    } catch (error) {
                        console.error(`Không thể gửi tin nhắn cho chủ server: ${error}`);
                    }
                }
                msg.react(react_emoji).catch(console.error);
                return msg.reply(`👋 Chào bạn **${msg.author.username}**! Sử dụng lệnh \`/help\` để xem danh sách các lệnh của mình nhé!`);
            }
            if (!msg.guild || msg.author.bot || !lwrcase_msg.startsWith(prefix)) return;
            const isOwnerServer = OWNER_SERVERS.includes(msg.guild.id);
            if (isOwnerServer) {
                // Further moderation logic can be added here
                const args = lwrcase_msg.slice(prefix.length).trim().split(/ +/);
                const cmd = args.shift().toLowerCase();

                if (cmd === "clear" || cmd === "delete" || cmd === "del") {
                    if (!msg.member.permissions.has("ManageMessages"))
                        return msg.reply("❌ Bạn không có quyền xóa tin nhắn!");
                    const count = parseInt(args[0]);
                    if (isNaN(count) || count < 1 || count > 1000)
                        return msg.reply("⚠️ Hãy nhập số lượng tin nhắn (1–1000).");
                    try {
                        await msg.channel.bulkDelete(count + 1, true);
                        // xóa tin nhắn xong rồi mới log channel
                        const confirm = await msg.channel.send(`✅ Đã xóa ${count} tin nhắn.`);
                        // setTimeout(() => confirm.delete().catch(() => { }), 5000);
                    } catch (error) {
                        console.error("Lỗi khi xóa tin nhắn:", error);
                        return setTimeout(() => msg.reply("❌ Có lỗi xảy ra khi xóa tin nhắn."), 1000);
                    }
                }

                if (cmd === "ban") {
                    if (!msg.member.permissions.has("BanMembers"))
                        return msg.reply("❌ Bạn không có quyền ban thành viên!");
                    const member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
                    if (!member) return msg.reply("⚠️ Hãy mention người cần ban.");
                    await member.ban({ reason: "Bị ban bởi bot." });
                    return msg.channel.send(`🚫 **${member.user.tag}** đã bị ban.`);
                }

                if (cmd === "unban") {
                    if (!msg.member.permissions.has("BanMembers")) {
                        return msg.reply("❌ Bạn không có quyền unban thành viên!");
                    }
                    const userId = args[0];
                    if (!userId) return msg.reply("⚠️ Vui lòng nhập ID người dùng cần unban!")
                    try {
                        await msg.guild.members.unban(userId);
                        return msg.channel.send(`✅ Đã gỡ ban cho người dùng **<@${userId}>**`);
                    } catch (err) {
                        console.error("Lỗi khi gỡ ban người dùng:", err);
                        return msg.reply("❌ Có lỗi xảy ra khi gỡ ban người dùng.");
                    }
                }

                if (cmd === "kick") {
                    if (!msg.member.permissions.has("KickMembers"))
                        return msg.reply("❌ Bạn không có quyền kick thành viên!");
                    const member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
                    if (!member) return msg.reply("⚠️ Hãy mention người cần kick.");
                    await member.kick({ reason: "Bị kick bởi bot." });
                    return msg.channel.send(`👢 **${member.user.tag}** đã bị kick.`);
                }
                // Mute command with duration can be added here
                if (cmd === "mute") {
                    if (!msg.member.permissions.has("MuteMembers"))
                        return msg.reply("❌ Bạn không có quyền mute thành viên!");
                    const member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
                    if (!member) return msg.reply("⚠️ Hãy mention người cần mute.");
                    const duration = parseInt(args[1]) || 10;
                    await member.timeout(duration * 1000, "Bị mute bởi bot.");
                    return msg.channel.send(`🔇 **${member.user.tag}** đã bị mute trong ${duration} giây.`);
                }
                if (cmd === "unmute") {
                    if (!msg.member.permissions.has("MuteMembers"))
                        return msg.reply("❌ Bạn không có quyền unmute thành viên!");
                    const member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
                    if (!member) return msg.reply("⚠️ Vui lòng mention hoặc nhập ID thành viên cần unmute!");
                    try {
                        await member.timeout(null, "Được unmute bởi bot.");
                        return msg.channel.send(`🔊 **${member.user.tag}** đã được unmute.`);
                    } catch (err) {
                        console.error(err);
                        return msg.reply("❌ Có lỗi xảy ra khi unmute thành viên.");
                    }
                } else {
                    // Ignore messages from non-owner servers
                    return;
                }
            }
        });
    }
}