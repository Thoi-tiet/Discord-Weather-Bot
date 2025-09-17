# Discord Weather Bot

## Overview
A Discord bot that provides comprehensive weather information through slash commands. Built with Node.js using discord.js and OpenWeatherMap API.

## Recent Changes (September 17, 2025)
- Imported fresh GitHub project to Replit environment
- Configured keepalive server for port 5000 with proper host settings (0.0.0.0)
- Set up proper workflow to run Discord bot
- Configured deployment as VM for continuous operation
- Updated .gitignore for Node.js best practices
- Successfully integrated with Replit secrets management

## Project Architecture
- **Main Bot**: `bot.js` - Discord bot with slash commands for weather data
- **Keepalive Server**: `keepalive.js` - Express server on port 5000 to keep bot alive
- **Dependencies**: discord.js v14, express v5, dotenv, node-fetch v3

## Environment Variables
- `TOKEN` - Discord Bot Token
- `CLIENT_ID` - Discord Application Client ID  
- `OWM_API_KEY` - OpenWeatherMap API Key

## Bot Features
- Weather information by location and coordinates
- Weather forecasts with customizable time ranges
- Weather icons display
- Air pollution data
- Satellite radiation information
- Elevation data
- Flood risk assessment
- IP geolocation
- Location/coordinate conversion
- Help and donation commands

## Deployment Configuration
- **Development**: Workflow running `node bot.js` on port 5000
- **Production**: VM deployment configured with `node bot.js`
- **Port**: Dynamic (uses $PORT environment variable, defaults to 5000)
- **Host**: 0.0.0.0 (Replit proxy compatibility)
- **Health Check**: Available at `/healthz` endpoint

## Status
✅ Fully configured and running in Replit development environment
✅ Discord bot successfully connected and operational
✅ All slash commands registered
✅ Keepalive server accessible with dynamic port configuration
✅ Ready for production deployment