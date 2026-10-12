const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const ProfileLookup = require('../models/ProfileLookup');
const Report = require('../models/Report');
const { hashPhone } = require('../utils/crypto');
const { generateQRCodeDataURL } = require('../utils/qr');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB. Clearing existing test collections...');

    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Section.deleteMany({}),
      Reel.deleteMany({}),
      ProfileLookup.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log('Collections cleared. Seeding fresh demo data...');

    // 1. Admin User
    const adminUser = await User.create({
      mobile: '+919999999999',
      countryCode: '+91',
      isVerified: true,
      role: 'admin',
      accountStatus: 'active',
    });

    const adminProfile = await Profile.create({
      userId: adminUser._id,
      name: 'Platform Admin',
      username: 'admin',
      profileType: 'Professional',
      bio: 'MyProfile platform administrator account.',
      status: 'published',
      completionPercentage: 100,
    });

    // 2. Creator 1: Rahul Sharma (Developer)
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
        { platform: 'github', url: 'https://github.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'twitter', url: 'https://twitter.com' },
      ],
      contactDetails: {
        phone: '+919876543210',
        email: 'rahul.sharma@example.com',
        whatsapp: '+919876543210',
        showPhone: true,
        showEmail: true,
        showWhatsapp: true,
      },
    });

    // Sections for Rahul
    await Section.create([
      {
        profileId: profile1._id,
        type: 'about',
        title: 'About Me',
        content: { text: 'Passionate software craftsman with 5+ years of experience in React, Node.js, TypeScript and distributed systems.' },
        order: 0,
        visibility: 'public',
      },
      {
        profileId: profile1._id,
        type: 'skills',
        title: 'Core Technical Skills',
        content: { items: ['JavaScript / TypeScript', 'React & Next.js', 'Node.js & Express', 'MongoDB & PostgreSQL', 'Docker & Kubernetes', 'System Design'] },
        order: 1,
        visibility: 'public',
      },
      {
        profileId: profile1._id,
        type: 'experience',
        title: 'Work Experience',
        content: {
          items: [
            { role: 'Senior Software Engineer', company: 'TechCorp Labs', period: '2022 - Present', description: 'Leading frontend architecture and microservices.' },
            { role: 'Full Stack Developer', company: 'DevStudio', period: '2019 - 2022', description: 'Built client-facing web and mobile applications.' },
          ],
        },
        order: 2,
        visibility: 'public',
      },
    ]);

    // Discovery entry for Rahul
    await ProfileLookup.create({
      hashedPhone: hashPhone('+919876543210'),
      profileId: profile1._id,
      allowDiscovery: true,
    });

    // 3. Creator 2: Priya Patel (Designer & Content Creator)
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
      bio: 'UI/UX Designer & Visual Storyteller. Creating intuitive digital experiences that delight users.',
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
        title: 'Design Services',
        content: { items: ['Mobile App Design (iOS/Android)', 'Design Systems & Figma Prototyping', 'Brand Identity & Guidelines', 'User Research & Testing'] },
        order: 0,
        visibility: 'public',
      },
    ]);

    await ProfileLookup.create({
      hashedPhone: hashPhone('+919811122233'),
      profileId: profile2._id,
      allowDiscovery: true,
    });

    // 4. Sample Reels
    await Reel.create([
      {
        profileId: profile1._id,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        caption: '5 Architecture tips for scalable Node.js microservices 🚀 #coding #architecture #javascript',
        durationSeconds: 25,
        visibility: 'public',
        status: 'active',
        viewsCount: 342,
        likesCount: 58,
      },
      {
        profileId: profile2._id,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
        caption: 'Redesigning a mobile onboarding experience in 60 seconds ✨ #uiux #design #figma',
        durationSeconds: 38,
        visibility: 'public',
        status: 'active',
        viewsCount: 890,
        likesCount: 142,
      },
    ]);

    console.log('✅ Seeding completed successfully!');
    console.log('--- Summary ---');
    console.log('Admin Mobile: +919999999999 (OTP: 123456)');
    console.log('User 1: rahul_dev (+919876543210, OTP: 123456)');
    console.log('User 2: priya_design (+919811122233, OTP: 123456)');
    console.log('Sample Reels Created: 2');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
