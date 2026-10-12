# Production Containerization & Deployment Guide

## 1. Overview
The MyProfile platform is packaged with a modular, enterprise-grade Docker Compose architecture providing full service isolation, zero-root security, persistent storage volumes, automated daily database backups, and a high-performance Nginx gateway reverse proxy with dual HTTP/HTTPS support.

```
                          Internet / Clients
                                  │
                                  ▼
               ┌─────────────────────────────────────┐
               │    Gateway Nginx Reverse Proxy      │
               │         (Ports 80 & 443)            │
               └───────┬──────────────┬──────────────┘
                       │              │
         /api/*, /health              │ /*
                       ▼              ▼
           ┌────────────────┐   ┌────────────────┐
           │ Express API    │   │ React SPA      │
           │ (Node 20)      │   │ (Nginx Static) │
           └───────┬────────┘   └────────────────┘
                   │
                   ▼ (internal-net)
           ┌────────────────┐   ┌────────────────┐
           │ MongoDB 7.0    │◄──┤ Backup Daemon  │
           │ (Named Volume) │   │ (mongodump 24h)│
           └────────────────┘   └────────────────┘
```

---

## 2. Service Topology

| Service | Image / Build | Port (Host:Container) | Network | Description |
|---|---|---|---|---|
| **gateway** | `nginx:alpine` | `80:80`, `443:443` | `public-net`, `internal-net` | Front-facing reverse proxy routing `/`, `/api`, and `/uploads`. |
| **backend** | `./backend/Dockerfile` | `5000` (Internal) | `internal-net` | Express REST API on Node.js 20 Alpine running as non-root `node`. |
| **frontend** | `./frontend/Dockerfile` | `80` (Internal) | `internal-net` | Pre-built Vite SPA served with Nginx gzip & SPA deep linking. |
| **mongo** | `mongo:7.0-jammy` | `27017` (Internal) | `internal-net` | Isolated MongoDB database with persistent named volume. |
| **backup** | `./docker/backup/Dockerfile` | None | `internal-net` | Automated daily `mongodump` daemon with 7-day retention. |

---

## 3. Quickstart Deployment

### Prerequisites
- Docker Engine 24+ & Docker Compose v2+
- Port 80 (and optionally 443) free on host

### Step 1: Initialize Environment File
```bash
cp .env.docker.example .env.docker
```
Edit `.env.docker` to set your secure `JWT_SECRET` and public URLs:
```ini
HTTP_PORT=80
HTTPS_PORT=443
JWT_SECRET=super_secure_production_secret_key_change_me
PUBLIC_URL=http://yourdomain.com
FRONTEND_URL=http://yourdomain.com
BACKUP_INTERVAL_SECONDS=86400
RETENTION_DAYS=7
```

### Step 2: Validate Configuration
```bash
npm.cmd run verify:docker
# or
node scripts/docker-verify.js
```

### Step 3: Launch Full Platform
```bash
docker compose --env-file .env.docker up -d --build
```

### Step 4: Verify Service Health
```bash
docker compose ps
curl -I http://localhost/health
```

---

## 4. Persistent Storage & Backups

### Named Volumes
- `myprofile_mongo_data`: Primary MongoDB data files (`/data/db`).
- `myprofile_uploads_data`: User avatar images, video reels, and generated QR codes.
- `myprofile_backup_data`: Automated daily gzipped MongoDB archives.

### Automated Backups
The `backup` container automatically executes `mongodump` every 24 hours (`86400s`), saving timestamped archives to `/backups/myprofile_YYYY-MM-DD_HHMMSS.gz`, and prunes archives older than 7 days.

### Manual On-Demand Backup
```bash
docker compose exec mongo mongodump --db myprofile --archive=/data/db/manual_backup.gz --gzip
```

### Database Restoration from Archive
```bash
docker compose exec -T mongo mongorestore --archive --gzip --drop < /path/to/backup.gz
```

---

## 5. Production SSL/TLS (Let's Encrypt / Certbot)

1. Point your domain DNS `A` record to your server's public IP address.
2. The Gateway Nginx includes the ACME challenge path (`/.well-known/acme-challenge/`).
3. Request initial certificates:
   ```bash
   docker run -it --rm \
     -v myprofile_certbot_www:/var/www/certbot \
     -v myprofile_certbot_conf:/etc/letsencrypt \
     certbot/certbot certonly --webroot \
     -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com
   ```
4. Copy `docker/nginx/ssl-template.conf` to active Nginx configuration, replacing `yourdomain.com` with your domain.
5. Reload Nginx gateway:
   ```bash
   docker compose exec gateway nginx -s reload
   ```

---

## 6. Rolling Updates & Maintenance

To perform a zero-downtime rolling update when code is updated:
```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart containers
docker compose --env-file .env.docker up -d --build --no-deps backend frontend

# 3. Clean up dangling images
docker image prune -f
```
