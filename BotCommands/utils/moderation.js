const {
    client, OWM_API_KEY, CLIENT_ID, TOKEN, fetch, apiKeys
} = require('./../../bot.js');
const { Events } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, './../../.env') });

const OWNER_SERVERS = process.env.OWNER_SERVERS.split(",").map(id => id.trim());

module.exports = {
    OWNER_SERVERS
};