# UPSA Life

UPSA Life is a browser-based campus life simulation for UPSA students. Explore the fictional campus, meet student characters, attend activities, manage in-game needs and finances, and follow missions.

## Requirements

- Node.js 20.19 or newer (or 22.12 or newer), as required by Vite 8.
- npm.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Simulation saves stay in this browser's local storage. Resetting a game removes only UPSA Life save keys.

## Build and serve

```sh
npm run check
npm run build
NODE_ENV=production npm start
```

The production server serves the generated `dist` directory on port 3000. Configure the host with Node.js 20.19+ and set `NODE_ENV=production`.

## Free offline guide and NPCs

The phone's study and campus guide and NPC text replies use authored, deterministic rules in the app. They make no AI-provider requests, need no API key, and incur no model usage charges. The guide offers a small set of study prompts, course concept explanations, and fictional in-game location help; it is not a general-purpose language model and does not provide official UPSA information.

The dashboard includes a fictional game activity based on the simulated day and week. It is not a real university event.

## Privacy and production scope

This prototype stores game progress in browser local storage and does not provide accounts, cloud saves, multiplayer, or a moderation/admin service. Do not enter real student records. Campus notices, NPCs, academic figures, landmarks, and wallet balances are simulated game content, not official UPSA services or information. Verify real academic and university information with UPSA.
