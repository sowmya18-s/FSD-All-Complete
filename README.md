# Digital Certificate Verification Portal

A MERN application for student certificate submissions, administrator review, audit history, and public certificate-number verification.

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB Atlas cluster and a database user with access to the application database

## Local setup

1. Install dependencies from the repository root:

   ```powershell
   npm run install-all
   ```

2. Create `backend/.env` from `backend/.env.example` and set:
   - `MONGODB_URI`: the Atlas connection URI for this application database. URL-encode special characters in the database user's password.
   - `JWT_SECRET`: a private random secret of at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   - `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`: values for the first administrator. Use a unique password with 8–72 UTF-8 bytes.
   - `CLIENT_URL`: `http://localhost:5173` for local development.

3. Optionally create `frontend/.env` from `frontend/.env.example`. `VITE_API_URL=http://localhost:5000/api` is the local API address. The Vite development proxy also forwards `/api` requests to port 5000.

4. Create the administrator once the database settings are configured:

   ```powershell
   npm run seed
   ```

   The seed command requires the three `ADMIN_*` values and does not create or display default credentials. Public registration creates student accounts only.

5. Start the API and frontend in separate terminals from the repository root:

   ```powershell
   npm run backend
   ```

   ```powershell
   npm run frontend
   ```

   The frontend runs at `http://localhost:5173`; the API listens on `http://localhost:5000` unless `PORT` is set. Check API/database readiness at `/api/health`.

## Environment variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | Use `production` for Render deployment. |
| `PORT` | No | HTTP port; defaults to `5000` locally. Render supplies this in deployment. |
| `MONGODB_URI` | Yes | MongoDB Atlas connection URI. |
| `JWT_SECRET` | Yes | Private signing secret, at least 32 characters. Never use the example placeholder. |
| `CLIENT_URL` | Yes in production | Allowed frontend origin(s), comma-separated if needed, e.g. `https://portal.example.com`. Locally defaults to the Vite localhost origin. |
| `ADMIN_NAME` | For admin seeding | Initial admin display name. |
| `ADMIN_EMAIL` | For admin seeding | Initial admin email address. |
| `ADMIN_PASSWORD` | For admin seeding | Unique initial admin password (8–72 UTF-8 bytes). |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Required for production builds | Public backend API base URL, including `/api`, e.g. `https://your-service.onrender.com/api`. Do not put secrets in `VITE_*` variables. |

The placeholder templates are `backend/.env.example` and `frontend/.env.example`. Real `.env` files are ignored by Git.

## Deployment

### MongoDB Atlas

1. Create a production cluster and a dedicated database user with only the permissions needed for the app database.
2. Configure Atlas Network Access to allow the Render service's outbound IP addresses when available. Do not use a broad public allow rule unless the hosting/network setup leaves no narrower option.
3. Copy the application database connection URI into Render's `MONGODB_URI` setting; do not commit it or put it in Vercel settings.

### Render (backend)

1. Create a Web Service from this repository and set its **Root Directory** to `backend`.
2. Use `npm install` as the build command and `npm start` as the start command.
3. Configure `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` in the Render environment settings. Set `CLIENT_URL` to the exact deployed Vercel origin (no trailing slash); multiple allowed origins may be comma-separated.
4. Configure `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` securely when running the one-time seed command (`npm run seed`) from the backend directory. Keep them out of source control and logs.
5. Wait for `/api/health` to report `status: "ok"` and `database: "connected"`.

The API listens on `process.env.PORT` and falls back to port 5000.

### Vercel (frontend)

1. Import the repository into Vercel and set **Root Directory** to `frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `VITE_API_URL` to the Render API URL ending in `/api`, such as `https://your-service.onrender.com/api`.
4. Deploy only after the backend's production CORS setting includes the Vercel origin.

`frontend/vercel.json` rewrites nested frontend routes to `index.html` so browser refreshes work.

## Security and application behavior

- Passwords are hashed with bcryptjs. JWT secret configuration is mandatory; the server will not start with the example placeholder.
- Student registration cannot set an admin role. Admin accounts must be provisioned through the protected seed process.
- Admin routes require a valid JWT and the database-backed `admin` role. Student certificate reads/updates/deletes are scoped to the authenticated owner.
- Certificate searches are treated as literal text; request fields and filters are validated and errors do not return internal exception details.
- Public verification returns only the certificate details intended for verification; it does not expose the student's email or account identifier.

## Checks

From the repository root:

```powershell
npm --prefix frontend run build
```

```powershell
node --check backend/server.js
```

Backend API workflows require a reachable MongoDB instance and valid environment variables. No database credentials are included in this repository.
