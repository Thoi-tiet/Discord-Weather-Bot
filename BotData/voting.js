const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');

app.use(bodyParser.json());
const { client, EmbedBuilder } = require('../bot.js');
app.post('/topgg-webhook', (req, res) => {
    const auth = req.headers.authorization;
    if (auth !== process.env.TOPGG_WEBHOOK_AUTH) {
        return res.status(401).send('Unauthorized');
    }
    const { user, type } = req.body;
    console.log(`Received vote from user: ${user}, type: ${type}`);
    const member = client.users.cache.get(user);
    if (member) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Vote Received')
            .setDescription(`💖 Cảm ơn bạn <@${user}> đã vote cho bot!`)
            .setFooter({ text: 'Vote thành công!\nDev by @random.person.255' })
            .setTimestamp();
        member.send({ embeds: [embed] });
    }
    res.sendStatus(200);
});
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Webhook server running at http://0.0.0.0:${port}`);
});