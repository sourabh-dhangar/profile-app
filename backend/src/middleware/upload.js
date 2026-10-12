const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

// Ensure base upload directories exist
const uploadBaseDir = path.resolve(config.uploadDir);
const photosDir = path.join(uploadBaseDir, 'photos');
const reelsDir = path.join(uploadBaseDir, 'reels');

[uploadBaseDir, photosDir, reelsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Photo storage engine
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

// Reel storage engine
const reelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reelsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `reel-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;
  if (allowed.test(ext) && (mime.startsWith('image/') || allowed.test(mime))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
  }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  const allowed = /mp4|webm|mov|mkv/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;
  if (allowed.test(ext) || mime.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, webm, mov, mkv) are allowed'));
  }
};

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFileFilter,
});

const uploadReel = multer({
  storage: reelStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: videoFileFilter,
});

module.exports = {
  uploadPhoto,
  uploadReel,
};
