const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Section = require('../models/Section');
const Reel = require('../models/Reel');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const ProfileLookup = require('../models/ProfileLookup');
const { hashPhone } = require('../utils/crypto');
const { generateQRCodeDataURL } = require('../utils/qr');

const CREATORS = [
  {
    mobile: '+917489553373',
    name: 'Sourabh Kumar Dhangar',
    username: 'sourabh-dhangar',
    profileType: 'Creator',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bio: 'Founder & Full Stack Builder. Architecting cross-platform apps, creator ecosystems & AI-driven digital experiences. 🚀',
    city: 'Indore, India',
    theme: 'default',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/sourabh-dhangar' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'website', url: 'https://sourabh.dev' },
    ],
    contactDetails: {
      phone: '+917489553373',
      whatsapp: '+917489553373',
      email: 'sourabh@example.com',
      showPhone: true,
      showWhatsapp: true,
      showEmail: true,
    },
    reels: [
      {
        caption: 'Building MyProfile: An All-in-One Digital ID & Reels Showcase platform! 🌟 #buildinpublic #startup #reactnative',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 30,
        viewsCount: 12450,
        likesCount: 2890,
      },
      {
        caption: 'From Idea to Production App in 48 Hours: Full-stack rapid engineering blueprint ⚡ #indiehacker #developer #tech',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 26,
        viewsCount: 9140,
        likesCount: 2130,
      },
      {
        caption: 'Instant contact exchange: Live vCard (.vcf) download & QR Code generator demo 📲 #networking #creator',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 22,
        viewsCount: 6820,
        likesCount: 1470,
      },
    ],
  },
  {
    mobile: '+919876543210',
    name: 'Rahul Sharma',
    username: 'rahul_dev',
    profileType: 'Engineer',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Staff Software Engineer. Writing high-throughput Node.js microservices, distributed systems and React Native feeds. 💻',
    city: 'Bengaluru, India',
    theme: 'dark-neon',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/rahul-dev' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
    contactDetails: {
      phone: '+919876543210',
      whatsapp: '+919876543210',
      email: 'rahul.dev@example.com',
      showPhone: true,
      showWhatsapp: true,
      showEmail: true,
    },
    reels: [
      {
        caption: 'Top 3 tips for writing cleaner Express.js middleware with zero performance bottleneck ⚡ #nodejs #backend #webdev',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 24,
        viewsCount: 8420,
        likesCount: 1640,
      },
      {
        caption: 'Ultra-smooth 60fps vertical swipe video reels in React Native with Reanimated 3 💨 #reactnative #mobiledev',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 28,
        viewsCount: 11200,
        likesCount: 2450,
      },
    ],
  },
  {
    mobile: '+919811223344',
    name: 'Kavya Verma',
    username: 'kavya_ux',
    profileType: 'Designer',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Lead Product Designer & Figma Wizard. Crafting delightful design systems, fluid micro-interactions and dark neon UIs. ✨',
    city: 'Mumbai, India',
    theme: 'cyberpunk-emerald',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'website', url: 'https://kavyadesign.studio' },
    ],
    contactDetails: {
      phone: '+919811223344',
      whatsapp: '+919811223344',
      email: 'kavya@designstudio.io',
      showPhone: true,
      showWhatsapp: true,
      showEmail: true,
    },
    reels: [
      {
        caption: 'Mastering Dark Glassmorphism in Modern UI: 3 rules for subtle blur & neon borders ✨ #uiux #figma #design',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 32,
        viewsCount: 14500,
        likesCount: 3120,
      },
      {
        caption: 'Micro-interactions that 10x Mobile Conversion: Spring physics & haptic pulses in action! 📱 #productdesign #ux',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 27,
        viewsCount: 8900,
        likesCount: 1980,
      },
    ],
  },
  {
    mobile: '+919844455566',
    name: 'Aarav Mehta',
    username: 'aarav_ai',
    profileType: 'Creator',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'AI & Generative Systems Engineer. Fine-tuning local LLMs, building high-speed vector RAG pipelines and autonomous agents. 🤖',
    city: 'Hyderabad, India',
    theme: 'dark-neon',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/aarav-ai' },
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'youtube', url: 'https://youtube.com' },
    ],
    contactDetails: {
      email: 'aarav.ai@research.io',
      showEmail: true,
    },
    reels: [
      {
        caption: 'Running DeepSeek & Llama 3 locally with Ollama: 100% private, zero latency AI! 🧠 #ai #machinelearning #genai',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 34,
        viewsCount: 16800,
        likesCount: 3840,
      },
      {
        caption: 'RAG Architecture explained in 40 seconds: How vector databases power LLM reasoning 🔍 #datascience #python #rag',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 29,
        viewsCount: 10400,
        likesCount: 2210,
      },
    ],
  },
  {
    mobile: '+919855566677',
    name: 'Sneha Kapoor',
    username: 'sneha_brand',
    profileType: 'Freelancer',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    bio: 'Tech Career & Growth Consultant. Helping engineers and designers land high-ticket global freelance contracts. 💼',
    city: 'Delhi NCR, India',
    theme: 'sunset-gradient',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
    contactDetails: {
      whatsapp: '+919855566677',
      email: 'sneha@growthadvisory.co',
      showWhatsapp: true,
      showEmail: true,
    },
    reels: [
      {
        caption: 'How to land $5k+ Tech Freelance contracts without sending a traditional resume 💰 #freelance #career #growth',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 25,
        viewsCount: 13200,
        likesCount: 2950,
      },
      {
        caption: 'Your personal digital brand is your 24/7 opportunity engine. Here is the 3-step playbook 🌟 #branding #tech',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 21,
        viewsCount: 7600,
        likesCount: 1650,
      },
    ],
  },
  {
    mobile: '+919866677788',
    name: 'Vikramaditya Rao',
    username: 'vikram_cloud',
    profileType: 'Professional',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Cloud Security Architect & DevOps Specialist. Zero-downtime Kubernetes deployments & salted cryptographic verification. 🛡️',
    city: 'Pune, India',
    theme: 'minimalist-luxe',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/vikram-cloud' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
    ],
    contactDetails: {
      email: 'vikram@cloudsec.io',
      showEmail: true,
    },
    reels: [
      {
        caption: 'Zero-Downtime Blue/Green Deployments with Docker & K8s: How we push 15x daily 🚢 #devops #kubernetes #aws',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 31,
        viewsCount: 9400,
        likesCount: 2040,
      },
    ],
  },
  {
    mobile: '+919877788899',
    name: 'Meera Joshi',
    username: 'meera_3d',
    profileType: 'Designer',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    bio: '3D Motion & WebGL Artist. Transforming static websites into interactive 3D spatial experiences using Three.js & Blender. 🌐',
    city: 'Bengaluru, India',
    theme: 'cyberpunk-emerald',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'website', url: 'https://meera3d.art' },
    ],
    contactDetails: {
      email: 'meera@3dinteractive.design',
      showEmail: true,
    },
    reels: [
      {
        caption: 'Interactive 3D WebGL scenes directly in mobile browser with Three.js & React Three Fiber! 🌐 #threejs #webgl #3d',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 33,
        viewsCount: 15300,
        likesCount: 3410,
      },
      {
        caption: 'Blender to Three.js optimization: Mesh quantization & Draco compression for <1MB models 📦 #blender #3dart',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 24,
        viewsCount: 8200,
        likesCount: 1780,
      },
    ],
  },
  {
    mobile: '+919888899900',
    name: 'Zayd Ali',
    username: 'zayd_mobile',
    profileType: 'Engineer',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bio: 'Staff Mobile Engineer. Specializing in offline-first sync architecture, SQLite, and custom gesture controllers. 📱',
    city: 'Chennai, India',
    theme: 'default',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/zayd-mobile' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
    contactDetails: {
      email: 'zayd@mobilecraft.dev',
      showEmail: true,
    },
    reels: [
      {
        caption: 'Offline-First architecture for React Native apps: Realtime conflict-free SQLite sync engine ⚡ #mobile #ios #android',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
        durationSeconds: 28,
        viewsCount: 7900,
        likesCount: 1620,
      },
    ],
  },
];

const SAMPLE_COMMENTS = [
  'Incredible breakdown! The explanation was super clear and practical. 🔥',
  'This solved an issue we were wrestling with in our sprint! Kudos! 🙌',
  'The visual quality and design aesthetics here are top tier! ✨',
  'Bookmarking this reel for our engineering all-hands! 🚀',
  'Mind blowing performance! What tech stack did you use for this? 💡',
  'So clean and fluid! Loved the micro-interactions! ❤️',
  'Can you please do a deep dive video on how you handled state management here? 👏',
  'Next-level work! Keep inspiring the creator community! 🌟',
];

async function seedDiverseReels() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB. Starting diverse creators & reels seeding...');

    // Clean up old automated test reels (keep clean slate for reels)
    await Reel.deleteMany({});
    await Comment.deleteMany({});
    await Follow.deleteMany({});
    console.log('Existing reels, comments, and follows refreshed.');

    const createdProfiles = [];
    const createdUsers = [];

    // 1. Upsert Creators & Profiles
    for (const creator of CREATORS) {
      let user = await User.findOne({ mobile: creator.mobile });
      if (!user) {
        user = await User.create({
          mobile: creator.mobile,
          countryCode: '+91',
          isVerified: true,
          role: 'user',
          accountStatus: 'active',
        });
      }
      createdUsers.push(user);

      let profile = await Profile.findOne({ username: creator.username });
      const qrDataUrl = await generateQRCodeDataURL(`${config.frontendUrl}/p/${creator.username}`);

      if (!profile) {
        profile = await Profile.create({
          userId: user._id,
          name: creator.name,
          username: creator.username,
          photoUrl: creator.photoUrl,
          profileType: creator.profileType,
          bio: creator.bio,
          city: creator.city,
          theme: creator.theme,
          status: 'published',
          completionPercentage: 95,
          qrCodeUrl: qrDataUrl,
          socialLinks: creator.socialLinks,
          contactDetails: creator.contactDetails,
        });
      } else {
        profile.name = creator.name;
        profile.photoUrl = creator.photoUrl;
        profile.profileType = creator.profileType;
        profile.bio = creator.bio;
        profile.city = creator.city;
        profile.theme = creator.theme;
        profile.status = 'published';
        profile.completionPercentage = 95;
        if (!profile.qrCodeUrl) profile.qrCodeUrl = qrDataUrl;
        profile.socialLinks = creator.socialLinks;
        profile.contactDetails = creator.contactDetails;
        await profile.save();
      }

      await ProfileLookup.findOneAndUpdate(
        { hashedPhone: hashPhone(creator.mobile) },
        { profileId: profile._id, allowDiscovery: true },
        { upsert: true }
      );

      createdProfiles.push({ profile, user, creatorDef: creator });
    }

    console.log(`✅ ${createdProfiles.length} Creator profiles configured.`);

    // 2. Insert Reels for each Creator
    const allReels = [];
    for (const { profile, creatorDef } of createdProfiles) {
      for (const reelDef of creatorDef.reels) {
        const reel = await Reel.create({
          profileId: profile._id,
          videoUrl: reelDef.videoUrl,
          thumbnailUrl: reelDef.thumbnailUrl,
          caption: reelDef.caption,
          durationSeconds: reelDef.durationSeconds,
          visibility: 'public',
          status: 'active',
          viewsCount: reelDef.viewsCount,
          likesCount: reelDef.likesCount,
          commentsCount: 0,
        });
        allReels.push({ reel, authorProfile: profile });
      }
    }

    console.log(`✅ ${allReels.length} Diverse Video Reels created across all creator accounts.`);

    // 3. Seed Realistic Comments from other creators on reels
    let totalComments = 0;
    for (let i = 0; i < allReels.length; i++) {
      const { reel, authorProfile } = allReels[i];
      // Pick 2 to 3 other creators to comment
      const otherCreators = createdProfiles.filter(
        (c) => c.profile._id.toString() !== authorProfile._id.toString()
      );

      const numComments = 2 + (i % 2); // 2 or 3 comments per reel
      const commenters = otherCreators.slice(0, numComments);

      for (let j = 0; j < commenters.length; j++) {
        const commenter = commenters[j];
        const commentText = SAMPLE_COMMENTS[(i * 3 + j) % SAMPLE_COMMENTS.length];

        await Comment.create({
          reelId: reel._id,
          userId: commenter.user._id,
          profileId: commenter.profile._id,
          text: commentText,
        });
        totalComments++;
      }

      reel.commentsCount = commenters.length;
      await reel.save();
    }

    console.log(`✅ ${totalComments} Community comments seeded across reels.`);

    // 4. Seed Mutual Follow Relationships
    let totalFollows = 0;
    for (let i = 0; i < createdProfiles.length; i++) {
      const follower = createdProfiles[i];
      // Each creator follows the next 3 or 4 creators in ring fashion
      for (let offset = 1; offset <= 3; offset++) {
        const followedIndex = (i + offset) % createdProfiles.length;
        const target = createdProfiles[followedIndex];

        try {
          await Follow.create({
            followerId: follower.user._id,
            followerProfileId: follower.profile._id,
            followingId: target.user._id,
            followingProfileId: target.profile._id,
          });
          totalFollows++;
        } catch (e) {
          // Ignore duplicate index errors if any
        }
      }
    }

    // Sync follower and following counts on each profile
    for (const { profile } of createdProfiles) {
      const followersCount = await Follow.countDocuments({ followingProfileId: profile._id });
      const followingCount = await Follow.countDocuments({ followerProfileId: profile._id });
      profile.followersCount = followersCount;
      profile.followingCount = followingCount;
      await profile.save();
    }

    console.log(`✅ ${totalFollows} Follow relationships established.`);

    console.log('\n--- 🎉 Seeding Complete! ---');
    console.log(`Total Creators: ${createdProfiles.length}`);
    console.log(`Total Reels: ${allReels.length}`);
    console.log(`Total Comments: ${totalComments}`);
    console.log(`Total Follows: ${totalFollows}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during diverse reels seeding:', error);
    process.exit(1);
  }
}

seedDiverseReels();
