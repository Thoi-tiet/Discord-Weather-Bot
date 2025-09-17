const express = require('express');
require('dotenv').config();
const app = express();

app.get('/', (req, res) => {
  console.log("Bot is alive.");
  res.send("<h1>Bot is alive.</h1><p>And there is no error in it :)</p>");
});

app.get('/healthz', (req, res) => res.sendStatus(200));
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Health check tại http://0.0.0.0:${port}/healthz`);
});