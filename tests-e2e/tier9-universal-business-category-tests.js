const TestClient = require('./test-client');

async function runTier9Tests() {
  console.log('\n=== RUNNING TIER 9: UNIVERSAL BUSINESS CATEGORY & DIRECT QR TESTS ===\n');
  const salonClient = new TestClient('http://localhost:5000');
  const itClient = new TestClient('http://localhost:5000');
  const publicClient = new TestClient('http://localhost:5000');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now().toString(36);

    // 1. Setup Salon & Beauty Business User
    const salonPhone = '9775' + Math.floor(100000 + Math.random() * 900000);
    await salonClient.post('/api/v1/auth/request-otp', { mobile: salonPhone });
    const salonVerify = await salonClient.post('/api/v1/auth/verify-otp', { mobile: salonPhone, otp: '123456' });
    salonClient.setToken(salonVerify.data.data.token);

    const salonSlug = 'salon_' + timestamp;
    const salonUpdateRes = await salonClient.put('/api/v1/profiles/me', {
      name: "Priya's Luxury Hair & Bridal Lounge",
      username: salonSlug,
      profileType: 'SmallBusiness',
      category: 'Salon & Beauty',
      subCategory: 'Luxury Hair & Bridal Studio',
      bio: 'Award-winning bridal hair styling, spa therapies, and premium hair treatments in Mumbai.',
      city: 'Mumbai',
      theme: 'sunset-gradient',
      businessDetails: {
        timing: 'Tue - Sun: 10:00 AM - 8:30 PM (Mondays Closed)',
        address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
        googleMapsUrl: 'https://maps.google.com/?q=Bandra+West+Mumbai',
        whatsappNumber: '+919833344455',
        bookingUrl: 'https://calendly.com/priya-salon/appointment',
      },
      contactDetails: {
        phone: salonPhone,
        whatsapp: '+919833344455',
        showPhone: true,
        showWhatsapp: true,
      },
    });

    assert(salonUpdateRes.status === 200, 'Salon Business Profile updated successfully (200 OK)');
    assert(salonUpdateRes.data.data.category === 'Salon & Beauty', 'Profile category is accurately set to "Salon & Beauty"');
    assert(salonUpdateRes.data.data.subCategory === 'Luxury Hair & Bridal Studio', 'Profile subCategory is set to "Luxury Hair & Bridal Studio"');
    assert(salonUpdateRes.data.data.businessDetails?.timing.includes('10:00 AM'), 'Business hours / timing accurately stored');
    assert(salonUpdateRes.data.data.businessDetails?.bookingUrl.includes('calendly'), 'Direct booking URL accurately stored');

    // Add Services / Rate Card Section for Salon
    const addSectionRes = await salonClient.post('/api/v1/sections', {
      type: 'services',
      title: 'Bridal & Hair Styling Packages',
      content: {
        items: [
          'Signature Bridal Makeover — ₹15,000',
          'Keratin Protein Infusion — ₹6,500',
          'Organic Moroccan Hair Spa — ₹2,200',
          'Creative Balayage & Highlights — ₹7,500',
        ],
      },
      order: 0,
      visibility: 'public',
    });
    assert(addSectionRes.status === 201, 'Salon Rate Card / Services section created (201 Created)');

    // Publish Salon Profile
    const salonPublish = await salonClient.post('/api/v1/profiles/me/publish');
    assert(salonPublish.status === 200, 'Salon Profile published successfully (200 OK)');

    // 2. Setup IT Professional User
    const itPhone = '9776' + Math.floor(100000 + Math.random() * 900000);
    await itClient.post('/api/v1/auth/request-otp', { mobile: itPhone });
    const itVerify = await itClient.post('/api/v1/auth/verify-otp', { mobile: itPhone, otp: '123456' });
    itClient.setToken(itVerify.data.data.token);

    const itSlug = 'clouddev_' + timestamp;
    const itUpdateRes = await itClient.put('/api/v1/profiles/me', {
      name: 'Aditya Mehta',
      username: itSlug,
      profileType: 'Engineer',
      category: 'IT & Software',
      subCategory: 'Senior DevOps & Cloud Solutions Architect',
      bio: 'AWS & Kubernetes certified cloud specialist building automated multi-region microservice pipelines.',
      city: 'Hyderabad',
      theme: 'cyberpunk-emerald',
      businessDetails: {
        timing: 'Mon - Fri: 9:00 AM - 6:00 PM IST',
        bookingUrl: 'https://cal.com/aditya-cloud/30min',
      },
      contactDetails: {
        email: 'aditya.cloud@example.com',
        showEmail: true,
      },
    });

    assert(itUpdateRes.status === 200, 'IT Professional Profile updated successfully (200 OK)');
    assert(itUpdateRes.data.data.category === 'IT & Software', 'IT Profile category is accurately set to "IT & Software"');
    assert(itUpdateRes.data.data.subCategory.includes('DevOps'), 'IT Profile subCategory matches DevOps');

    // Publish IT Profile
    const itPublish = await itClient.post('/api/v1/profiles/me/publish');
    assert(itPublish.status === 200, 'IT Professional Profile published successfully (200 OK)');

    // 3. Public Verification: Retrieve Salon Profile
    const publicSalon = await publicClient.get(`/api/v1/profiles/${salonSlug}`);
    assert(publicSalon.status === 200, 'Public can view Salon profile (200 OK)');
    assert(publicSalon.data.data.profile.category === 'Salon & Beauty', 'Public payload exposes Salon & Beauty category');
    assert(publicSalon.data.data.profile.businessDetails?.address.includes('Bandra'), 'Public payload exposes business address');
    assert(publicSalon.data.data.profile.businessDetails?.whatsappNumber === '+919833344455', 'Public payload exposes WhatsApp contact');
    assert(publicSalon.data.data.sections.length >= 1, 'Public payload contains Services / Rate Card sections');

    // 4. Public QR Code Verification for Counter Displays
    const qrRes = await publicClient.get(`/api/v1/profiles/${salonSlug}/qr`);
    assert(qrRes.status === 200, 'Public QR code generated for Salon counter stand (200 OK)');
    assert(qrRes.data.data.qrCodeDataUrl.startsWith('data:image/png;base64,'), 'QR code payload contains high-res base64 image data');

    // 5. Category Discovery & Search Verification
    const browseSalon = await publicClient.get('/api/v1/discovery/browse?category=Salon%20%26%20Beauty');
    assert(browseSalon.status === 200, 'GET /discovery/browse?category=Salon & Beauty returns 200 OK');
    const hasSalon = browseSalon.data.data.profiles.some((p) => p.username === salonSlug);
    assert(hasSalon, 'Salon profile appears in category-filtered search results');

    const browseDevOps = await publicClient.get('/api/v1/discovery/browse?search=DevOps');
    assert(browseDevOps.status === 200, 'GET /discovery/browse?search=DevOps returns 200 OK');
    const hasDevOps = browseDevOps.data.data.profiles.some((p) => p.username === itSlug);
    assert(hasDevOps, 'IT profile discovered through keyword search');

  } catch (error) {
    console.error('Unhandled exception in Tier 9 tests:', error);
    failed++;
  }

  console.log(`\nTier 9 Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

module.exports = runTier9Tests;
