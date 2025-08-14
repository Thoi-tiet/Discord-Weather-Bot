const express = require('express');
require('dotenv').config();
const app = express();

app.get('/', (req, res) => {
  console.log("Bot is alive.");
  res.send("<h1>Bot is alive.</h1><p>And there is no error in it :)</p>");
});
app.listen(process.env.PORT || 3000);