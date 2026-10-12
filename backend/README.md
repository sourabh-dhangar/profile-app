# Backend API Service (Node.js + Express + MongoDB)

This directory houses the REST API microservices, media upload pipelines, authentication handlers, and admin services for the Personal Digital Profile platform.

## Architecture & Responsibilities
- **Authentication**: Phone Number + OTP verification with SMS gateway (Twilio / MSG91 / Fast2SMS). Rate-limited and protected against brute-force probing.
- **Profile Engine**: CRUD for user profiles and dynamic section schemas (About, Experience, Education, Skills, Services, Achievements, Contact).
- **Reels Engine**: S3 pre-signed video uploads, thumbnail extraction, pagination feed cursor, view tracking.
- **Privacy & Phone Discovery**: Salted HMAC phone lookup engine enforcing explicit opt-in privacy rules.
- **Admin Moderation**: Profile/Reel flagging, reporting review queue, and takedown workflows.

## Directory Layout
```
backend/
├── src/
│   ├── config/               # Database, S3/Cloudinary, OTP, JWT settings
│   ├── controllers/          # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── reel.controller.js
│   │   ├── discovery.controller.js
│   │   ├── admin.controller.js
│   │   └── report.controller.js
│   ├── middlewares/          # Auth guards, role checks, rate limiters
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route declarations
│   ├── services/             # OTP, S3 upload, QR code generation
│   ├── utils/                # Helpers, slugifiers, sanitizers
│   └── server.js             # Server entrypoint
├── .env.example
└── package.json
```
