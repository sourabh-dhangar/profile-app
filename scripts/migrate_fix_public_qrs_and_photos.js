const mongoose = require('mongoose');
const config = require('../backend/src/config/env');
const Profile = require('../backend/src/models/Profile');
const Reel = require('../backend/src/models/Reel');
const { generateQRCodeDataURL } = require('../backend/src/utils/qr');
const { normalizeMediaUrl } = require('../backend/src/utils/url');

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(config.mongoUri);
  console.log('Connected!');

  const profiles = await Profile.find({});
  console.log(`Found ${profiles.length} profiles to verify and sync.`);

  const FRONTEND_BASE = 'https://myprofile-official-web.vercel.app';

  for (const p of profiles) {
    const webUrl = `${FRONTEND_BASE}/p/${p.username}`;
    console.log(`Generating verified public QR for @${p.username} -> ${webUrl}`);
    const qrDataUrl = await generateQRCodeDataURL(webUrl);

    p.qrCodeUrl = qrDataUrl;
    if (p.photoUrl) {
      p.photoUrl = normalizeMediaUrl(p.photoUrl, 'image');
    }

    await p.save();
    console.log(`✓ Updated @${p.username} successfully.`);
  }

  // Also check Reels
  const reels = await Reel.find({});
  console.log(`Checking ${reels.length} reels for Google Drive & media normalization...`);
  for (const r of reels) {
    let changed = false;
    if (r.thumbnailUrl) {
      const normThumb = normalizeMediaUrl(r.thumbnailUrl, 'image');
      if (normThumb !== r.thumbnailUrl) {
        r.thumbnailUrl = normThumb;
        changed = true;
      }
    }
    if (r.videoUrl) {
      const normVideo = normalizeMediaUrl(r.videoUrl, 'video');
      if (normVideo !== r.videoUrl) {
        r.videoUrl = normVideo;
        changed = true;
      }
    }
    if (r.mediaUrl) {
      const normMedia = normalizeMediaUrl(r.mediaUrl, r.mediaType || 'video');
      if (normMedia !== r.mediaUrl) {
        r.mediaUrl = normMedia;
        changed = true;
      }
    }
    if (changed) {
      await r.save();
      console.log(`✓ Normalized reel ${r._id}`);
    }
  }

  console.log('All profiles & reels updated with public verified QR codes and normalized URLs!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
