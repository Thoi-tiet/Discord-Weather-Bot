const express = require('express');
require('dotenv').config();
const app = express();

app.get('/', (req, res) => {
  console.log("Bot is alive.");
  res.send("Bot is alive.");
});
app.listen(process.env.PORT || 3000);