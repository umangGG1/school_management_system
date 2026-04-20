# Render + Vercel Deployment

## Architecture

- Backend: Render Web Service from `backend/`
- Frontend: Vercel Project from `frontend/`
- Database: PostgreSQL reachable from Render via `DATABASE_URL`
- Redis: Redis reachable from Render via `REDIS_URL`

## Backend on Render

Create a Render Web Service rooted at `backend/`.

- Build command: `npm ci && npm run build`
- Start command: `npm run start:render`
- Runtime: Node

Set these environment variables on Render:

- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_URL=<your postgres connection string>`
- `DB_SSL=false`
- `REDIS_URL=<your redis connection string>`
- `JWT_SECRET=<strong random secret>`
- `JWT_REFRESH_SECRET=<strong random secret>`
- `JWT_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `FRONTEND_URLS=https://your-project.vercel.app,https://your-custom-domain.com,https://*.vercel.app`

Optional integrations:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `AT_USERNAME`
- `AT_API_KEY`
- `PESAPAL_ENV`
- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `PESAPAL_IPN_ID`

Notes:

- `start:render` runs TypeORM migrations before starting the API.
- The backend now accepts `DATABASE_URL` and `REDIS_URL` directly, which is the simplest setup for Render-managed services or external providers.
- CORS and websocket origins are controlled by `FRONTEND_URLS`. Wildcards like `https://*.vercel.app` are supported.

## Frontend on Vercel

Create a Vercel project rooted at `frontend/`.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Set this environment variable on Vercel:

- `VITE_API_URL=https://your-render-backend.onrender.com/api`

Notes:

- `frontend/vercel.json` rewrites all routes to `index.html`, which is required because the app uses `BrowserRouter`.
- After changing the Render backend URL, redeploy Vercel so the new `VITE_API_URL` is baked into the frontend build.

## Recommended order

1. Deploy the backend on Render.
2. Copy the live Render backend URL.
3. Set `VITE_API_URL` in Vercel.
4. Deploy the frontend on Vercel.
5. Update Render `FRONTEND_URLS` to the final Vercel domain and any custom domain.
6. Redeploy Render if you changed env vars.

## Post-deploy checks

- Open `https://your-render-backend.onrender.com/api/health`
- Open the Vercel frontend and test login/API requests
- Confirm browser network calls go to the Render API, not `localhost`
- If you use websockets, confirm the frontend domain is included in `FRONTEND_URLS`
