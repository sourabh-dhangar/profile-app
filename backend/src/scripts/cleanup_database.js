const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const TARGET_USERNAMES = [
  'admin',
  'sourabh',
  'sourabh-dhangar',
  'rahul_dev',
  'priya_design',
  'alex_cyber',
  'ananya_growth',
  'dr__arjun_meht_u59a',
  'pooja_hegde_st_tcvm',
  'chef_kabir_obe_nhcb',
  'rohan_fitness__obs4'
];

async function cleanupDatabase() {
  console.log('🚀 Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas.');

  const db = mongoose.connection.db;

  // 1. Fetch initial target profiles
  const targetProfiles = await db.collection('profiles').find({
    username: { $in: TARGET_USERNAMES }
  }).toArray();

  const targetProfileIds = targetProfiles.map(p => p._id);
  console.log(`📋 Found ${targetProfiles.length} target showcase profiles to preserve.`);

  // 2. Remove all non-target profiles first to release unique index constraints (e.g. userId_1)
  console.log('\n🧹 Purging dummy profiles not in target list...');
  const delDummyProfiles = await db.collection('profiles').deleteMany({
    _id: { $nin: targetProfileIds }
  });
  console.log(`  - Deleted ${delDummyProfiles.deletedCount} dummy profiles.`);

  // 3. Cleanly link admin user (+919999999999) and rahul user (+919876543210)
  const adminUser = await db.collection('users').findOne({ mobile: '+919999999999' });
  if (adminUser) {
    await db.collection('users').updateOne(
      { _id: adminUser._id },
      { $set: { role: 'admin', accountStatus: 'active', isVerified: true } }
    );
    await db.collection('profiles').updateOne(
      { username: 'admin' },
      { $set: { userId: adminUser._id, status: 'published' } }
    );
    console.log(`🔗 Successfully linked admin profile to User ${adminUser._id} (+919999999999, role: admin)`);
  }

  const rahulUser = await db.collection('users').findOne({ mobile: '+919876543210' });
  if (rahulUser) {
    await db.collection('users').updateOne(
      { _id: rahulUser._id },
      { $set: { role: 'user', accountStatus: 'active', isVerified: true } }
    );
    await db.collection('profiles').updateOne(
      { username: 'rahul_dev' },
      { $set: { userId: rahulUser._id, status: 'published' } }
    );
    console.log(`🔗 Successfully linked rahul_dev profile to User ${rahulUser._id} (+919876543210)`);
  }

  // 4. Fetch the preserved profiles and collect all preserved user IDs
  const preservedProfiles = await db.collection('profiles').find({
    username: { $in: TARGET_USERNAMES }
  }).toArray();

  const preservedProfileIds = preservedProfiles.map(p => p._id);
  const preservedUserIds = [];

  console.log(`\n📋 Preserved profiles summary (${preservedProfiles.length}):`);
  for (const p of preservedProfiles) {
    const user = await db.collection('users').findOne({ _id: p.userId });
    if (user) {
      preservedUserIds.push(user._id);
      console.log(`  - ${p.username.padEnd(22)} | ${p.name.padEnd(28)} | User: ${user.mobile} (${user.role})`);
    } else {
      console.warn(`  ⚠️ Warning: Profile ${p.username} missing user ${p.userId}`);
    }
  }

  // 5. Ensure showcase reels for all preserved showcase profiles
  const showcaseReelDefs = [
    {
      username: 'priya_design',
      caption: 'My favorite design tokens, typography scales and dark glow harmonies for 2026 ✨ #uiux #figma #designsystem',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 26,
      viewsCount: 4210,
      likesCount: 930
    },
    {
      username: 'alex_cyber',
      caption: 'Zero-Knowledge phone lookup demo: Salted HMAC cryptographic verification in action 🛡️ #infosec #privacy #security',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 28,
      viewsCount: 3820,
      likesCount: 715
    },
    {
      username: 'ananya_growth',
      caption: 'How to structure your creator portfolio to land $10k+ high-ticket brand deals 📈 #growth #creator #marketing',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 29,
      viewsCount: 5120,
      likesCount: 1140
    },
    {
      username: 'dr__arjun_meht_u59a',
      caption: 'Daily 10-Minute Cardio Routine for a Healthier Heart 🩺 #health #cardio #wellness #heartcare',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 24,
      viewsCount: 6420,
      likesCount: 1420
    },
    {
      username: 'pooja_hegde_st_tcvm',
      caption: 'Cinematic Lighting Secrets for Destination Wedding Photography 📸 #photography #cinematic #studio #lighting',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 22,
      viewsCount: 8900,
      likesCount: 2050
    },
    {
      username: 'chef_kabir_obe_nhcb',
      caption: 'Perfect 72-Hour Sourdough Fermentation Breakdown 🍕 #culinary #chef #artisan #baking',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 30,
      viewsCount: 7300,
      likesCount: 1680
    },
    {
      username: 'rohan_fitness__obs4',
      caption: 'Proper Deadlift Mechanics: Protect your lower back and maximize power 🏋️‍♂️ #fitness #strength #training',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 27,
      viewsCount: 5800,
      likesCount: 1290
    }
  ];

  for (const def of showcaseReelDefs) {
    const p = preservedProfiles.find(x => x.username === def.username);
    if (p) {
      const existing = await db.collection('reels').findOne({ profileId: p._id });
      if (!existing) {
        await db.collection('reels').insertOne({
          profileId: p._id,
          caption: def.caption,
          videoUrl: def.videoUrl,
          thumbnailUrl: def.thumbnailUrl,
          durationSeconds: def.durationSeconds,
          visibility: 'public',
          status: 'active',
          viewsCount: def.viewsCount,
          likesCount: def.likesCount,
          sharesCount: Math.round(def.likesCount / 4),
          commentsCount: Math.round(def.likesCount / 8),
          bookmarksCount: Math.round(def.likesCount / 10),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`🎬 Added showcase reel for @${def.username}`);
      }
    }
  }

  // 6. Fetch all preserved reels
  const preservedReels = await db.collection('reels').find({
    profileId: { $in: preservedProfileIds }
  }).toArray();
  const preservedReelIds = preservedReels.map(r => r._id);
  console.log(`\n🎞️ Preserving ${preservedReels.length} reels on preserved profiles.`);

  // 7. Execute cascading deletion of all dummy / test data across all collections
  console.log('\n🧹 Purging non-preserved records from all collections...');

  const delUsers = await db.collection('users').deleteMany({
    _id: { $nin: preservedUserIds }
  });
  console.log(`  - users: deleted ${delUsers.deletedCount}`);

  const delSections = await db.collection('sections').deleteMany({
    profileId: { $nin: preservedProfileIds }
  });
  console.log(`  - sections: deleted ${delSections.deletedCount}`);

  const delReels = await db.collection('reels').deleteMany({
    profileId: { $nin: preservedProfileIds }
  });
  console.log(`  - reels: deleted ${delReels.deletedCount}`);

  const delLookups = await db.collection('profilelookups').deleteMany({
    profileId: { $nin: preservedProfileIds }
  });
  console.log(`  - profilelookups: deleted ${delLookups.deletedCount}`);

  const delInquiries = await db.collection('inquiries').deleteMany({
    profileId: { $nin: preservedProfileIds }
  });
  console.log(`  - inquiries: deleted ${delInquiries.deletedCount}`);

  const delNotifications = await db.collection('notifications').deleteMany({
    $or: [
      { recipientId: { $nin: preservedUserIds } },
      { userId: { $exists: true, $nin: preservedUserIds } }
    ]
  });
  console.log(`  - notifications: deleted ${delNotifications.deletedCount}`);

  const delAuditLogs = await db.collection('auditlogs').deleteMany({
    $or: [
      { adminId: { $nin: preservedUserIds } },
      { targetType: 'user', targetId: { $nin: preservedUserIds } },
      { targetType: 'profile', targetId: { $nin: preservedProfileIds } },
      { targetType: 'reel', targetId: { $nin: preservedReelIds } }
    ]
  });
  console.log(`  - auditlogs: deleted ${delAuditLogs.deletedCount}`);

  const delComments = await db.collection('comments').deleteMany({
    reelId: { $nin: preservedReelIds }
  });
  console.log(`  - comments: deleted ${delComments.deletedCount}`);

  const delFollows = await db.collection('follows').deleteMany({
    $or: [
      { followerId: { $nin: preservedUserIds } },
      { followingProfileId: { $nin: preservedProfileIds } }
    ]
  });
  console.log(`  - follows: deleted ${delFollows.deletedCount}`);

  const delBookmarks = await db.collection('bookmarks').deleteMany({
    reelId: { $nin: preservedReelIds }
  });
  console.log(`  - bookmarks: deleted ${delBookmarks.deletedCount}`);

  const delMessages = await db.collection('chatmessages').deleteMany({
    $or: [
      { senderId: { $nin: preservedUserIds } },
      { recipientId: { $nin: preservedUserIds } }
    ]
  });
  console.log(`  - chatmessages: deleted ${delMessages.deletedCount}`);

  const delConversations = await db.collection('conversations').deleteMany({
    'participants.userId': { $nin: preservedUserIds }
  });
  console.log(`  - conversations: deleted ${delConversations.deletedCount}`);

  const delReports = await db.collection('reports').deleteMany({
    $or: [
      { targetType: 'reel', targetId: { $nin: preservedReelIds } },
      { targetType: 'profile', targetId: { $nin: preservedProfileIds } }
    ]
  });
  console.log(`  - reports: deleted ${delReports.deletedCount}`);

  // 8. Ensure ProfileLookup records exist for the preserved profiles
  const { hashPhone } = require('../utils/crypto');
  for (const p of preservedProfiles) {
    if (p.contactDetails && p.contactDetails.phone) {
      const hashed = hashPhone(p.contactDetails.phone);
      await db.collection('profilelookups').updateOne(
        { hashedPhone: hashed },
        { $set: { hashedPhone: hashed, profileId: p._id, allowDiscovery: true } },
        { upsert: true }
      );
    }
  }

  // 9. Print final collection status
  console.log('\n📊 Final Database Counts Post-Cleanup:');
  const collections = [
    'users', 'profiles', 'sections', 'reels', 'profilelookups',
    'inquiries', 'notifications', 'comments', 'follows', 'bookmarks',
    'chatmessages', 'conversations', 'reports', 'auditlogs'
  ];

  for (const c of collections) {
    const count = await db.collection(c).countDocuments();
    console.log(`  • ${c.padEnd(16)}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('\n✨ Database cleanup completed successfully!');
}

cleanupDatabase().catch((err) => {
  console.error('❌ Error during cleanup:', err);
  process.exit(1);
});
