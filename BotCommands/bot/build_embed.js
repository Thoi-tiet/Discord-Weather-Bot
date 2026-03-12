const { EmbedBuilder } = require('discord.js');
class WeatherEmbed {
    constructor() { }

    // build embeds
    buildFloodEmbed(data) {
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
            .setFooter({ text: 'Dữ liệu có thể không chính xác!' })
            .setTimestamp();
    }
    buildAirPollutionEmbed(data) {
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
            .setFooter({ text: 'Dữ liệu có thể không chính xác!' })
            .setTimestamp();
    }

    buildSatelliteRadiationEmbed(data) {
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
            .setFooter({ text: 'Dữ liệu có thể không chính xác!' })
            .setTimestamp();
    }

    buildWeatherEmbed(data) {
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
            .setFooter({ text: 'Dữ liệu có thể không chính xác!' })
            .setTimestamp();
    }



    buildForecastEmbed(data, hours, title) {
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
            .setFooter({ text: 'Dữ liệu có thể không chính xác!' })
            .setTimestamp();

        let desc = '';
        selected.forEach(item => {
            const time = new Date(item.dt * 1000).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
            desc += `**${time} (GMT+0)** - ${item.weather[0].description}, 🌡 ${item.main.temp}°C, 💧 ${item.main.humidity}%, 👁 ${(item.visibility / 1000).toFixed(1)} km, 💨 ${item.wind.speed} m/s\n\n`;
        });

        embed.setDescription(desc);
        return embed;
    }
}

module.exports = {
    WeatherEmbed
}