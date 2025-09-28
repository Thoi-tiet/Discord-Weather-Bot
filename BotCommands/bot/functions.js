const {
    OWM_API_KEY
} = require('../../bot.js');

// functions.js
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('node-fetch');
const {
    buildFloodEmbed, buildAirPollutionEmbed, buildSatelliteRadiationEmbed,
    buildWeatherEmbed, buildForecastEmbed
} = require('./build_embed.js');
async function getIPInfo(ip) {
    try {
        const res = await fetch("https://api.country.is/" + ip);
        const data = res.json();
        if (data.error) {
            return { error: true, content: `❌ Không tìm thấy thông tin cho địa chỉ IP **${ip}**` };
        }
        return { error: false, content: "Địa chỉ IP: " + ip + "\nQuốc gia: " + data.country };
    } catch (err) {
        console.log(err);
        return { error: true, content: "❌ Lỗi khi lấy thông tin địa chỉ IP." };
    }
}

async function getFloodRisk(lat, lon) {
    console.log(`Đang lấy thông tin nguy cơ ngập lụt cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_min,river_discharge_p25,river_discharge_p75&timezone=Asia%2FBangkok`);
        const data = await res.json();
        if (data.error) return { error: true, content: `❌ Không tìm thấy dữ liệu ngập lụt cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildFloodEmbed(data) };
    } catch (err) {
        console.log(err);
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
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối Satellite API.' };
    }
}
async function fetchWeatherData(location) {
    console.log(`Đang lấy thông tin thời tiết cho ${location}...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) {
            console.log(data + " --- " + data.cod);
            return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho **${location}**` };
        }
        return { error: false, embed: buildWeatherEmbed(data) };
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function getWeatherIcon(location) {
    console.log(`Đang lấy biểu tượng thời tiết cho ${location}...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) {
            console.log(data + " --- " + data.cod); return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho **${location}**` };
        }
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        return { error: false, iconUrl };
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function getWeatherIconByCoords(lat, lon) {
    console.log(`Đang lấy biểu tượng thời tiết cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) {
            console.log(data + " --- " + data.cod); return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho tọa độ (${lat}, ${lon})` };
        }
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        return { error: false, iconUrl };
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function fetchWeatherDataByCoords(lat, lon) {
    console.log(`Đang lấy thông tin thời tiết cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== 200) {
            console.log(data + " --- " + data.cod); return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho tọa độ (${lat}, ${lon})` };
        }
        return { error: false, embed: buildWeatherEmbed(data) };
    } catch (err) {
        console.log(err);
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
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối Open-Meteo.' };
    }
}

async function fetchForecastByCoords(lat, lon, hours) {
    console.log(`Đang lấy thông tin dự báo thời tiết tại vị trí (${lat}, ${lon}) trong ${hours} giờ tới...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== "200") return { error: true, content: `❌ Không tìm thấy dự báo cho tọa độ (${lat}, ${lon})` };
        return { error: false, embed: buildForecastEmbed(data, hours, `(${lat}, ${lon}) - ${data.city.name}, ${data.city.country}`) };
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function fetchForecast(location, hours) {
    console.log(`Đang lấy thông tin dự báo thời tiết cho ${location} trong ${hours} giờ tới...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${OWM_API_KEY}&units=metric&lang=vi`);
        const data = await res.json();
        if (data.cod !== "200") return { error: true, content: `❌ Không tìm thấy dự báo cho **${location}**` };
        return { error: false, embed: buildForecastEmbed(data, hours, `${data.city.name}, ${data.city.country}`) };
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}

async function getAirPollutionData(lat, lon) {
    console.log(`Đang lấy thông tin ô nhiễm không khí cho tọa độ (${lat}, ${lon})...`);
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&lang=vi`);
        const data = await res.json();
        //if (data.cod !== 200) {
        console.log(data + " --- " + data.cod); return { error: true, content: `❌ Không tìm thấy dữ liệu ô nhiễm không khí cho tọa độ **(${lat}, ${lon})**` };
        return { error: false, embed: buildAirPollutionEmbed(data) };
    } catch (err) {
        console.log(err);
        return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
    }
}
module.exports = {
    getAirPollutionData, getElevation, fetchWeatherDataByCoords, getWeatherIconByCoords,
    getWeatherIcon, fetchWeatherData, getIPInfo, getFloodRisk, getSatelliteRadiation,
    fetchForecastByCoords, fetchForecast
}