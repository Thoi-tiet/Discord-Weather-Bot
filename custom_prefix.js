const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events, EmbedBuilder, PermissionsBitField, ButtonStyle, ButtonBuilder, ButtonInteraction, ActionRowBuilder } = require('discord.js');
const { fetch } = require('./bot.js');
async function custom_prefix(message) {
    if (message.author.bot || !message.guild) return;
    const prefix = default_prefix;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'donate') {

        const donateEmbed = new EmbedBuilder()
            .setColor(0xffcc70)
            .setTitle('☕ Ủng hộ Thời tiết#6014')
            .setDescription('Nếu bạn thấy bot hữu ích, hãy ủng hộ để mình có thêm động lực duy trì và phát triển 💖')
            .addFields(
                { name: 'Patreon', value: '[👉 Ủng hộ qua Patreon](https://www.patreon.com/randomperson255)', inline: true },
                { name: 'BuyMeACoffee', value: '[☕ Mời mình một ly cà phê](https://www.buymeacoffee.com/random.person.255)', inline: true }
            )
            .setFooter({ text: 'Cảm ơn bạn đã ủng hộ!\nDev by @random.person.255' });
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

        const row = new ActionRowBuilder().addComponents(donate_btn, buymeacoffee_btn);
        await message.reply({ embeds: [donateEmbed], components: [row] });
        // Sau 1 phút disable nút
        setTimeout(async () => {
            try {
                const disabledRow = new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(donate_btn).setDisabled(true),
                    ButtonBuilder.from(buymeacoffee_btn).setDisabled(true)
                );
                await message.reply({ components: [disabledRow] });
                return;
            } catch (err) {
                console.warn("Không thể update tin nhắn donate:", err.message);
            }
        }, 60000);
        return;
    }

    if (command === 'weather') {
        const location = args.join(' ');
        if (!location) {
            return message.reply(`⚠ Vui lòng nhập địa điểm. Nếu có khoảng trắng, hãy đặt trong dấu ngoặc kép.\nVD: \`${prefix}weather "Ho Chi Minh"\``);
        }

        if (location.includes(' ') && !(location.startsWith('"') && location.endsWith('"'))) {
            return message.reply(`⚠ Địa điểm có khoảng trắng. Hãy đặt trong dấu ngoặc kép.\nVD: \`${prefix}weather "Ho Chi Minh"\``);
        }

        const clean_location = location.trim().replace(/^"(.*)"$/, '$1');
        console.log(`Đang lấy thông tin thời tiết cho ${clean_location}...`);
        // await message.reply(`Đang lấy thông tin thời tiết cho **${clean_location}**...`);
        const result = await fetchWeatherData(clean_location);
        await message.reply(result.error ? result.content : { embeds: [result.embed] });
    }

    if (command === 'satellite_radiation') {
        await message.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const res = await getSatelliteRadiation(lat, lon);
        if (res.error) {
            return message.reply(res.content);
        }
        await message.reply(res.error ? res.content : { embeds: [res.embed] });
    }

    if (command === 'weather_coord') {
        const lat = args[0];
        const lon = args[1];
        if (!lat || !lon) return message.reply('⚠ Vui lòng cung cấp tọa độ (vĩ độ, kinh độ).');
        console.log(`Đang lấy thông tin thời tiết theo tọa độ (${lat}, ${lon})...`);

        const result = await fetchWeatherDataByCoords(lat, lon);
        await message.reply(result.error ? result.content : { embeds: [result.embed] });
    }

    if (command === 'forecast') {
        let location = args.slice(0, -1).join(' ');
        const hours = parseInt(args[args.length - 1]) || 3;

        if (!location) {
            return message.reply(`⚠ Vui lòng nhập địa điểm. Nếu có khoảng trắng, hãy đặt trong dấu ngoặc kép.\nVD: \`${prefix}weather "Ho Chi Minh"\``);
        }

        if (location.includes(' ') && !(location.startsWith('"') && location.endsWith('"'))) {
            return message.reply(`⚠ Địa điểm có khoảng trắng. Hãy đặt trong dấu ngoặc kép.\nVD: \`${prefix}weather "Ho Chi Minh"\``);
        }
        location = location.replace(/^"(.*)"$/, '$1');
        console.log(`Đang lấy thông tin thời tiết cho ${location}...`);
        // await message.reply(`Đang lấy thông tin thời tiết cho **${location}**...`);
        const result = await fetchForecast(location, hours);
        await message.reply(result.error ? result.content : { embeds: [result.embed] });
    }

    if (command === 'geo') {
        // subcommand
        const subcommand = args[0];
        if (
            subcommand === 'ctl' || subcommand === 'coords_to_location' || subcommand === 'coord_to_location' ||
            subcommand === 'coord_location' || subcommand === 'c_t_l' || subcommand === 'loc_to_coord'
        ) {
            const lat = args[1];
            const lon = args[2];
            if (!lat || !lon) return message.reply('⚠ Vui lòng cung cấp tọa độ (vĩ độ, kinh độ).');
            console.log(`Đang lấy thông tin địa lý cho tọa độ (${lat}, ${lon})...`);
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "WeatherBot/1.0 (minhnhanbuinguyen@gmail.com)"
                    },
                    timeout: 10000
                });
                const data = await res.json();

                if (!data.display_name) return message.reply("⚠️ Không tìm thấy địa điểm nào.");

                await message.reply(`📍 Tọa độ: \`${lat}, ${lon}\`  
🗺️ Địa điểm: **${data.display_name}**`);
            } catch (err) {
                console.error(err);
                await message.reply("❌ Có lỗi xảy ra khi tìm địa điểm.");
            }
        } else if (
            subcommand === 'ltc' || subcommand === 'location_to_coords' || subcommand === 'location_to_coord' ||
            subcommand === 'l_t_c' || subcommand === 'loc_to_coord' || subcommand === 'location_coord'
        ) {
            // location phải để trong ngoặc kép
            let location = message.content.slice((prefix + command + ' ' + subcommand).length).trim();
            if (!location.startsWith('"') || !location.endsWith('"')) {
                return message.reply(`⚠ Địa điểm có khoảng trắng. Hãy đặt trong dấu ngoặc kép.\nVD: \`${prefix}geo ltc "Ho Chi Minh"\``);
            }
            location = location.replace(/^"(.*)"$/, '$1');
            console.log(`Đang lấy thông tin địa lý cho địa điểm ${location}...`);
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "WeatherBot/1.0 (minhnhanbuinguyen@gmail.com)"
                    },
                    timeout: 10000
                });
                const data = await res.json();

                if (!data.length) return message.reply("⚠️ Không tìm thấy địa điểm nào.");

                const place = data[0];
                await message.reply(`📍 **${place.display_name}**  
🌐 Vĩ độ (latitude): \`${place.lat}\`  
🌐 Kinh độ (longitude): \`${place.lon}\``);
            } catch (err) {
                console.error(err);
                await message.reply("❌ Có lỗi xảy ra khi tìm tọa độ.");
            }
        }
    }

    if (command === 'forecast_coord') {
        const lat = args[0];
        const lon = args[1];
        const hours = args[2] || 3;
        if (!lat || !lon) return message.reply('⚠ Vui lòng cung cấp tọa độ (vĩ độ, kinh độ).');
        console.log(`Đang lấy thông tin dự báo thời tiết theo tọa độ (${lat}, ${lon}) trong ${hours} giờ tới...`);
        const result = await fetchForecastByCoords(lat, lon, hours);
        await message.reply(result.error ? result.content : { embeds: [result.embed] });
    }

    if (command === 'help') {
        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Trợ giúp')
                    .setDescription('Danh sách các lệnh:')
                    .addFields(
                        { name: `${prefix}weather`, value: 'Xem thời tiết hiện tại', inline: true },
                        { name: `${prefix}weather_coord`, value: 'Xem thời tiết hiện tại theo tọa độ', inline: true },
                        { name: `${prefix}forecast`, value: 'Xem dự báo thời tiết', inline: true },
                        { name: `${prefix}forecast_coord`, value: 'Xem dự báo thời tiết theo tọa độ', inline: true },
                        { name: `${prefix}air_pollution`, value: 'Xem thông tin ô nhiễm không khí', inline: true },
                        { name: `${prefix}help`, value: 'Hiển thị thông tin trợ giúp', inline: true },
                        { name: `${prefix}donate`, value: 'Ủng hộ bot nếu bạn thấy hữu ích', inline: true },
                        { name: `${prefix}geo ltc (hoặc location_to_coords)`, value: 'Chuyển đổi từ địa điểm sang tọa độ', inline: true },
                        { name: `${prefix}geo ctl (hoặc coords_to_location)`, value: 'Chuyển đổi từ tọa độ sang địa điểm', inline: true }
                    )
            ]
        });
    }

    if (command === 'air_pollution') {
        const lat = args[0];
        const lon = args[1];
        if (!lat || !lon) return message.reply('⚠ Vui lòng cung cấp tọa độ (vĩ độ, kinh độ).');
        console.log(`Đang lấy thông tin ô nhiễm không khí theo tọa độ (${lat}, ${lon})...`);
        const result = await getAirPollutionData(lat, lon);
        await message.reply(result.error ? result.content : { embeds: [result.embed] });
    }
}

module.exports = {
    custom_prefix
}