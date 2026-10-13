# UPSA Life

A browser-based campus life game for UPSA students. Explore the fictional campus, meet student characters, attend activities, manage in-game needs and finances, and follow missions. The study guide and NPC responses run locally without AI API calls.

## Run locally

Requirements: Node.js 20.19+ and Docker Desktop (or another PostgreSQL 16 server).

1. Copy `.env.example` to `.env`.
2. Start the local database: `docker compose up -d db`.
For the easiest local run, use `docker compose up --build` and open http://localhost:3000. The compose stack builds the app and starts PostgreSQL.

For frontend development with hot reload, start just the database with `docker compose up -d db`, then run `npm install` and `npm run dev`. The server creates the required database tables on startup. Create an account to sync progress to PostgreSQL.

## Build and production server

```sh
npm install
npm run check
npm run build
NODE_ENV=production npm start
```

The Node server serves the built site and its account/save APIs on `PORT` (3000 by default). Deploy the Node server and PostgreSQL database together or connect it to a managed PostgreSQL service. Configure these secrets in the hosting dashboard:

- `DATABASE_URL`: private connection string for PostgreSQL.
- `DATABASE_SSL=true` when required by your database host.
- `NODE_ENV=production`.
- `PORT`: supplied by most app hosts.
- `TRUST_PROXY_HOPS`: number of trusted hosting proxies (usually 1 when deployed behind one proxy).

Keep the database private. Use managed backups and point-in-time recovery for production. The server applies additive `CREATE TABLE IF NOT EXISTS` schema setup at startup; see `db/schema.sql`.

## Accounts and saves

Users create accounts with an email and password (10–128 characters). Passwords are stored as salted scrypt hashes. Sessions use random HttpOnly, SameSite cookies with a 14-day expiry; production cookies require HTTPS. Game saves are private per account and stored as JSONB. A save is synchronized while the game is open and restored on sign-in. Local browser storage remains available for guests and brief network interruptions.

The prototype does not yet include email verification, password-reset email, MFA, account deletion UI, moderation, or multiplayer. Add those before a broad public launch. Never use real UPSA credentials or enter real academic records.

## Product content

Campus locations, events, student characters, grades, notices, and wallet values are simulated content, not official UPSA records or services. Verify campus details, get permission for UPSA branding, and run a student pilot before representing the game as officially affiliated.

## Free offline guide

The phone guide, contextual NPC text and rotating game activity are authored local rules/content. They do not call a model provider and do not incur AI API charges. The tutor is not a general-purpose language model or official source.
