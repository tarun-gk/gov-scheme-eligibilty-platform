# Gov Scheme Platform

Production-oriented platform for exploring Indian government schemes, checking eligibility, managing user profiles, and running admin workflows.

## Why It Exists

The app centralizes scheme discovery, eligibility evaluation, and profile management so the backend logic, database setup, and frontend UI stay in one maintainable codebase.

## How To Run

1. Install dependencies from the repo root.
2. Configure `backend/.env` from `backend/.env.example`.
3. Initialize the database.
4. Start the frontend and backend.

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
npm run init:db
npm run dev
```

## Contributing

Keep changes small, feature-oriented, and production-safe. Prefer removing dead code over preserving legacy scaffolding. Any new environment variable should be added to `backend/.env.example` with a placeholder value.

## Environment Variables

All runtime configuration lives in `backend/.env`.

- `NODE_ENV`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL_DAYS`
- `REDIS_URL`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `QDRANT_COLLECTION`
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL`
- `OPENAI_CHAT_MODEL`
- `API_RATE_LIMIT_WINDOW_MS`
- `API_RATE_LIMIT_MAX_IP`
- `API_RATE_LIMIT_MAX_USER`
- `CACHE_TTL_SECONDS`
- `NOTIFICATION_PROVIDER_URL`

## Folder Structure

```text
gov-scheme-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── server.js
│   ├── scripts/
│   ├── tests/
│   └── init_db.mjs
├── database/
│   ├── schema/
│   ├── queries/
│   ├── exports/
│   └── dataset/
├── frontend/
│   └── src/
├── .gitignore
└── README.md
```