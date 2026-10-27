const {
    OWM_API_KEY
} = require('../../bot.js');

const { APIKeyManager } = require('../utils/api_key.js');
const apiKey = new APIKeyManager();
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

// s.js
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch(err => {throw err;});;
const {
    WeatherEmbed
} = require('./build_embed.js');

const embed = new WeatherEmbed();

class WeatherFunctions {
    constructor() { }


    async getFloodRisk(lat, lon) {
        console.log(`Đang lấy thông tin nguy cơ ngập lụt cho tọa độ (${lat}, ${lon})...`);
        try {
            const res = await fetch(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max,river_discharge_min,river_discharge_p25,river_discharge_p75&timezone=Asia%2FBangkok`).catch(err => { throw err; });;
            const data = await res.json();
            if (data.error) return { error: true, content: `❌ Không tìm thấy dữ liệu ngập lụt cho tọa độ (${lat}, ${lon})` };
            return { error: false, embed: embed.buildFloodEmbed(data) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối Flood API.' };
        }
    }
    async getSatelliteRadiation(lat, lon) {
        console.log(`Đang lấy thông tin bức xạ vệ tinh cho tọa độ (${lat}, ${lon})...`);
        try {
            const res = await fetch(`https://satellite-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,daylight_duration,sunshine_duration,shortwave_radiation_sum&models=satellite_radiation_seamless&timezone=Asia%2FBangkok`).catch(err => { throw err; });
            const data = await res.json();
            if (data.error) return { error: true, content: `❌ Không tìm thấy dữ liệu bức xạ vệ tinh cho tọa độ (${lat}, ${lon})` };
            return { error: false, embed: embed.buildSatelliteRadiationEmbed(data) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối Satellite API.' };
        }
    }
    async fetchWeatherData(location) {
        console.log(`Đang lấy thông tin thời tiết cho ${location}...`);
        try {
            const data = await apiKey.fetchWithFallback((key) => `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${key}&units=metric&lang=vi`);

            if (data.cod !== 200) {
                console.log(data + " --- " + data.cod);
                return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho **${location}**` };
            }
            return { error: false, embed: embed.buildWeatherEmbed(data) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
        }
    }


    async fetchWeatherDataByCoords(lat, lon) {
        console.log(`Đang lấy thông tin thời tiết cho tọa độ (${lat}, ${lon})...`);
        try {
            const data = await apiKey.fetchWithFallback((key) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=vi`);

            if (data.cod !== 200) {
                console.log(data + " --- " + data.cod); return { error: true, content: `❌ Không tìm thấy dữ liệu thời tiết cho tọa độ (${lat}, ${lon})` };
            }
            return { error: false, embed: embed.buildWeatherEmbed(data) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
        }
    }

    async getElevation(lat, lon) {
        console.log(`Đang lấy thông tin độ cao cho tọa độ (${lat}, ${lon})...`);
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`).catch(err => { throw err; });;
            const data = await res.json();
            if (data.elevation === undefined) return { error: true, content: `❌ Không tìm thấy dữ liệu độ cao cho tọa độ (${lat}, ${lon})` };
            return { error: false, content: `Độ cao ở (${lat}, ${lon}): ${data.elevation} m` };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối Open-Meteo.' };
        }
    }

    async fetchForecastByCoords(lat, lon, hours, page=0) {
        console.log(`Đang lấy thông tin dự báo thời tiết tại vị trí (${lat}, ${lon}) trong ${hours} giờ tới...`);
        try {
            const data = await apiKey.fetchWithFallback((key) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=vi`);

            if (data.cod !== "200") return { error: true, content: `❌ Không tìm thấy dự báo cho tọa độ (${lat}, ${lon})` };
            let dailyData;
            if (page === 1) {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=Asia%2FBangkok`);
                dailyData = await response.json();
                if (!response.ok || dailyData.error) throw new Error('Open-Meteo daily forecast request failed');
            }
            return { error: false, embed: await embed.buildForecastEmbed(data, hours, `(${lat}, ${lon}) - ${data.city.name}, ${data.city.country}`, page, dailyData) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
        }
    }

    async fetchForecast(location, hours, page=0) {
        console.log(`Đang lấy thông tin dự báo thời tiết cho ${location} trong ${hours} giờ tới...`);
        try {
            const data = await apiKey.fetchWithFallback((key) => `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${key}&units=metric&lang=vi`);
            if (data.cod !== "200") return { error: true, content: `❌ Không tìm thấy dự báo cho **${location}**` };
            let dailyData;
            if (page === 1) {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
                const geocodeResponse = await fetch(url, { headers: { "User-Agent": "WeatherBot/1.0" } });
                const places = await geocodeResponse.json();
                const place = places[0];
                if (!geocodeResponse.ok || !place) {
                    return { error: true, content: `❌ Không tìm thấy tọa độ cho **${location}**` };
                }

                const dailyResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=Asia%2FBangkok`);
                dailyData = await dailyResponse.json();
                if (!dailyResponse.ok || dailyData.error) throw new Error('Open-Meteo daily forecast request failed');
            }
            return { error: false, embed: await embed.buildForecastEmbed(data, hours, `${data.city.name}, ${data.city.country}`, page, dailyData) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
        }
    }

    async getAirPollutionData(lat, lon) {
        console.log(`Đang lấy thông tin ô nhiễm không khí cho tọa độ (${lat}, ${lon})...`);
        try {
            const data = await apiKey.fetchWithFallback((key) => `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}&lang=vi`);

            if (data.cod !== 200) {
                console.log(data + " --- " + data.cod);
                return { error: true, content: `❌ Không tìm thấy dữ liệu ô nhiễm không khí cho tọa độ **(${lat}, ${lon})**` };
            }
            return { error: false, embed: embed.buildAirPollutionEmbed(data) };
        } catch (err) {
            console.log(err);
            return { error: true, content: '⚠ Lỗi khi kết nối OpenWeatherMap.' };
        }
    }
}
module.exports = {
    WeatherFunctions
}