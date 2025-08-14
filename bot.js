const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Events, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('./keepalive.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
        .setDescription('Hiển thị thông tin trợ giúp')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Đã đăng ký slash command!");
})();

client.once('ready', () => {
    console.log(`Bot đã đăng nhập: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;

    if (commandName === 'weather') {
        await interaction.deferReply();
        const location = options.getString('location').trim();
        const result = await fetchWeatherData(location);
        await interaction.editReply(result.error ? result.content : { embeds: [result.embed] });
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
                        { name: '/help', value: 'Hiển thị thông tin trợ giúp', inline: true }
                    )
            ]
        });
    }

});

async function fetchWeatherData(location) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho **${location}**` };
        return { error: false, embed: buildWeatherEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function fetchWeatherDataByCoords(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildWeatherEmbed(data) };
    } catch {
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
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
        desc += `**${time}** - ${item.weather[0].description}, 🌡 ${item.main.temp}°C, 💧 ${item.main.humidity}%, 👁 ${(item.visibility / 1000).toFixed(1)} km, 💨 ${item.wind.speed} m/s\n`;
    });

    embed.setDescription(desc);
    return embed;
}

client.login(TOKEN);
