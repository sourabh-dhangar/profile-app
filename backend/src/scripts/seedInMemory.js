const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const ProfileLookup = require('../models/ProfileLookup');
const { hashPhone } = require('../utils/crypto');
const { generateQRCodeDataURL } = require('../utils/qr');
const config = require('../config/env');

const seedInMemory = async () => {
  const count = await User.countDocuments();
  if (count > 0) return;

  console.log('🌱 Seeding initial demo users and profiles into database...');

  // Admin User
  const admin = await User.create({
    mobile: '+919999999999',
    countryCode: '+91',
    isVerified: true,
    role: 'admin',
    accountStatus: 'active',
  });

  await Profile.create({
    userId: admin._id,
    name: 'Platform Admin',
    username: 'admin',
    profileType: 'Professional',
    bio: 'MyProfile platform administrator.',
    status: 'published',
    completionPercentage: 100,
  });

  // Creator 1: Rahul Sharma
  const user1 = await User.create({
    mobile: '+919876543210',
    countryCode: '+91',
    isVerified: true,
    role: 'user',
    accountStatus: 'active',
  });

  const qr1 = await generateQRCodeDataURL(`${config.frontendUrl}/p/rahul_dev`);
  const profile1 = await Profile.create({
    userId: user1._id,
    name: 'Rahul Sharma',
    username: 'rahul_dev',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    profileType: 'Professional',
    bio: 'Full Stack Engineer building high-performance web applications and cloud architectures.',
    city: 'Bengaluru',
    status: 'published',
    completionPercentage: 95,
    qrCodeUrl: qr1,
    socialLinks: [
      { platform: 'website', url: 'https://rahulsharma.dev' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
    contactDetails: {
      phone: '+919876543210',
      email: 'rahul.dev@example.com',
      whatsapp: '+919876543210',
      showPhone: true,
      showEmail: true,
      showWhatsapp: true,
    },
  });

  await Section.create([
    {
      profileId: profile1._id,
      type: 'about',
      title: 'About Me',
      content: { text: 'Passionate software craftsman with 5+ years of experience in React, Node.js, and cloud native systems.' },
      order: 0,
      visibility: 'public',
    },
    {
      profileId: profile1._id,
      type: 'skills',
      title: 'Skills & Tech Stack',
      content: { items: ['JavaScript / TypeScript', 'React & Tailwind CSS', 'Node.js & Express', 'MongoDB', 'Docker & AWS', 'GraphQL'] },
      order: 1,
      visibility: 'public',
    },
    {
      profileId: profile1._id,
      type: 'experience',
      title: 'Work Experience',
      content: {
        items: [
          { role: 'Senior Frontend Engineer', company: 'NextWave Tech', period: '2022 - Present', description: 'Architecting scalable dashboard systems and microfrontends.' },
          { role: 'Full Stack Developer', company: 'CloudCore Labs', period: '2019 - 2022', description: 'Built REST APIs, mobile backends, and responsive SPAs.' },
        ],
      },
      order: 2,
      visibility: 'public',
    },
  ]);

  await ProfileLookup.create({
    hashedPhone: hashPhone('+919876543210'),
    profileId: profile1._id,
    allowDiscovery: true,
  });

  // Creator 2: Priya Patel
  const user2 = await User.create({
    mobile: '+919811122233',
    countryCode: '+91',
    isVerified: true,
    role: 'user',
    accountStatus: 'active',
  });

  const qr2 = await generateQRCodeDataURL(`${config.frontendUrl}/p/priya_design`);
  const profile2 = await Profile.create({
    userId: user2._id,
    name: 'Priya Patel',
    username: 'priya_design',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    profileType: 'Freelancer',
    bio: 'Product Designer & Visual Creator. Crafting simple, human-centered UI & digital brands.',
    city: 'Mumbai',
    status: 'published',
    completionPercentage: 90,
    qrCodeUrl: qr2,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'youtube', url: 'https://youtube.com' },
    ],
    contactDetails: {
      email: 'priya.design@example.com',
      showEmail: true,
    },
  });

  await Section.create([
    {
      profileId: profile2._id,
      type: 'services',
      title: 'Services Offered',
      content: { items: ['Mobile App UI/UX Design', 'Design Systems in Figma', 'Brand Identity & Logos', 'UX Audit & Conversion Optimization'] },
      order: 0,
      visibility: 'public',
    },
  ]);

  await ProfileLookup.create({
    hashedPhone: hashPhone('+919811122233'),
    profileId: profile2._id,
    allowDiscovery: true,
  });

  // Reels
  await Reel.create([
    {
      profileId: profile1._id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      caption: 'Top 3 tips for writing cleaner Express.js middleware ⚡ #nodejs #backend #webdev',
      durationSeconds: 22,
      visibility: 'public',
      status: 'active',
      viewsCount: 420,
      likesCount: 88,
    },
    {
      profileId: profile2._id,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
      caption: 'My favorite design tokens and color harmonies for 2025 ✨ #uiux #figma',
      durationSeconds: 35,
      visibility: 'public',
      status: 'active',
      viewsCount: 1042,
      likesCount: 230,
    },
  ]);

  console.log('✅ Demo seeding finished: 2 creators, 2 reels, 1 admin ready!');
};

module.exports = seedInMemory;
