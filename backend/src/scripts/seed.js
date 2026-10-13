const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const ProfileLookup = require('../models/ProfileLookup');
const Report = require('../models/Report');
const Inquiry = require('../models/Inquiry');
const { hashPhone } = require('../utils/crypto');
const { generateQRCodeDataURL } = require('../utils/qr');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB. Clearing existing test collections...');

    await Promise.all([
      User.deleteMany({}),
      Profile.deleteMany({}),
      Section.deleteMany({}),
      Reel.deleteMany({}),
      ProfileLookup.deleteMany({}),
      Report.deleteMany({}),
      Inquiry.deleteMany({}),
    ]);

    console.log('Collections cleared. Seeding rich creator data...');

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

    // 2. Creator 1: Rahul Sharma (Full Stack Engineer & Cloud Architect)
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
      theme: 'default',
      status: 'published',
      completionPercentage: 100,
      qrCodeUrl: qr1,
      socialLinks: [
        { platform: 'website', url: 'https://rahulsharma.dev' },
        { platform: 'github', url: 'https://github.com' },
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

    // Sections for Rahul
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
        content: { items: ['JavaScript / TypeScript', 'React & Tailwind CSS', 'Node.js & Express', 'MongoDB & PostgreSQL', 'Docker & AWS', 'GraphQL & REST APIs'] },
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
      {
        profileId: profile1._id,
        type: 'education',
        title: 'Education',
        content: { text: 'B.Tech in Computer Science & Engineering • Indian Institute of Technology' },
        order: 3,
        visibility: 'public',
      },
    ]);

    await ProfileLookup.create({
      hashedPhone: hashPhone('+919876543210'),
      profileId: profile1._id,
      allowDiscovery: true,
    });

    // 3. Creator 2: Priya Patel (UI/UX Designer & Product Lead)
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
      theme: 'cyberpunk-emerald',
      status: 'published',
      completionPercentage: 95,
      qrCodeUrl: qr2,
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com' },
        { platform: 'youtube', url: 'https://youtube.com' },
        { platform: 'linkedin', url: 'https://linkedin.com' },
      ],
      contactDetails: {
        phone: '+919811122233',
        email: 'priya.design@example.com',
        whatsapp: '+919811122233',
        showPhone: true,
        showEmail: true,
        showWhatsapp: true,
      },
    });

    await Section.create([
      {
        profileId: profile2._id,
        type: 'about',
        title: 'Design Philosophy',
        content: { text: 'Design is not just what it looks like and feels like. Design is how it works. Specialized in mobile applications and high-converting landing pages.' },
        order: 0,
        visibility: 'public',
      },
      {
        profileId: profile2._id,
        type: 'services',
        title: 'Design Services & Offerings',
        content: { items: ['Mobile App Design (iOS & Android)', 'Design Systems & Figma Prototyping', 'Brand Identity & Visual Guidelines', 'User Testing & Wireframing'] },
        order: 1,
        visibility: 'public',
      },
    ]);

    await ProfileLookup.create({
      hashedPhone: hashPhone('+919811122233'),
      profileId: profile2._id,
      allowDiscovery: true,
    });

    // 4. Creator 3: Alex Vance (Cybersecurity & DevOps)
    const user3 = await User.create({
      mobile: '+919822233344',
      countryCode: '+91',
      isVerified: true,
      role: 'user',
      accountStatus: 'active',
    });

    const qr3 = await generateQRCodeDataURL(`${config.frontendUrl}/p/alex_cyber`);
    const profile3 = await Profile.create({
      userId: user3._id,
      name: 'Alex Vance',
      username: 'alex_cyber',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      profileType: 'Professional',
      bio: 'Cloud Security Architect & Pen-tester. Protecting zero-trust enterprise infrastructures.',
      city: 'Hyderabad',
      theme: 'dark-neon',
      status: 'published',
      completionPercentage: 90,
      qrCodeUrl: qr3,
      socialLinks: [
        { platform: 'github', url: 'https://github.com' },
        { platform: 'twitter', url: 'https://twitter.com' },
      ],
      contactDetails: {
        email: 'alex.vance@security.io',
        showEmail: true,
      },
    });

    await Section.create([
      {
        profileId: profile3._id,
        type: 'skills',
        title: 'Security & Infrastructure Expertise',
        content: { items: ['Zero Trust Architecture', 'Cloudflare & AWS WAF', 'Kubernetes Hardening', 'HMAC & Cryptography', 'DevSecOps Automation'] },
        order: 0,
        visibility: 'public',
      },
    ]);

    await ProfileLookup.create({
      hashedPhone: hashPhone('+919822233344'),
      profileId: profile3._id,
      allowDiscovery: true,
    });

    // 5. Creator 4: Ananya Sen (Growth & Brand Strategy)
    const user4 = await User.create({
      mobile: '+919833344455',
      countryCode: '+91',
      isVerified: true,
      role: 'user',
      accountStatus: 'active',
    });

    const qr4 = await generateQRCodeDataURL(`${config.frontendUrl}/p/ananya_growth`);
    const profile4 = await Profile.create({
      userId: user4._id,
      name: 'Ananya Sen',
      username: 'ananya_growth',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      profileType: 'Freelancer',
      bio: 'Growth Lead & Brand Consultant. Scaling consumer products from 0 to 1M users organically.',
      city: 'Delhi NCR',
      theme: 'sunset-gradient',
      status: 'published',
      completionPercentage: 95,
      qrCodeUrl: qr4,
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com' },
        { platform: 'twitter', url: 'https://twitter.com' },
      ],
      contactDetails: {
        email: 'ananya@growthconsulting.co',
        whatsapp: '+919833344455',
        showEmail: true,
        showWhatsapp: true,
      },
    });

    await Section.create([
      {
        profileId: profile4._id,
        type: 'experience',
        title: 'Key Milestones',
        content: {
          items: [
            { role: 'Head of Growth', company: 'HyperScale Apps', period: '2023 - Present', description: 'Grew active creator community by 450% within 12 months.' },
            { role: 'Product Marketing Manager', company: 'VentureScale', period: '2021 - 2023', description: 'Led go-to-market strategies for 8 SaaS product launches.' },
          ],
        },
        order: 0,
        visibility: 'public',
      },
    ]);

    await ProfileLookup.create({
      hashedPhone: hashPhone('+919833344455'),
      profileId: profile4._id,
      allowDiscovery: true,
    });

    // 6. Sample Reels
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
      {
        profileId: profile3._id,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        caption: 'Zero-Knowledge phone lookup demo: Salted HMAC encryption in action 🛡️ #infosec #privacy',
        durationSeconds: 28,
        visibility: 'public',
        status: 'active',
        viewsCount: 780,
        likesCount: 165,
      },
      {
        profileId: profile4._id,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
        caption: 'How to structure your creator portfolio to land high-ticket brand deals 📈 #growth #creator',
        durationSeconds: 42,
        visibility: 'public',
        status: 'active',
        viewsCount: 1530,
        likesCount: 312,
      },
    ]);

    // 7. Sample Inquiries for Rahul
    await Inquiry.create([
      {
        profileId: profile1._id,
        senderName: 'Vikram Mehta',
        senderEmail: 'vikram.m@fintechcorp.in',
        senderPhone: '+919876500000',
        subject: 'Contract Full Stack Architecture Opportunity',
        message: 'Hi Rahul, we loved your portfolio and reels. We have a 3-month contract to build our new fintech payments portal. Would love to connect this week!',
        status: 'unread',
      },
      {
        profileId: profile1._id,
        senderName: 'Sneha Rao',
        senderEmail: 'sneha@designops.co',
        subject: 'Mentorship Session Request',
        message: 'Hey Rahul! I saw your video on Express middlewares. Are you open for a 30-min architecture consultation session?',
        status: 'read',
      },
    ]);

    console.log('✅ MongoDB Atlas Seeding completed successfully!');
    console.log('--- Seed Summary ---');
    console.log('1. Admin: +919999999999 (OTP: 123456)');
    console.log('2. Rahul Sharma: /p/rahul_dev (+919876543210, OTP: 123456)');
    console.log('3. Priya Patel: /p/priya_design (+919811122233, OTP: 123456)');
    console.log('4. Alex Vance: /p/alex_cyber (+919822233344, OTP: 123456)');
    console.log('5. Ananya Sen: /p/ananya_growth (+919833344455, OTP: 123456)');
    console.log('Total Published Profiles: 5');
    console.log('Total Video Reels: 4');
    console.log('Total Client Inquiries: 2');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
