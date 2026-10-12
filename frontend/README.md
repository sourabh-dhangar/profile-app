# Frontend Web Application (React.js)

This directory houses two critical web interfaces:
1. **Admin Management Dashboard**: For content moderation, user management, reel takedown, and platform metrics.
2. **Public Web Profile Pages**: Light, fast, mobile-responsive web viewer accessible in Chrome/Safari/Firefox by external visitors without installing the mobile app (`myprofile.app/:username`).

## Component Architecture (Repeatable Modular Components)
Built using an atomic, repeatable component hierarchy:
- `components/common/`: `<Button />`, `<Input />`, `<Modal />`, `<Card />`, `<Table />`, `<Badge />`
- `components/public-profile/`:
  - `<ProfileHeader />`: Avatar, display name, handle, verified badge, quick contact CTAs.
  - `<BioSection />`: Formatted rich bio.
  - `<SectionCard />`: Dynamic display for Experience, Education, Skills, Services, and Achievements.
  - `<ReelThumbnailGrid />`: Responsive grid of published reels with view counters.
  - `<ReelModalPlayer />`: In-browser short video player popup.
  - `<ShareQrModal />`: High-resolution downloadable QR code.
- `components/admin/`:
  - `<MetricCard />`: Visual analytics counters.
  - `<ModerationQueueTable />`: Flagged media review with takedown/approve triggers.
  - `<UserFilterToolbar />`: Search by handle, status, and registration date.

## Directory Layout
```
frontend/
├── public/                   # Favicons, assets, brand icons
├── src/
│   ├── assets/               # CSS styles, brand graphics
│   ├── components/           # Modular atomic UI components
│   │   ├── common/
│   │   ├── public-profile/
│   │   └── admin/
│   ├── hooks/                # useAuth, usePublicProfile, usePagination
│   ├── layouts/              # AdminLayout, PublicProfileLayout
│   ├── pages/                # Admin views & Public Profile view
│   ├── services/             # Axios API client instances
│   ├── store/                # Zustand / Redux state management
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```
