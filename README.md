# UPSA Life

A browser-based student life simulation set at the University of Professional Studies, Accra. Explore the campus and hostel, attend activities, manage in-game needs and finances, and chat with a campus tutor.

## Requirements

- Node.js 20.19 or newer (or 22.12 or newer), as required by Vite 8.
- npm.
- A Gemini API key is optional. Without it, the tutor uses local fallback responses.

## Run locally

```sh
npm install
cp .env.example .env
# Set GEMINI_API_KEY in .env if you want live AI tutor responses.
npm run dev
```

Open http://localhost:3000. The app stores simulation saves in this browser's local storage. Resetting a game removes only UPSA Life save keys.

## Build and serve

```sh
npm run check
npm start
```

The production server serves the generated `dist` directory. Set `NODE_ENV=production` and `GEMINI_API_KEY` in the hosting environment. Keep the API key on the server; never add it to frontend environment variables.

## AI tutor and privacy

When live AI is enabled, the tutor request sends the question, recent chat context, and the student's name, programme, level, and GPA to this server. The server forwards that information to Google's Gemini API. Do not enter real personal or academic information unless you are comfortable sharing it with that service. Saves remain in browser local storage; this prototype does not provide accounts or cloud save synchronization.

The AI route limits each IP to 8 requests per minute and caps request/history sizes. The limiter is in-memory and applies per server process. For multi-instance deployments, add a shared rate-limit store or enforce quotas at the gateway, and configure proxy handling only for trusted reverse proxies.

## Prototype scope

Campus notices, academic standing, wallet balances, NPC conversations, and campus landmarks are simulated content. They are not official UPSA records or services. The AI tutor can make mistakes; verify real academic and university information with official sources.
