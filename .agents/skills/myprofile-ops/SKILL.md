---
name: myprofile-ops
description: Comprehensive operational guide and developer cheatsheet for the MyProfile platform, covering architecture, API endpoints, test suites, themes, and Docker deployment.
---

# MyProfile Platform Operations & Development Skill

This skill documents architectural patterns, API contracts, testing guidelines, and operational runbooks for the full-stack MyProfile digital identity and video portfolio platform.

---

## 1. System Architecture & Port Mapping

Component         | Runtime               | Port (Local) | Port (Docker Gateway)
:---------------- | :-------------------- | :----------- | :--------------------
**Backend API**   | Node.js 20 / Express  | `5000`       | `80` (`/api/*`)
**Web Frontend**  | React 18 / Vite 5     | `5173`       | `80` (`/*`)
**Mobile App**    | React Native / Expo   | `8081`       | N/A
**Database**      | MongoDB 7.0 / mongod  | `27017`      | Internal container
**Reverse Proxy** | Nginx Alpine          | N/A          | `80` (HTTP) / `443` (TLS)

---

## 2. Windows Development Rules

Per workspace rules in `.agents/rules/`:
- **Shell Commands**: Always use `npm.cmd` and `npx.cmd` in PowerShell on Windows to prevent `PSSecurityException` and `EINVAL`.
- **Node Scripts**: Invoke directly via `node <path>`.

---

## 3. Key REST API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /request-otp`: Request 6-digit OTP for phone. (Dev bypass: `123456`).
- `POST /verify-otp`: Exchange mobile + OTP for JWT Bearer token.
- `GET /me`: Retrieve authenticated user identity.

### Profiles & Modular Content (`/api/v1/profiles`)
- `GET /me`: Authenticated creator profile with completion score.
- `PUT /me`: Update profile details, theme, and privacy flags.
- `POST /me/publish`: Transition profile from draft to published (requires >= 40% completion).
- `GET /me/analytics`: Retrieve 7-day view trends and itemized link clicks.
- `GET /me/inquiries`: Retrieve visitor inquiry messages sent to creator.
- `PUT /me/inquiries/:id/status`: Update inquiry status (`read`, `unread`, `archived`).
- `GET /check-username/:slug`: Check username availability.
- `GET /:username`: Public published profile with modular sections and reels.
- `GET /:username/vcard`: Download RFC 6350 compliant `.vcf` contact card.
- `POST /:username/view`: Ping visitor view counter.
- `POST /:username/click`: Track outbound link click engagement.
- `POST /:username/inquiries`: Submit direct visitor inquiry message.

### Reels & Moderation (`/api/v1/reels`, `/api/v1/reports`, `/api/v1/admin`)
- `GET /api/v1/reels`: Feed of published short video reels (<= 60s).
- `POST /api/v1/reels/:id/like`: Increment reel like counter.
- `POST /api/v1/reports`: File content moderation flag.
- `GET /api/v1/admin/metrics`: Platform statistics (admin only).

---

## 4. Visual Themes
Curated theme keys in `Profile.theme`:
1. `default`: Emerald Slate (`#10b981`)
2. `dark-neon`: Cyber Violet (`#8b5cf6`)
3. `minimalist-luxe`: Champagne Gold (`#d4af37`)
4. `cyberpunk-emerald`: Cyan Matrix (`#06b6d4`)
5. `sunset-gradient`: Crimson Amber (`#f43f5e`)

---

## 5. Testing & Verification Runbook

Run complete 6-tier E2E test suite:
```powershell
npm.cmd test
```

Run Docker configuration validation:
```powershell
npm.cmd run verify:docker
```

Start full containerized stack:
```powershell
docker compose --env-file .env.docker up -d --build
```
