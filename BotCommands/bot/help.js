const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { WeatherReport } = require('./functions.js');

class HelpPages  {

    constructor() {
        this.help_pages = [
            new EmbedBuilder()
                .setTitle('Trợ giúp')
                .setDescription(`Trang 1/4`)
                .addFields(
                    { name: '`**/weather**`', value: 'Xem thời tiết hiện tại', inline: true },
                    { name: '`**/weather_coord**`', value: 'Xem thời tiết hiện tại theo tọa độ', inline: true },
                    { name: '`**/forecast**`', value: 'Xem dự báo thời tiết', inline: true },
                    { name: '`**/forecast_coord**`', value: 'Xem dự báo thời tiết theo tọa độ', inline: true },
                    { name: '`**/satellite_radiation**`', value: 'Xem dữ liệu bức xạ vệ tinh (satellite radiation)', inline: true },

                ),
            new EmbedBuilder()
                .setTitle('Trợ giúp')
                .setDescription(`Trang 2/4`)
                .addFields(
                    { name: '`**/air_pollution**`', value: 'Xem thông tin ô nhiễm không khí', inline: true },
                    { name: '`**/geo coords_to_location**`', value: 'Chuyển đổi tọa độ thành địa điểm', inline: true },
                    { name: '`**/geo location_to_coords**`', value: 'Chuyển đổi địa điểm thành tọa độ', inline: true },
                    { name: '`**/help**`', value: 'Hiển thị thông tin trợ giúp', inline: true },
                    { name: '`**/donate**`', value: 'Ủng hộ bot nếu bạn thấy hữu ích', inline: true },

                ),
            new EmbedBuilder().setTitle('Trợ giúp').setDescription(`Trang 3/4`).addFields(
                { name: '`**/elevation**`', value: 'Xem độ cao so với mực nước biển', inline: true },
                { name: '`**/flood**`', value: 'Xem nguy cơ ngập lụt', inline: true },
                { name: '`**/vote**`', value: 'Bỏ phiếu cho bot trên top.gg', inline: true },
                { name: '`**/ping**`', value: 'Kiểm tra độ trễ và tình trạng bot', inline: true },
                { name: '`**/about**`', value: 'Xem thông tin về bot', inline: true }
            ),
            new EmbedBuilder().setTitle('Trợ giúp').setDescription(`Trang 4/4`).addFields(
                { name: '`**/feedback**`', value: 'Gửi phản hồi hoặc báo lỗi cho bot', inline: true },
            ),
        ];
    }

    getRow(page) {
        const prev_btn = new ButtonBuilder().setCustomId('help_prev').setEmoji('◀️').setStyle(ButtonStyle.Primary).setDisabled(page === 0);
        const next_btn = new ButtonBuilder().setCustomId('help_next').setEmoji('▶️').setStyle(ButtonStyle.Primary).setDisabled(page === this.help_pages.length - 1);
        const first_btn = new ButtonBuilder().setCustomId('help_first').setEmoji('⏮️').setStyle(ButtonStyle.Secondary).setDisabled(page === 0);
        const last_btn = new ButtonBuilder().setCustomId('help_last').setEmoji('⏭️').setStyle(ButtonStyle.Secondary).setDisabled(page === this.help_pages.length - 1);
        const row = new ActionRowBuilder()
            .addComponents(first_btn, prev_btn, next_btn, last_btn)
        return row;
    }
}

module.exports = {
    HelpPages
}