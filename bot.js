const fs = require('fs');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('./keepalive.js');

const default_prefix = "w!";

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
        .setName("IP")
        .setDescription("Xem thông tin địa chỉ IP")
        .addSubcommand(sub =>
            sub.setName("info")
                .setDescription("Xem thông tin địa chỉ IP")
                .addStringOption(option =>
                    option.setName('IP_address').setDescription('Địa chỉ IP').setRequired(true)
                )
        ),
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
        status: 'online',
        afk: false
    });
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;

    if (commandName === 'weather_icon') {
        await interaction.deferReply();
        const location = options.getString('location').trim();
        const iconResult = await getWeatherIcon(location);
        if (iconResult.error) {
            return interaction.editReply(iconResult.content);
        }
        await interaction.editReply({ files: [iconResult.iconUrl] });
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
    }

    if (commandName === 'weather') {
        await interaction.deferReply();
        const location = options.getString('location').trim();
        const result = await fetchWeatherData(location);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
    }

    if (commandName === 'IP') {
        const sub = interaction.options.getSubcommand();
        if (sub === "info") {
            await interaction.deferReply();
            const ip = options.getString('IP_address').trim();
            try {
                const res = await fetch("https://api.country.is/" + ip);
                const data = res.json();
                if (data.error) {
                    return interaction.editReply("⚠ Địa chỉ IP không hợp lệ.");
                }
                await interaction.editReply("Địa chỉ IP: " + ip + "\nQuốc gia: " + data.country + "\nMã quốc gia: " + data.country_code + "\nThành phố: " + data.city + "\nNhà cung cấp dịch vụ Internet (ISP): " + data.isp);
            } catch {
                return interaction.editReply("❌ Lỗi khi lấy thông tin địa chỉ IP.");
            }
        }
    }

    if (commandName === 'weather_coord') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const result = await fetchWeatherDataByCoords(lat, lon);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
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
    }

    if (commandName === 'donate') {
        await interaction.deferReply(/*{ ephemeral: true }*/);

        const donateEmbed = new EmbedBuilder()
            .setColor(0xffcc70)
            .setTitle('☕ Ủng hộ Weather#6014')
            .setDescription('Nếu bạn thấy bot hữu ích, hãy ủng hộ để mình có thêm động lực duy trì và phát triển 💖')
            .addFields(
                { name: 'Patreon', value: '[👉 Ủng hộ qua Patreon](https://www.patreon.com/randomperson255)', inline: true },
                { name: 'BuyMeACoffee', value: '[☕ Mời mình một ly cà phê](https://www.buymeacoffee.com/random.person.255)', inline: true }
            )
            .setFooter({ text: 'Cảm ơn bạn đã ủng hộ!\nDev by @random.person.255' });

        await interaction.editReply({ embeds: [donateEmbed] });
    }

    if (commandName === 'elevation') {
        await interaction.deferReply();
        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');
        const res = await getElevation(lat, lon);
        await interaction.editReply(res.content);
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
                        { name: '/IP info', value: 'Xem thông tin địa chỉ IP', inline: true },
                    )
            ]
        });
    }

    if (commandName === 'air_pollution') {
        await interaction.deferReply();

        const lat = options.getNumber('latitude');
        const lon = options.getNumber('longitude');

        try {
            const result = await getAirPollutionData(lat, lon);
            if (result.error) {
                await interaction.editReply(result.content);
            } else {
                await interaction.editReply({ embeds: [result.embed] });
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply('❌ Lỗi khi lấy dữ liệu chất lượng không khí.');
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
            } catch (err) {
                console.error(err);
                await interaction.editReply("❌ Có lỗi xảy ra khi tìm tọa độ.");
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
            } catch (err) {
                console.error(err);
                await interaction.editReply("❌ Có lỗi xảy ra khi tìm địa điểm.");
            }
        }
    }

});

async function getFloodRisk(lat, lon) {
    console.log(`Đang lấy thông tin nguy cơ ngập lụt cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_min,river_discharge_p25,river_discharge_p75&timezone=Asia%2FBangkok`);
        const data = await res.json();
        if (data.error) return { error: true, content: `❌ Không tìm thấy dữ liệu ngập lụt cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildFloodEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối Flood API.' };
    }
}
async function getSatelliteRadiation(lat, lon) {
    console.log(`Đang lấy thông tin bức xạ vệ tinh cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://satellite-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,daylight_duration,sunshine_duration,shortwave_radiation_sum&models=satellite_radiation_seamless&timezone=Asia%2FBangkok`)
        const data = await res.json();
        if (data.error) return { error: true, content: `❌ Không tìm thấy dữ liệu bức xạ vệ tinh cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildSatelliteRadiationEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối Satellite API.' };
    }
}
async function fetchWeatherData(location) {
    console.log(`Đang lấy thông tin thời tiết cho ${location}...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho **${location}**` };
        return { error: false, embed: buildWeatherEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function getWeatherIcon(location) {
    console.log(`Đang lấy biểu tượng thời tiết cho ${location}...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho **${location}**` };
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        return { error: false, iconUrl };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function getWeatherIconByCoords(lon, lat) {
    console.log(`Đang lấy biểu tượng thời tiết cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho tọa độ (${lat}, ${lon})` };
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        return { error: false, iconUrl };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function fetchWeatherDataByCoords(lat, lon) {
    console.log(`Đang lấy thông tin thời tiết cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildWeatherEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function getElevation(lat, lon) {
    console.log(`Đang lấy thông tin độ cao cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`);
        const data = await res.json();
        if (data.elevation === undefined) return { error: true, content: `❌ Không tìm thấy dữ liệu độ cao cho tọa độ (${lat}, ${lon})` };
        return { error: false, content: `Độ cao ở (${lat}, ${lon}): ${data.elevation} m` };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối Open-Meteo.' };
    }
}

async function getAirPollutionData(lat, lon) {
    console.log(`Đang lấy thông tin ô nhiễm không khí cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&lang=vi`);
        const data = await res.json();
        //if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu ô nhiễm không khí cho tọa độ **(${lat}, ${lon})**` };
        return { error: false, embed: buildAirPollutionEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

// build embed
function buildFloodEmbed(data) {
    const time = data.daily.time[0];
    const river_discharge = data.daily.river_discharge[0];
    const river_discharge_mean = data.daily.river_discharge_mean[0];
    const river_discharge_median = data.daily.river_discharge_median[0];
    const river_discharge_max = data.daily.river_discharge_max[0];
    const river_discharge_min = data.daily.river_discharge_min[0];
    const river_discharge_p25 = data.daily.river_discharge_p25[0];
    const river_discharge_p75 = data.daily.river_discharge_p75[0];
    return new EmbedBuilder()
        .setTitle(`🌊 Nguy cơ ngập lụt ở (${data.latitude}, ${data.longitude})`)
        .setColor(0x3498db)
        .addFields(
            { name: '📅 Ngày', value: `${time}`, inline: true },
            { name: '💧 Lưu lượng dòng chảy (river discharge)', value: `${river_discharge} m³/s`, inline: true },
            { name: '💧 Lưu lượng dòng chảy trung bình (river discharge mean)', value: `${river_discharge_mean} m³/s`, inline: true },
            { name: '💧 Lưu lượng dòng chảy trung vị (river discharge median)', value: `${river_discharge_median} m³/s`, inline: true },
            { name: '💧 Lưu lượng dòng chảy tối đa (river discharge max)', value: `${river_discharge_max} m³/s`, inline: true },
            { name: '💧 Lưu lượng dòng chảy tối thiểu (river discharge min)', value: `${river_discharge_min} m³/s`, inline: true },
            { name: '💧 Lưu lượng dòng chảy phần trăm 25 (river discharge p25)', value: `${river_discharge_p25} m³/s`, inline: true },
            { name: '💧 Lưu lượng dòng chảy phần trăm 75 (river discharge p75)', value: `${river_discharge_p75} m³/s`, inline: true }
        )
        .setFooter({ text: 'Nguồn: Open-Meteo\nDev by @random.person.255' })
        .setTimestamp();
}
function buildAirPollutionEmbed(data) {
    const aqi = data.list[0].main.aqi;
    let aqiDescription = '';
    if (aqi === 1) aqiDescription = 'Tốt';
    else if (aqi === 2) aqiDescription = 'Trung bình';
    else if (aqi === 3) aqiDescription = 'Kém';
    else if (aqi === 4) aqiDescription = 'Xấu';
    else if (aqi === 5) aqiDescription = 'Rất xấu';

    return new EmbedBuilder()
        .setTitle(`🌍 Thông tin ô nhiễm không khí ở (${data.coord.lat}, ${data.coord.lon})`)
        .setDescription(`Chỉ số chất lượng không khí (AQI): ${aqi} - ${aqiDescription}`)
        .setColor(0x2ecc71)
        .addFields(
            { name: '🌫 PM2.5', value: `${data.list[0].components.pm2_5} µg/m³`, inline: true },
            { name: '🌫 PM10', value: `${data.list[0].components.pm10} µg/m³`, inline: true },
            { name: '🌫 CO', value: `${data.list[0].components.co} µg/m³`, inline: true },
            { name: '🌫 NO2', value: `${data.list[0].components.no2} µg/m³`, inline: true },
            { name: '🌫 O3', value: `${data.list[0].components.o3} µg/m³`, inline: true },
            { name: '🌫 SO2', value: `${data.list[0].components.so2} µg/m³`, inline: true }
        )
        .setFooter({ text: 'Nguồn: OpenWeatherMap\nDev by @random.person.255' })
        .setTimestamp();
}

function buildSatelliteRadiationEmbed(data) {
    const todayIndex = data.daily.time.indexOf(data.daily.time[data.daily.time.length - 1]);
    if (todayIndex === -1) {
        return new EmbedBuilder().setDescription('⚠ Không có dữ liệu bức xạ vệ tinh cho ngày hôm nay.');
    }
    return new EmbedBuilder()
        .setTitle(`☀ Dữ liệu bức xạ vệ tinh ở (${data.latitude}, ${data.longitude})`)
        .setColor(0xffcc70)
        .addFields(
            { name: '🌅 Bình minh (sunrise) (GMT+0)', value: `${data.daily.sunrise[todayIndex]}`, inline: true },
            { name: '🌇 Hoàng hôn (sunset) (GMT+0)', value: `${data.daily.sunset[todayIndex]}`, inline: true },
            { name: '⏳ Thời gian ban ngày (daylight duration)', value: `${data.daily.daylight_duration[todayIndex] != null ? data.daily.daylight_duration[todayIndex] : 0} giây`, inline: true },
            { name: '☀ Thời gian có nắng (sunshine duration)', value: `${data.daily.sunshine_duration[todayIndex] != null ? data.daily.sunshine_duration[todayIndex] : 0} giây`, inline: true },
            { name: '🌞 Tổng bức xạ sóng ngắn (shortwave radiation sum)', value: `${data.daily.shortwave_radiation_sum[todayIndex] != null ? data.daily.shortwave_radiation_sum[todayIndex] : 0} MJ/m²`, inline: true }
        )
        .setFooter({ text: 'Nguồn: Open-Meteo\nDev by @random.person.255' })
        .setTimestamp();
}

function buildWeatherEmbed(data) {
    const rain1h = (data.rain?.['1h']) || 0;
    const rain3h = (data.rain?.['3h']) || 0;
    const snow1h = (data.snow?.['1h']) || 0;
    const snow3h = (data.snow?.['3h']) || 0;
    const visibilityKm = (data.visibility || 0) / 1000;
    const weatherMain = data.weather[0].main.toLowerCase();
    let color = 0x3498db;
    if (weatherMain.includes('clear')) color = 0xf1c40f;
    else if (weatherMain.includes('cloud')) color = 0x95a5a6;
    else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) color = 0x2980b9;
    else if (weatherMain.includes('snow')) color = 0xffffff;
    else if (weatherMain.includes('thunder')) color = 0x8e44ad;

    return new EmbedBuilder()
        .setTitle(`🌍 Thời tiết ở ${data.name}, ${data.sys.country} (${data.coord.lat}, ${data.coord.lon})`)
        .setDescription(`${data.weather[0].description}`)
        .setColor(color)
        .addFields(
            { name: '🌡 Nhiệt độ', value: `${data.main.temp}°C`, inline: true },
            { name: '💧 Độ ẩm', value: `${data.main.humidity}%`, inline: true },
            { name: '💨 Gió', value: `${data.wind.speed} m/s (${data.wind.deg}°)`, inline: true },
            { name: '👁 Tầm nhìn', value: `${visibilityKm.toFixed(1)} km`, inline: true },
            { name: '🌧 Mưa', value: `${rain1h} mm (1h), ${rain3h} mm (3h)`, inline: true },
            { name: '❄ Tuyết', value: `${snow1h} mm (1h), ${snow3h} mm (3h)`, inline: true },
            { name: '☁ Mây', value: `${data.clouds.all}%`, inline: true }
        )
        .setThumbnail(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
        .setFooter({ text: 'Nguồn: OpenWeatherMap\nDev by @random.person.255' })
        .setTimestamp();
}

async function fetchForecast(location, hours) {
    console.log(`Đang lấy thông tin dự báo thời tiết cho ${location} trong ${hours} giờ tới...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== "200") return { error: true, content: `❌ Không tìm thấy dự báo cho **${location}**` };
        return { error: false, embed: buildForecastEmbed(data, hours, `${data.city.name}, ${data.city.country}`) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function fetchForecastByCoords(lat, lon, hours) {
    console.log(`Đang lấy thông tin dự báo thời tiết tại vị trí (${lat}, ${lon}) trong ${hours} giờ tới...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== "200") return { error: true, content: `❌ Không tìm thấy dự báo cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildForecastEmbed(data, hours, `(${lat}, ${lon}) - ${data.city.name}, ${data.city.country}`) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

function buildForecastEmbed(data, hours, title) {
    const now = Date.now();
    const selected = data.list.filter(item => {
        const diffHours = (new Date(item.dt * 1000) - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= hours;
    });
    if (selected.length === 0) {
        return new EmbedBuilder().setDescription(`⚠ Không có dữ liệu dự báo trong ${hours} giờ tới.`);
    }

    const embed = new EmbedBuilder()
        .setTitle(`📅 Dự báo ${hours} giờ tới ở ${title}`)
        .setColor(0x3498db)
        .setThumbnail(`https://openweathermap.org/img/wn/${selected[0].weather[0].icon}@2x.png`)
        .setFooter({ text: 'Nguồn: OpenWeatherMap\nDev by @random.person.255' })
        .setTimestamp();

    let desc = '';
    selected.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
        desc += `**${time} (GMT+0)** - ${item.weather[0].description}, 🌡 ${item.main.temp}°C, 💧 ${item.main.humidity}%, 👁 ${(item.visibility / 1000).toFixed(1)} km, 💨 ${item.wind.speed} m/s\n\n`;
    });

    embed.setDescription(desc);
    return embed;
}

client.login(TOKEN);