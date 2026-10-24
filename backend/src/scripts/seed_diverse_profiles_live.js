// Seed Diverse Profiles directly into live MongoDB Atlas via official API endpoints
const DIVERSE_PROFILES = [
  {
    phone: '9820112233',
    name: 'Dr. Arjun Mehta',
    email: 'dr.arjun@cardiachealth.in',
    profileType: 'Doctor & Clinic',
    category: 'Doctor & Clinic',
    bio: 'Senior Cardiologist & Interventional Heart Specialist at Apollo Speciality Hospitals.',
    city: 'Indiranagar, Bengaluru',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    theme: 'default',
    businessDetails: {
      businessName: 'Dr. Arjun Mehta Heart & Health Clinic',
      tagline: 'Compassionate, Evidence-based Cardiac Care',
      timing: '10:00 AM - 7:00 PM (Mon-Sat)',
      address: '12th Main Road, Indiranagar, Bengaluru',
      whatsappNumber: '9820112233',
      bookingUrl: 'https://drarjunmehta.in/book',
    },
  },
  {
    phone: '9820223344',
    name: 'Pooja Hegde Studios',
    email: 'pooja@hegdestudios.com',
    profileType: 'Content Creator & Artist',
    category: 'Content Creator & Artist',
    bio: 'Destination Wedding Photographer & Visual Storyteller. Capturing raw emotional moments across India & Europe.',
    city: 'Colaba, Mumbai',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    theme: 'minimalist-luxe',
    businessDetails: {
      businessName: 'Pooja Hegde Photography Studio',
      tagline: 'Cinematic Weddings & Timeless Portraits',
      timing: '9:00 AM - 8:00 PM',
      address: 'Sea Face Towers, Colaba, Mumbai',
      whatsappNumber: '9820223344',
    },
  },
  {
    phone: '9820334455',
    name: 'Chef Kabir Oberoi',
    email: 'kabir@theartisanbistro.com',
    profileType: 'Restaurant & Food',
    category: 'Restaurant & Food',
    bio: 'Head Chef & Co-founder at The Artisan Bistro. Specializing in artisanal wood-fired sourdough pizzas & Mediterranean tapas.',
    city: 'Koregaon Park, Pune',
    photoUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    theme: 'sunset-gradient',
    businessDetails: {
      businessName: 'The Artisan Bistro & Bakery',
      tagline: 'Wood-fired Sourdough & Fresh Farm Tapas',
      timing: '11:00 AM - 11:30 PM',
      address: 'Lane 7, Koregaon Park, Pune',
      whatsappNumber: '9820334455',
      bookingUrl: 'https://artisanbistro.in/reserve',
    },
  },
  {
    phone: '9820445566',
    name: 'Rohan Fitness & Strength',
    email: 'rohan.fit@ironcladgym.in',
    profileType: 'Fitness & Health',
    category: 'Fitness & Health',
    bio: 'Certified CSCS Strength Coach & Olympic Weightlifting Trainer. Helping athletes and busy executives build resilient bodies.',
    city: 'Cyber City, Gurugram',
    photoUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400',
    theme: 'cyberpunk-emerald',
    businessDetails: {
      businessName: 'IronClad Strength & Conditioning',
      tagline: 'Elite Functional Fitness & Personal Coaching',
      timing: '6:00 AM - 10:00 PM',
      address: 'Sector 29, Cyber City, Gurugram',
      whatsappNumber: '9820445566',
    },
  },
  {
    phone: '9820556677',
    name: 'Natasha Roy Couture',
    email: 'natasha@royluxe.com',
    profileType: 'Fashion & Apparel',
    category: 'Fashion & Apparel',
    bio: 'Handcrafted bridal lehengas, bespoke Indo-Western couture & sustainable luxury fabrics.',
    city: 'Hauz Khas, New Delhi',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    theme: 'minimalist-luxe',
    businessDetails: {
      businessName: 'Natasha Roy Bespoke Atelier',
      tagline: 'Timeless Indian Craftsmanship in Modern Silhouettes',
      timing: '11:00 AM - 8:00 PM',
      address: 'Village Hauz Khas, New Delhi',
      whatsappNumber: '9820556677',
    },
  },
  {
    phone: '9820667788',
    name: 'Advocate Raghav Singhal',
    email: 'raghav@singhachambers.com',
    profileType: 'Professional Services',
    category: 'Professional Services',
    bio: 'Corporate Legal Counsel & Startup IP Advisor. Specializing in venture capital contracts, cross-border M&A and tech patents.',
    city: 'Fort, Mumbai',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    theme: 'default',
    businessDetails: {
      businessName: 'Singhal & Associates Law Chambers',
      tagline: 'Corporate, IP & Venture Legal Advisory',
      timing: '9:30 AM - 7:30 PM',
      address: 'Flora Fountain Chambers, Fort, Mumbai',
      whatsappNumber: '9820667788',
    },
  },
  {
    phone: '9820778899',
    name: 'Apex Supermarket & Organics',
    email: 'contact@apexorganics.in',
    profileType: 'Grocery & Supermarket',
    category: 'Grocery & Supermarket',
    bio: 'Fresh farm-to-table organic produce, cold-pressed oils, gourmet dry fruits, and artisan pantry essentials.',
    city: 'Jubilee Hills, Hyderabad',
    photoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    theme: 'default',
    businessDetails: {
      businessName: 'Apex Fresh Market & Organics',
      tagline: 'Farm-Fresh Certified Organic Groceries Daily',
      timing: '7:30 AM - 10:30 PM',
      address: 'Road No. 36, Jubilee Hills, Hyderabad',
      whatsappNumber: '9820778899',
    },
  },
  {
    phone: '9820889900',
    name: 'TechZone Mobile Care',
    email: 'support@techzonerepair.in',
    profileType: 'Electronics & Mobile',
    category: 'Electronics & Mobile',
    bio: 'Express 30-minute smartphone motherboard repair, original screen replacements, and certified pre-owned Apple & Android devices.',
    city: 'T. Nagar, Chennai',
    photoUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400',
    theme: 'cyberpunk-emerald',
    businessDetails: {
      businessName: 'TechZone Smartphone Express Service',
      tagline: 'Certified Hardware Repair & Accessories Hub',
      timing: '10:00 AM - 9:00 PM',
      address: 'Usman Road, T. Nagar, Chennai',
      whatsappNumber: '9820889900',
    },
  },
];

async function seed() {
  const API_BASE = 'https://myprofile-official-api.vercel.app/api/v1';
  console.log(`Starting seeding of ${DIVERSE_PROFILES.length} diverse profiles...`);

  for (const item of DIVERSE_PROFILES) {
    try {
      // 1. Request OTP
      await fetch(`${API_BASE}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: item.phone, countryCode: '+91', mode: 'signup' }),
      });

      // 2. Verify OTP / Signup
      const vRes = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: item.phone,
          otp: '123456',
          countryCode: '+91',
          name: item.name,
          email: item.email,
          profileType: item.profileType,
          category: item.category,
          bio: item.bio,
        }),
      });

      const vData = await vRes.json();
      const token = vData.data?.token;
      if (!token) {
        console.log(`Skipped or login required for ${item.name}: ${vData.message}`);
        continue;
      }

      // 3. Update profile with rich info
      await fetch(`${API_BASE}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: item.city,
          photoUrl: item.photoUrl,
          theme: item.theme,
          businessDetails: item.businessDetails,
          contactDetails: {
            phone: `+91${item.phone}`,
            whatsapp: `+91${item.phone}`,
            email: item.email,
            showPhone: true,
            showWhatsapp: true,
            showEmail: true,
          },
        }),
      });

      // 4. Enable discovery
      await fetch(`${API_BASE}/discovery/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allowDiscovery: true }),
      });

      console.log(`✓ Seeded ${item.name} (${item.category}) in ${item.city}`);
    } catch (err) {
      console.error(`Failed ${item.name}:`, err.message);
    }
  }

  console.log('Finished seeding diverse profiles!');
}

seed();
