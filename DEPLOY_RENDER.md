# Deploy to Render + Neon

## 1. Create Neon Postgres

1. Create a Neon project.
2. Copy the pooled or direct Postgres connection string.
3. Keep the connection string private. It will be used as `DATABASE_URL` in Render.

## 2. Create Render Web Service

Use this repository as a Render Web Service.

Build command:

```bash
npm ci && npm run build
```

Start command:

```bash
npm run start
```

Health check path:

```text
/health
```

## 3. Set Render Environment Variables

Required:

```env
DATABASE_URL=postgresql://...
DB_SSL=true
DB_SYNCHRONIZE=true
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=replace-with-a-strong-password
DEFAULT_BRANCH_NAME=Default Branch
ENABLE_AWS_REKOGNITION=false
```

Render sets `PORT` automatically, so do not hard-code it there.

## 4. First Login

After deploy, the app seeds the default branch, roles, and admin user.

Login endpoint:

```text
POST https://your-render-service.onrender.com/api/admin/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "your DEFAULT_ADMIN_PASSWORD"
}
```

## Note

`DB_SYNCHRONIZE=true` is convenient for the first MVP deploy because this project does not have migrations yet. For real production, add migrations and set `DB_SYNCHRONIZE=false`.
