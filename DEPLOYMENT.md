# Booky Deployment Guide

## Local Docker Testing

### 1. Start with default port (3000)
```bash
docker compose -f docker-compose.local.yml up -d
```

### 2. Use a custom port (if 3000 is busy)
```bash
# Windows PowerShell
$env:BOOKY_PORT="3001"; docker compose -f docker-compose.local.yml up -d

# Linux/Mac
BOOKY_PORT=3001 docker compose -f docker-compose.local.yml up -d
```

### 3. Access the app
Open http://localhost:3000 (or your custom port)

### 4. Stop
```bash
docker compose -f docker-compose.local.yml down
```

---

## Coolify Deployment

### Option A: Deploy via Docker Compose (Recommended)

1. In Coolify, go to **Projects** → **New** → **Docker Compose**
2. Connect your Git repository or paste `docker-compose.coolify.yml`
3. Set these **Environment Variables** in Coolify:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | `https://booky.yourdomain.com/api/v1/auth` |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | Strong random password |
| `MEILI_MASTER_KEY` | Strong random password |
| `NEXT_PUBLIC_CREDENTIALS_ENABLED` | `true` |

4. Configure domain in Coolify's **Domains** section
5. Deploy!

### Option B: Deploy as Dockerfile

1. In Coolify, **New** → **Dockerfile**
2. Point to this repository
3. Coolify will use the `Dockerfile` in root
4. You'll need a **separate PostgreSQL** and **Meilisearch** service in Coolify
5. Set `DATABASE_URL` and `MEILI_HOST` environment variables accordingly

---

## Port Conflicts in Coolify

Since you have many apps, Coolify's **Traefik proxy** handles routing by domain - you don't need to manage ports manually. Each app gets its own subdomain (e.g., `booky.yourdomain.com`).

If using Docker Compose deployment, all services use internal networking and only the `linkwarden` service is exposed via Traefik.

---

## Data Persistence

The Coolify compose uses Docker volumes:
- `postgres_data` - Database
- `meili_data` - Search index
- `app_data` - Uploaded files and archives

These persist across deployments.
