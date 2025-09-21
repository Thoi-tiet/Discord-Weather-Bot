const fs = require('fs');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events, EmbedBuilder, PermissionsBitField, ButtonStyle, ButtonBuilder, ButtonInteraction, ActionRowBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('./keepalive.js');
require('./voting.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const OWM_API_KEY = process.env.OWM_API_KEY;

const commands = [
    new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Xem thời tiết hiện tại bằng tên thành phố')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('Tên thành phố')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('weather_coord')
        .setDescription('Xem thời tiết hiện tại theo tọa độ')
        .addNumberOption(opt =>
            opt.setName('latitude').setDescription('Vĩ độ').setRequired(true)
        )
        .addNumberOption(opt =>
            opt.setName('longitude').setDescription('Kinh độ').setRequired(true)
        ),
    // forecast
    new SlashCommandBuilder()
        .setName('forecast')
        .setDescription('Xem dự báo thời tiết')
        .addStringOption(opt =>
            opt.setName('location')
                .setDescription('Tên thành phố')
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('hours')
                .setDescription('Số giờ muốn xem dự báo (mặc định: 3 giờ)')
                .addChoices(
                    { name: '3 giờ', value: 3 },
                    { name: '5 giờ', value: 5 },
                    { name: '12 giờ', value: 12 },
                    { name: '24 giờ', value: 24 }
                )
        ),

    // forecast_coord
    new SlashCommandBuilder()
        .setName('forecast_coord')
        .setDescription('Xem dự báo thời tiết theo tọa độ')
        .addNumberOption(opt =>
            opt.setName('latitude').setDescription('Vĩ độ').setRequired(true)
        )
        .addNumberOption(opt =>
            opt.setName('longitude').setDescription('Kinh độ').setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('hours')
                .setDescription('Số giờ muốn xem dự báo (mặc định: 3 giờ)')
                .addChoices(
                    { name: '3 giờ', value: 3 },
                    { name: '6 giờ', value: 6 },
                    { name: '12 giờ', value: 12 },
                    { name: '24 giờ', value: 24 }
                )
        ),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiển thị thông tin trợ giúp'),
    new SlashCommandBuilder()
        .setName('air_pollution')
        .setDescription('Xem thông tin ô nhiễm không khí')
        .addNumberOption(opt =>
            opt.setName('latitude')
                .setDescription('Vĩ độ')
                .setRequired(true)
        )
        .addNumberOption(opt =>
            opt.setName('longitude')
                .setDescription('Kinh độ')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("geo")
        .setDescription("Chuyển đổi giữa địa điểm và tọa độ")
        .addSubcommand(sub =>
            sub
                .setName("location_to_coords")
                .setDescription("Chuyển từ địa điểm sang tọa độ")
                .addStringOption(option =>
                    option.setName("location").setDescription("Nhập tên địa điểm").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("coords_to_location")
                .setDescription("Chuyển từ tọa độ sang địa điểm")
                .addNumberOption(option =>
                    option.setName("lat").setDescription("Nhập vĩ độ").setRequired(true)
                )
                .addNumberOption(option =>
                    option.setName("lon").setDescription("Nhập kinh độ").setRequired(true)
                )
        ),
    new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Ủng hộ để phát triển bot'),
    new SlashCommandBuilder()
        .setName('weather_icon')
        .setDescription('Xem biểu tượng thời tiết theo địa điểm (ở thời điểm hiện tại)')
        .addStringOption(option =>
            option.setName('location').setDescription('Tên địa điểm').setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('weather_icon_coord')
        .setDescription('Xem biểu tượng thời tiết theo tọa độ (ở thời điểm hiện tại)')
        .addNumberOption(option =>
            option.setName('latitude').setDescription('Vĩ độ').setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('longitude').setDescription('Kinh độ').setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('satellite_radiation')
        .setDescription('Xem dữ liệu bức xạ vệ tinh (satellite radiation)')
        .addNumberOption(option =>
            option.setName('latitude').setDescription('Vĩ độ').setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('longitude').setDescription('Kinh độ').setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('elevation')
        .setDescription('Xem độ cao so với mực nước biển')
        .addNumberOption(option =>
            option.setName('latitude').setDescription('Vĩ độ').setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('longitude').setDescription('Kinh độ').setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("flood")
        .setDescription("Xem nguy cơ ngập lụt (được cập nhật vào mỗi ngày)")
        .addNumberOption(option =>
            option.setName('latitude').setDescription('Vĩ độ').setRequired(true)
        )
        .addNumberOption(option =>
            option.setName('longitude').setDescription('Kinh độ').setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("ip")
        .setDescription("Xem thông tin địa chỉ IP")
        .addSubcommand(sub =>
            sub
                .setName("info")
                .setDescription("Xem thông tin địa chỉ IP")
                .addStringOption(option =>
                    option.setName('address').setDescription('Địa chỉ IP').setRequired(true)
                )
        ),
    new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Bỏ phiếu cho bot trên top.gg")
].map(cmd => cmd.toJSON());
// require('./deploy-cmds.js');
const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Đã đăng ký slash command!");
})();

client.once('ready', () => {
    console.log(`Bot đã đăng nhập: ${client.user.tag}`);
    client.user.setPresence({
        activities: [
            { name: 'Đang theo dõi thời tiết 🌦', type: 3 },
        ],
        status: 'dnd',
        afk: false
    });
});

client.once('error', err => {
    console.error('Lỗi bot: \n```\n' + err + '\n```');
});

require('./BotCommands/bot/functions.js');

client.on('guildCreate', async guild => {
    try {
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setTitle(`🎉 Cảm ơn bạn vì đã mời ${client.user.username}!`)
            .setDescription(`Bot đã được thêm vào server **${guild.name}** với **${guild.memberCount} thành viên**,
                Nếu bạn thích bot, bạn có thể vote trên top.gg.`)
            .addFields(
                { name: "📖 Hướng dẫn", value: "Dùng lệnh `/help` để xem các lệnh khả dụng." },
                { name: "☁️ Nguồn dữ liệu", value: "Dữ liệu thời tiết được cung cấp bởi OpenWeatherMap và Open-Meteo." },
            )
            .setColor(0x00AE86)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'Dev by @random.person.255' })
            .setTimestamp();
        const btn = new ButtonBuilder()
            .setLabel('Vote bot trên top.gg')
            .setStyle(ButtonStyle.Link)
            .setURL('https://top.gg/bot/1403622819648110664/vote')
            .setEmoji('⭐');
        const donate_btn = new ButtonBuilder()
            .setLabel('Ủng hộ qua Patreon')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.patreon.com/randomperson255')
            .setEmoji('💖');
        const buymeacoffee_btn = new ButtonBuilder()
            .setLabel('Mời mình một ly cà phê')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.buymeacoffee.com/random.person.255')
            .setEmoji('☕');
        const row = new ActionRowBuilder()
            .addComponents(btn, donate_btn, buymeacoffee_btn);

        await owner.send({ embeds: [embed], components: [row] });
        setTimeout(async () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(btn.setDisabled(true), donate_btn.setDisabled(true), buymeacoffee_btn.setDisabled(true));
            await owner.send({ components: [disabledRow] });
        }, 60000); // 1 phút
        console.log(`✅ Đã gửi DM cảm ơn tới owner của ${guild.name}`);
    } catch (err) {
        console.error(`❌ Không thể gửi DM cho owner của ${guild.name}:`, err);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    // Nếu bot được mention
    if (message.mentions.has(client.user)) {
        message.reply(`👋 Xin chào <@${message.author.id}>!
Mình luôn ở đây để giúp bạn với các thông tin thời tiết và cũng như đưa bạn đến với những trải nghiệm tốt nhất!`);
        return;
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;

    if (commandName === 'vote') {
        await interaction.deferReply();
        // Thêm link bot trên top.gg và nút nhấn để vote
        const voteEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('🌟 Vote cho Thời tiết#6014 trên top.gg!')
            .setDescription('Nếu bạn thích bot, hãy dành một chút thời gian để vote cho bot trên top.gg. Điều này giúp bot phát triển và tiếp cận nhiều người hơn!')
            // .setURL('https://top.gg/bot/1403622819648110664/vote')
            .setFooter({ text: 'Cảm ơn bạn đã ủng hộ!\nDev by @random.person.255' });
        const voteButton = new ButtonBuilder()
            .setLabel('Vote trên top.gg')
            .setStyle(ButtonStyle.Link)
            .setURL('https://top.gg/bot/1403622819648110664/vote')
            .setEmoji('⭐');
        const donate_btn = new ButtonBuilder()
            .setLabel('Ủng hộ qua Patreon')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.patreon.com/randomperson255')
            .setEmoji('💖');
        const buymeacoffee_btn = new ButtonBuilder()
            .setLabel('Mời mình một ly cà phê')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.buymeacoffee.com/random.person.255')
            .setEmoji('☕');
        const row = new ActionRowBuilder()
            .addComponents(voteButton, donate_btn, buymeacoffee_btn);
        await interaction.editReply({ embeds: [voteEmbed], components: [row] });
        // nếu đợi lâu quá thì disable nút
        setTimeout(async () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(voteButton.setDisabled(true), donate_btn.setDisabled(true), buymeacoffee_btn.setDisabled(true));
            await interaction.editReply({ components: [disabledRow] });
        }, 60000); // 1 phút
        return;
    }

    if (commandName === 'weather_icon') {
        await interaction.deferReply();
        const location = options.getString('location').trim();
        const iconResult = await getWeatherIcon(location);
        if (iconResult.error) {
            return interaction.editReply(iconResult.content);
        }
        await interaction.editReply({ files: [iconResult.iconUrl] });
        return;
    }

    if (commandName === 'weather_icon_coord') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const iconResult = await getWeatherIconByCoords(lat, lon);
        if (iconResult.error) {
            return interaction.editReply(iconResult.content);
        }
        await interaction.editReply({ files: [iconResult.iconUrl] });
        return;
    }

    if (commandName === 'satellite_radiation') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const res = await getSatelliteRadiation(lat, lon);
        if (res.error) {
            return interaction.editReply(res.content);
        }
        await interaction.editReply(res.error ? res.content : { embeds: [res.embed] });
        return;
    }

    if (commandName === 'weather') {
        await interaction.deferReply();
        const location = options.getString('location').trim();
        const result = await fetchWeatherData(location);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
        return;
    }

    if (commandName === 'ip') {
        const sub = interaction.options.getSubcommand();
        if (sub === "info") {
            await interaction.deferReply();
            const ip = options.getString('address');
            const res = await getIPInfo(ip);
            await interaction.editReply(res.content);
            return;
        }
    }

    if (commandName === 'weather_coord') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const result = await fetchWeatherDataByCoords(lat, lon);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
        return;
    }

    if (commandName === 'forecast') {
        await interaction.deferReply();
        const location = options.getString('location').trim();
        let hours = options.getInteger('hours') ?? 3; // mặc định 3 giờ
        if (hours <= 0 || hours > 120) {
            return interaction.editReply('⚠ Vui lòng chọn số giờ từ 1 đến 120.');
        }
        const result = await fetchForecast(location, hours);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
        return;
    }

    if (commandName === 'forecast_coord') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        let hours = options.getInteger('hours') ?? 3; // mặc định 3 giờ
        if (hours <= 0 || hours > 120) {
            return interaction.editReply('⚠ Vui lòng chọn số giờ từ 1 đến 120.');
        }
        const result = await fetchForecastByCoords(lat, lon, hours);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
        return;
    }

    if (commandName === 'donate') {
        try {
            // Acknowledge ngay
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferReply();
            }

            // Nút donate
            const donate_btn = new ButtonBuilder()
                .setLabel('Ủng hộ qua Patreon')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.patreon.com/randomperson255')
                .setEmoji('💖');

            const buymeacoffee_btn = new ButtonBuilder()
                .setLabel('Mời mình một ly cà phê')
                .setStyle(ButtonStyle.Link)
                .setURL('https://www.buymeacoffee.com/random.person.255')
                .setEmoji('☕');

            const donateEmbed = new EmbedBuilder()
                .setColor(0xffcc70)
                .setTitle(`☕ Ủng hộ ${client.user.username}`)
                .setDescription('Nếu bạn thấy bot hữu ích, hãy ủng hộ để mình có thêm động lực duy trì và phát triển 💖')
                .addFields(
                    { name: 'Patreon', value: '[👉 Ủng hộ qua Patreon](https://www.patreon.com/randomperson255)', inline: true },
                    { name: 'BuyMeACoffee', value: '[☕ Mời mình một ly cà phê](https://www.buymeacoffee.com/random.person.255)', inline: true }
                )
                .setFooter({ text: 'Cảm ơn bạn đã ủng hộ!\nDev by @random.person.255' })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(donate_btn, buymeacoffee_btn);

            // Sau 1 phút disable nút
            setTimeout(async () => {
                try {
                    const disabledRow = new ActionRowBuilder().addComponents(
                        ButtonBuilder.from(donate_btn).setDisabled(true),
                        ButtonBuilder.from(buymeacoffee_btn).setDisabled(true)
                    );
                    await interaction.editReply({ components: [disabledRow] });
                    return;
                } catch (err) {
                    console.warn("Không thể update tin nhắn donate:", err.message);
                }
            }, 60000);
            await interaction.editReply({ embeds: [donateEmbed], components: [row] });
            return;
        } catch (err) {
            console.error("Lỗi khi xử lý donate:", err);
            if (interaction.deferred) {
                await interaction.editReply("❌ Có lỗi xảy ra khi gửi thông tin donate.");
                return;
            }
        }
    }


    if (commandName === 'elevation') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const res = await getElevation(lat, lon);
        await interaction.editReply(res.content);
        return;
    }

    if (commandName === 'flood') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const res = await getFloodRisk(lat, lon);
        if (res.error) {
            return interaction.editReply(res.content);
        }
        await interaction.editReply(res.error ? res.content : { embeds: [res.embed] });
        return;
    }

    // Thêm trợ giúp

    if (commandName === 'help') {
        await interaction.deferReply();
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Trợ giúp')
                    .setDescription('Danh sách các lệnh:')
                    .addFields(
                        { name: '/weather', value: 'Xem thời tiết hiện tại', inline: true },
                        { name: '/weather_coord', value: 'Xem thời tiết hiện tại theo tọa độ', inline: true },
                        { name: '/forecast', value: 'Xem dự báo thời tiết', inline: true },
                        { name: '/forecast_coord', value: 'Xem dự báo thời tiết theo tọa độ', inline: true },
                        { name: '/weather_icon', value: 'Xem biểu tượng thời tiết theo địa điểm (ở thời điểm hiện tại)', inline: true },
                        { name: '/satellite_radiation', value: 'Xem dữ liệu bức xạ vệ tinh (satellite radiation)', inline: true },
                        { name: '/weather_icon_coord', value: 'Xem biểu tượng thời tiết theo tọa độ (ở thời điểm hiện tại)', inline: true },
                        { name: '/air_pollution', value: 'Xem thông tin ô nhiễm không khí', inline: true },
                        { name: '/geo coords_to_location', value: 'Chuyển đổi tọa độ thành địa điểm', inline: true },
                        { name: '/geo location_to_coords', value: 'Chuyển đổi địa điểm thành tọa độ', inline: true },
                        { name: '/help', value: 'Hiển thị thông tin trợ giúp', inline: true },
                        { name: '/donate', value: 'Ủng hộ bot nếu bạn thấy hữu ích', inline: true },
                        { name: '/elevation', value: 'Xem độ cao so với mực nước biển', inline: true },
                        { name: '/flood', value: 'Xem nguy cơ ngập lụt', inline: true },
                        { name: '/ip info', value: 'Xem thông tin địa chỉ IP', inline: true },
                        { name: '/vote', value: 'Bỏ phiếu cho bot trên top.gg', inline: true }
                    )
            ]
        });
        return;
    }

    if (commandName === 'air_pollution') {
        await interaction.deferReply();

        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');

        try {
            const result = await getAirPollutionData(lat, lon);
            if (result.error) {
                return interaction.editReply(result.content);
            } else {
                await interaction.editReply({ embeds: [result.embed] });
                return;
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Lỗi khi lấy dữ liệu chất lượng không khí.');
            return;
        }
    }

    if (commandName === 'geo') {
        const sub = interaction.options.getSubcommand();

        // 1️⃣ Địa điểm → Tọa độ
        if (sub === "location_to_coords") {
            const query = interaction.options.getString("location");

            await interaction.deferReply();
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "WeatherBot/1.0 (minhnhanbuinguyen@gmail.com)"
                    },
                    timeout: 10000
                });
                const data = await res.json();

                if (!data.length) return interaction.editReply("⚠️ Không tìm thấy địa điểm nào.");

                const place = data[0];
                await interaction.editReply(`📍 **${place.display_name}**  
🌐 Vĩ độ (latitude): \`${place.lat}\`  
🌐 Kinh độ (longitude): \`${place.lon}\``);
                return;
            } catch (err) {
                console.error(err);
                await interaction.editReply("❌ Có lỗi xảy ra khi tìm tọa độ.");
                return;
            }
        }

        // 2️⃣ Tọa độ → Địa điểm
        else if (sub === "coords_to_location") {
            const lat = interaction.options.getNumber("lat");
            const lon = interaction.options.getNumber("lon");

            await interaction.deferReply();
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "WeatherBot/1.0 (minhnhanbuinguyen@gmail.com)"
                    },
                    timeout: 10000
                });
                const data = await res.json();

                if (!data.display_name) return interaction.editReply("⚠️ Không tìm thấy địa điểm nào.");

                await interaction.editReply(`📍 Tọa độ: \`${lat}, ${lon}\`  
🗺️ Địa điểm: **${data.display_name}**`);
                return;
            } catch (err) {
                console.error(err);
                await interaction.editReply("❌ Có lỗi xảy ra khi tìm địa điểm.");
                return;
            }
        }
    }

});

client.login(TOKEN);
module.exports = {
    client, EmbedBuilder, OWM_API_KEY, CLIENT_ID, TOKEN, fetch,
    Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events, EmbedBuilder, 
    PermissionsBitField, ButtonStyle, ButtonBuilder, ButtonInteraction, 
    ActionRowBuilder
};