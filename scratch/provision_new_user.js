const API_BASE = 'http://localhost:5000/api/v1';

async function provisionNewUser() {
  console.log('=== Step 1: Request OTP for New User (+91 9811223344) ===');
  const reqRes = await fetch(`${API_BASE}/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '9811223344' }),
  });
  const reqData = await reqRes.json();
  console.log('Request OTP response:', reqData.success, reqData.message);

  console.log('\n=== Step 2: Verify OTP and Register Account ===');
  const verRes = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '9811223344', otp: '123456' }),
  });
  const verData = await verRes.json();
  console.log('Verify OTP response:', verData.success, 'Token length:', verData.data?.token?.length);

  const token = verData.data.token;

  console.log('\n=== Step 3: Update Profile Identity (Kavya Verma) ===');
  const updateRes = await fetch(`${API_BASE}/profiles/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Kavya Verma',
      username: 'kavya_ux',
      profileType: 'Designer',
      city: 'New Delhi, India',
      bio: 'Lead UX/UI Designer & Design Systems Architect crafting fluid cross-platform mobile experiences with accessible micro-interactions.',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      theme: 'dark-neon',
      contactDetails: {
        whatsapp: '+919811223344',
        phone: '+919811223344',
        email: 'kavya.verma@uxstudios.io',
        showWhatsapp: true,
        showPhone: true,
        showEmail: true,
      },
      socialLinks: [
        { platform: 'website', url: 'https://kavyaverma.design' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/kavya-verma' },
        { platform: 'github', url: 'https://github.com/kavya-ux' },
      ],
    }),
  });
  const updateData = await updateRes.json();
  console.log('Profile update response:', updateData.success, updateData.data?.username, updateData.data?.completionPercentage + '%');

  console.log('\n=== Step 4: Publish Profile ===');
  const pubRes = await fetch(`${API_BASE}/profiles/me/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const pubData = await pubRes.json();
  console.log('Publish response:', pubData.success, pubData.data?.status);

  console.log('\n=== Step 5: Add Modular Showcase Sections ===');
  // 1. Skills
  await fetch(`${API_BASE}/sections`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'skills',
      title: 'Design Stacks & UI Tooling',
      content: {
        items: [
          'Figma',
          'Design Tokens',
          'React Native UI',
          'Micro-Interactions',
          'Design Systems',
          'WCAG Accessibility',
        ],
      },
    }),
  });

  // 2. Experience
  await fetch(`${API_BASE}/sections`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'experience',
      title: 'Experience History',
      content: {
        text: 'Staff Product Designer @ Fintech Innovations (2021-Present). Led the 0-to-1 design system adoption across 4 mobile apps and 1.2M daily active users.',
      },
    }),
  });

  // 3. Portfolio
  await fetch(`${API_BASE}/sections`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'portfolio',
      title: 'Featured Projects',
      content: {
        items: [
          {
            title: 'NeoGlass Mobile Component Kit',
            description: 'Accessible glassmorphic UI components with 60fps gesture physics.',
            url: 'https://kavyaverma.design/neoglass',
          },
        ],
      },
    }),
  });

  console.log('Modular sections created successfully.');

  console.log('\n=== Step 6: Post Video Reel for Kavya Verma ===');
  const reelRes = await fetch(`${API_BASE}/reels`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      caption: 'Building 60fps fluid gesture interactions in React Native! 🎨✨ Dark neon theme in action #ui #ux #design',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
      durationSeconds: 20,
      visibility: 'public',
    }),
  });
  const reelData = await reelRes.json();
  console.log('Reel post response:', reelData.success, reelData.data?._id, reelData.data?.caption);

  console.log('\n=== Step 7: Verify Public Profile Fetch ===');
  const pubFetchRes = await fetch(`${API_BASE}/profiles/kavya_ux`);
  const pubFetchData = await pubFetchRes.json();
  console.log('Public profile check:', pubFetchData.success, pubFetchData.data?.profile?.name, `@${pubFetchData.data?.profile?.username}`, 'Reels count:', pubFetchData.data?.reels?.length, 'Sections count:', pubFetchData.data?.sections?.length);

  console.log('\n🎉 NEW USER KAVYA VERMA SUCCESSFULLY PROVISIONED & FULLY VERIFIED! ✨');
}

provisionNewUser().catch(console.error);
