const express = require('express');
require('dotenv').config();
const app = express();

app.get('/', (req, res) => {
  console.log("Bot is alive.");
  res.send(`
    <html>
      <head>
        <title>Discord Bot Keepalive</title>
        <style>
          body {
            background-color: #121212;
            color: #f1f1f1;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          h1 {
            color: #00bfff;
          }
          .info {
            margin-top: 10px;
            font-size: 0.9em;
            opacity: 0.8;
          }
          button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1em;
            background-color: #00bfff;
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h1>☁ Discord Thời tiết#6014 Bot Keepalive Server</h1>
        <div class="info">The bot is running and healthy 🚀</div>
        <button onclick="location.reload()">Refresh</button>
        <a href="/status" style="color: white; text-decoration: none;"><button>Status</button></a>
        <a href="/healthz" style="color: white; text-decoration: none;"><button>Health Check</button></a>
      </body>
    </html>
  `);
});

// Gửi phản hồi json 200 OK cho các yêu cầu kiểm tra sức khỏe
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok', timestamp: new Date().toISOString(),
    uptime: process.uptime(), memoryUsage: process.memoryUsage(), platform: process.platform, nodeVersion: process.version,
    cpuUsage: process.cpuUsage(), loadAverage: require('os').loadavg()
  });
});

app.get('/healthz', (req, res) => res.sendStatus(200));
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Health check tại http://0.0.0.0:${port}/healthz`);
});