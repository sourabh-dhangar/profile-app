import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  QrCode,
  ShieldCheck,
  Video,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe2,
  Smartphone,
  PhoneCall,
  MessageCircle,
  Download,
  Star,
  MapPin,
  Clock,
  ExternalLink,
  Scissors,
  Code2,
  Stethoscope,
  UtensilsCrossed,
  Scale,
  Dumbbell,
  ChevronDown,
  Layers,
  Palette,
  TrendingUp,
  Award,
  Zap,
  Users,
  Compass,
  BarChart3,
  Calendar,
  Share2,
  CreditCard,
  Check,
  Copy,
  Store,
  Coffee,
  MessageSquare,
  RefreshCw,
  Cpu,
  Radio,
  FileCheck2
} from 'lucide-react';
import { getProfileAvatar } from '../utils/avatar';

const LandingPage = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [activeTab, setActiveTab] = useState('freelancers');
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const navigate = useNavigate();

  const APK_DOWNLOAD_URL = 'https://expo.dev/artifacts/eas/NjnLkCez5bqVeS3Yfy9lvzQRjsKU_FM7Ljz_bEPm558.apk';
  const EXPO_PROJECT_URL = 'https://expo.dev/accounts/sourabh-dhangar/projects/myprofile';
  const EXPO_BUILDS_URL = 'https://expo.dev/accounts/sourabh-dhangar/projects/myprofile/builds';
  const QR_CODE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=https%3A%2F%2Fexpo.dev%2Fartifacts%2Feas%2FNjnLkCez5bqVeS3Yfy9lvzQRjsKU_FM7Ljz_bEPm558.apk&bgcolor=ffffff&color=020617&margin=10';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/p/${searchUsername.trim().toLowerCase()}`);
    }
  };

  const handleCopyApkLink = () => {
    navigator.clipboard.writeText(APK_DOWNLOAD_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Industry Tabs for 6 different trades
  const industryTabs = {
    freelancers: {
      id: 'freelancers',
      label: 'Freelancers & Tech',
      icon: Code2,
      headline: 'Curate GitHub, Live Demos & Direct 1-on-1 Client Inquiries',
      subhead: 'The high-converting digital portfolio engineered to replace outdated static resumes. Showcase GitHub repositories, tech stack badges, rate cards, and 60-second video elevator pitches in one lightning-fast link.',
      badge: 'For Tech Talent & Consultants',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgLight: 'bg-emerald-500/10',
      features: [
        'GitHub repository showcase & live project demo links',
        'Direct 1-on-1 real-time messaging & calendar booking',
        '1-Tap vCard contact download for recruiters & corporate clients',
        'Cryptographic HMAC phone privacy protection'
      ],
      sampleUser: {
        name: 'Rahul Sharma',
        tagline: 'Staff Software Engineer & Distributed Systems Lead',
        location: 'Bengaluru, India',
        rating: '5.0 (95+ Recommendations)',
        popularItem: 'System Architecture Audit • ₹15,000'
      }
    },
    salons: {
      id: 'salons',
      label: 'Salons & Makeup',
      icon: Scissors,
      headline: 'Price Lists, Bridal Portfolio Reels & Acrylic Tabletop QR Stands',
      subhead: 'Place elegant acrylic tabletop QR stands at styling chairs and reception desks. Walk-in clients scan to explore bridal packages, haircut reels, transparent service rate cards, and book directly on WhatsApp.',
      badge: 'For Beauty & Wellness',
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/30',
      bgLight: 'bg-pink-500/10',
      features: [
        'Transparent service rate cards (Bridal, Keratin, Spa, Facials)',
        'Before-and-after 30-second transformation video reels',
        'Direct 1-tap WhatsApp booking without phone tag delays',
        'Google Maps location pin for instant salon directions'
      ],
      sampleUser: {
        name: 'Velvet Hair & Spa Studio',
        tagline: 'Luxury Hair Treatments & Bridal Makeup Artistry',
        location: 'Indiranagar, Bengaluru',
        rating: '4.9 (180+ Reviews)',
        popularItem: 'Bridal Makeover Package • ₹8,500'
      }
    },
    doctors: {
      id: 'doctors',
      label: 'Doctors & Healthcare',
      icon: Stethoscope,
      headline: 'Clinic Consultation Timings, Map Directions & Patient Privacy',
      subhead: 'Present your verified medical degrees, morning & evening clinic consultation hours, one-touch Google Maps navigation, and offer emergency or scheduled WhatsApp consultations with full patient privacy.',
      badge: 'For Medical & Wellness',
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgLight: 'bg-cyan-500/10',
      features: [
        'Verified medical license & qualification badges',
        'Morning & Evening clinic consulting hours display',
        'One-touch Google Maps navigation to clinic door',
        'Direct WhatsApp consultation & appointment requests'
      ],
      sampleUser: {
        name: 'Dr. Ananya Rao, MD',
        tagline: 'Consultant Dermatologist & Aesthetic Physician',
        location: 'Koramangala, Bengaluru',
        rating: '4.9 (240+ Patient Reviews)',
        popularItem: 'Skin Consultation & Analysis • ₹1,200'
      }
    },
    fitness: {
      id: 'fitness',
      label: 'Fitness & Gyms',
      icon: Dumbbell,
      headline: 'Transformation Video Reels, Diet Plans & Membership Chat',
      subhead: 'Showcase real client weight-loss transformations, daily workout routines, personalized diet plan offerings, and let gym members or personal training clients sign up instantly through WhatsApp.',
      badge: 'For Coaches & Gyms',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgLight: 'bg-amber-500/10',
      features: [
        'Client transformation video reels & before/after results',
        'Custom workout & nutrition plan catalogs with pricing',
        'Direct WhatsApp enrollment for 1-on-1 personal coaching',
        'Studio location and trial session booking'
      ],
      sampleUser: {
        name: 'IronPeak Fitness & Crossfit',
        tagline: 'Elite Strength & High-Intensity Conditioning',
        location: 'Bandra West, Mumbai',
        rating: '4.9 (145+ Members)',
        popularItem: '12-Week Transformation Program • ₹9,999'
      }
    },
    retail: {
      id: 'retail',
      label: 'Retail Stores & Boutiques',
      icon: Store,
      headline: 'Counter Stand QR, Product Catalogs & Instant WhatsApp Orders',
      subhead: 'Display your high-resolution tabletop QR stands at your billing counter. Customers can browse your latest festive collections, check inventory, and message your store staff on WhatsApp directly.',
      badge: 'For Boutiques & Retailers',
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgLight: 'bg-purple-500/10',
      features: [
        'Catalog showcases with high-res photos & item prices',
        'Billing counter tabletop QR stand for walk-in shoppers',
        'Direct WhatsApp inquiry for home delivery & sizing',
        'Store address with interactive Google Maps navigation'
      ],
      sampleUser: {
        name: 'Aura Silk & Designer Studio',
        tagline: 'Handcrafted Bridal Lehengas & Pure Kanjivaram Silks',
        location: 'Commercial Street, Bengaluru',
        rating: '4.9 (210+ Shoppers)',
        popularItem: 'Pure Kanjivaram Bridal Saree • ₹18,500'
      }
    },
    restaurants: {
      id: 'restaurants',
      label: 'Cafes & Restaurants',
      icon: Coffee,
      headline: 'Tabletop QR Menu, Chef Special Reels & Table Reservation Chat',
      subhead: 'Eliminate torn, messy paper menus. Guests tap or scan tabletop QR stands to browse daily signature specials, watch mouth-watering food reels, and reserve tables or book catering in seconds.',
      badge: 'For Food & Hospitality',
      color: 'from-emerald-400 to-teal-500',
      textColor: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      bgLight: 'bg-teal-500/10',
      features: [
        'Interactive digital menu with chef specials & dietary tags',
        'High-definition food preparation video reels',
        'Instant WhatsApp table reservations & catering inquiries',
        'Zero commission takeaway orders'
      ],
      sampleUser: {
        name: 'The Roasted Bean Roastery',
        tagline: 'Artisanal Specialty Coffee & Organic Sourdough',
        location: 'Kalyan Nagar, Bengaluru',
        rating: '4.8 (320+ Patrons)',
        popularItem: 'Pour-Over Aeropress & Avocado Toast • ₹450'
      }
    }
  };

  // 6 Core Features
  const coreFeatures = [
    {
      icon: Smartphone,
      title: 'Smart Digital Card & 1-Tap Save',
      description: 'Visitors save your complete verified contact card directly into their phone contacts (.vcf) with a single click — no manual typing or forgotten cards.',
      accent: 'from-emerald-500/20 to-teal-500/10',
      border: 'hover:border-emerald-500/40',
      iconColor: 'text-emerald-400'
    },
    {
      icon: MessageSquare,
      title: 'Direct 1-on-1 Realtime Chat',
      description: 'Engage clients directly through secure, in-app real-time messaging. Negotiate rates, confirm booking times, and chat privately before sharing phone numbers.',
      accent: 'from-teal-500/20 to-cyan-500/10',
      border: 'hover:border-teal-500/40',
      iconColor: 'text-teal-400'
    },
    {
      icon: QrCode,
      title: 'Tabletop QR Stands for Physical Stores',
      description: 'Generate high-resolution counter QR stands for salons, clinics, gyms, boutiques, and cafes so walk-in customers can browse services and connect instantly.',
      accent: 'from-cyan-500/20 to-blue-500/10',
      border: 'hover:border-cyan-500/40',
      iconColor: 'text-cyan-400'
    },
    {
      icon: Video,
      title: 'Short Video Reels & Visual Portfolio',
      description: 'Showcase your expertise through 30-second video clips, before-and-after transformations, client video reviews, and live product demos.',
      accent: 'from-purple-500/20 to-pink-500/10',
      border: 'hover:border-purple-500/40',
      iconColor: 'text-purple-400'
    },
    {
      icon: Palette,
      title: 'Designer Visual Themes',
      description: 'Express your brand aesthetic with curated designer themes including Dark Neon, Sunset Gradient, Cyberpunk Emerald, and Minimalist Slate.',
      accent: 'from-pink-500/20 to-rose-500/10',
      border: 'hover:border-pink-500/40',
      iconColor: 'text-pink-400'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Scan & Click Analytics',
      description: 'Track how many people scanned your QR stand, viewed your profile, and clicked your social links with complete privacy compliance and zero tracking cookies.',
      accent: 'from-amber-500/20 to-orange-500/10',
      border: 'hover:border-amber-500/40',
      iconColor: 'text-amber-400'
    }
  ];

  // Top Verified Showcase Profiles
  const sampleCreators = [
    {
      name: 'Rahul Sharma',
      username: 'rahul_dev',
      title: 'Staff Software Engineer',
      city: 'Bengaluru, India',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      badge: 'Verified Pro',
      rating: '5.0',
      reviews: '95',
      bio: 'Staff Software Engineer. Writing high-throughput Node.js microservices, distributed systems and React Native feeds.',
      skills: ['React', 'Node.js', 'Distributed Systems', 'System Design']
    },
    {
      name: 'Priya Patel',
      username: 'priya_design',
      title: 'Principal Product & UX Designer',
      city: 'Mumbai, India',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      badge: 'Verified Designer',
      rating: '4.9',
      reviews: '110',
      bio: 'Leading design systems and consumer experiences for high-growth tech startups. Turning complex workflows into elegant interfaces.',
      skills: ['Figma', 'Design Systems', 'UX Audit', 'Prototyping']
    },
    {
      name: 'Zayd Ali',
      username: 'zayd_mobile',
      title: 'Staff Mobile Engineer',
      city: 'Chennai, India',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      badge: 'Verified Pro',
      rating: '4.9',
      reviews: '72',
      bio: 'Specializing in offline-first sync architecture, SQLite, and custom gesture controllers for iOS and Android.',
      skills: ['React Native', 'Expo', 'Offline Sync', 'TypeScript']
    },
    {
      name: 'Meera Joshi',
      username: 'meera_3d',
      title: '3D Motion & WebGL Artist',
      city: 'Bengaluru, India',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      badge: 'Verified Creator',
      rating: '4.9',
      reviews: '84',
      bio: 'Transforming static websites into interactive 3D spatial experiences using Three.js, Blender, and WebGL.',
      skills: ['Three.js', 'Blender', 'WebGL', 'Shaders']
    }
  ];

  // FAQ Items
  const faqItems = [
    {
      q: 'How do I download and install the MyProfile mobile app?',
      a: 'You can download the standalone Android APK (v1.0.0, 52MB) directly by clicking "Download Android APK" on this page, or by scanning the QR code with your smartphone camera. After downloading, tap the APK in your notification bar and select "Install". You can also inspect the build or test with Expo Go directly via the Expo Developer Hub.'
    },
    {
      q: 'Do I get instant updates without reinstalling the app?',
      a: 'Yes! The MyProfile mobile app is configured with Expo EAS Over-The-Air (OTA) updates on the "production" channel with runtime version 1.0.0. Whenever we publish new features (like updated chat or business tools), your app updates automatically in the background without needing a full re-download.'
    },
    {
      q: 'What is MyProfile and how is it different from a basic link-in-bio?',
      a: 'Traditional link-in-bio tools are just static lists of hyperlinks. MyProfile is a complete digital business identity platform: it combines verified professional credentials, bookable service cards with transparent pricing, direct 1-on-1 real-time chat, 30-60 second video reels, 1-tap WhatsApp lead generation, instant vCard phonebook sync, and physical tabletop acrylic QR stands.'
    },
    {
      q: 'Do my clients need to install an app to view my profile?',
      a: 'No app is needed for clients. Anyone with any smartphone (iPhone or Android) can point their native camera at your tabletop QR stand or digital QR code. Your complete portfolio and rate card loads instantly in their mobile browser in under 1 second.'
    },
    {
      q: 'How does the Tabletop QR Stand work for physical stores?',
      a: 'Every profile automatically generates high-resolution, print-ready QR codes formatted for acrylic tabletop stands, counter displays, and visiting cards. Place them at your salon styling station, clinic reception desk, gym counter, or cafe table for instant walk-in client engagement.'
    },
    {
      q: 'Is my phone number safe from spammers and web scrapers?',
      a: 'Yes! MyProfile utilizes cryptographic HMAC-SHA256 one-way hashing for phone discovery. Your raw phone number is never exposed in plain text in the HTML code or accessible to automated web crawlers. You have full privacy control.'
    }
  ];

  const currentTab = industryTabs[activeTab];

  return (
    <div className="relative overflow-hidden space-y-24 sm:space-y-32 py-6 sm:py-10">
      {/* Dynamic Ambient Mesh Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-emerald-500/25 via-teal-500/15 to-transparent blur-3xl -z-10 rounded-full" />
      <div className="pointer-events-none absolute top-[650px] -left-40 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent blur-3xl -z-10 rounded-full" />
      <div className="pointer-events-none absolute top-[1400px] -right-40 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl -z-10 rounded-full" />
      <div className="pointer-events-none absolute top-[2400px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-t from-teal-500/15 to-transparent blur-3xl -z-10 rounded-full" />

      {/* ===================================================
          1. HERO SECTION (High Impact + Direct App Download)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Mobile App CTA & Search */}
          <div className="lg:col-span-7 text-left space-y-7">
            
            {/* Catchy Live Badge: App Release Announcement */}
            <div className="inline-flex flex-wrap items-center gap-2 p-1.5 pr-4 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold shadow-xl shadow-emerald-500/10 backdrop-blur-md">
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                </span>
                Mobile App Live
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-200">Standalone Android APK (v1.0.0) Ready on Expo EAS</span>
              <a
                href="#download-app"
                className="text-emerald-400 hover:text-emerald-300 underline font-bold inline-flex items-center space-x-1 ml-auto"
              >
                <span>Get App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Your Entire Business Identity <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                in One Link, NFC Tap & Mobile App.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Replace outdated paper business cards with an interactive digital profile. Showcase your services, receive instant 1-on-1 client messages & WhatsApp leads, share tabletop QR stands, and publish 60s video reels — all in under 2 minutes.
            </p>

            {/* HIGH VISIBILITY DUAL CALL-TO-ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              {/* Primary 1: Direct Mobile App APK Download */}
              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-6 sm:px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-3 border border-emerald-300/40"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="block leading-tight">Download Android APK</span>
                  <span className="text-[10px] font-bold text-slate-900/80 block">v1.0.0 • 52 MB • Direct Link</span>
                </div>
              </a>

              {/* Primary 2: Create Web Profile */}
              <Link
                to="/login"
                className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base transition-all flex items-center space-x-2 border border-slate-700/80 hover:border-emerald-500/50 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Create Free Profile</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* Secondary 3: Scan QR Anchor */}
              <a
                href="#download-app"
                className="px-4 py-4 rounded-2xl glass-panel hover:bg-slate-800/80 text-emerald-300 font-semibold text-sm transition-all flex items-center space-x-2 border border-emerald-500/30"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Scan QR for Phone</span>
              </a>
            </div>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl pt-1">
              <div className="relative flex items-center shadow-2xl">
                <input
                  type="text"
                  placeholder="Search by username (e.g. rahul_dev or priya_design)"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  View
                </button>
              </div>

              {/* Trending User Suggestions */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-500">🔥 Trending Profiles:</span>
                {['rahul_dev', 'priya_design', 'zayd_mobile', 'meera_3d'].map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => navigate(`/p/${handle}`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700/60 text-slate-300 transition-colors"
                  >
                    @{handle}
                  </button>
                ))}
              </div>
            </form>

            {/* Trust Indicator Strip */}
            <div className="pt-3 flex flex-wrap items-center gap-5 sm:gap-6 text-xs sm:text-sm text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center space-x-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-white">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Commission</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>EAS Live OTA Updates</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Phone Privacy Guard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Anchor (Interactive Smartphone Mockup with Realtime Chat Preview) */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Background Glow Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 via-teal-500/15 to-transparent rounded-3xl blur-2xl -z-10" />

            {/* Floating Live Badge: Real-time 1-on-1 Chat */}
            <div className="absolute -top-4 -left-4 sm:-left-8 z-20 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl flex items-center space-x-2.5 text-xs text-white backdrop-blur-md animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/30">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-300 flex items-center space-x-1">
                  <span>1-on-1 Client Chat</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </p>
                <p className="text-[10px] text-slate-400">"Hi! Can we book for Friday?"</p>
              </div>
            </div>

            {/* Floating Live Badge: Direct APK Live Ready */}
            <div className="absolute -bottom-4 -right-4 sm:-right-8 z-20 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl flex items-center space-x-2.5 text-xs text-white backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/30">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-cyan-300">Android App v1.0.0</p>
                <p className="text-[10px] text-slate-400">Expo EAS Production Live</p>
              </div>
            </div>

            {/* Mobile Device Frame */}
            <div className="w-full max-w-[340px] rounded-[38px] bg-slate-900 border-4 border-slate-700/80 shadow-2xl shadow-emerald-500/20 p-3.5 text-left relative overflow-hidden ring-1 ring-white/10">
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800" />
              </div>

              {/* Profile Card Inside Phone */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 p-4 border border-slate-700/60 space-y-3.5">
                {/* Banner & Avatar */}
                <div className="relative">
                  <div className="h-20 w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700" />
                  <div className="absolute -bottom-6 left-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
                      alt="Rahul Sharma"
                      className="w-14 h-14 rounded-2xl border-2 border-slate-900 object-cover ring-2 ring-emerald-400/50"
                    />
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/70 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified Pro</span>
                  </div>
                </div>

                {/* Identity Info */}
                <div className="pt-3">
                  <h3 className="text-base font-extrabold text-white">Rahul Sharma</h3>
                  <p className="text-xs text-emerald-400 font-medium">@rahul_dev • Bengaluru</p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    Staff Software Engineer. Writing high-throughput Node.js microservices & distributed systems.
                  </p>
                </div>

                {/* 4 Quick Action Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-center cursor-pointer transition-colors">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-300 block font-medium">Call</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-center cursor-pointer transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[9px] text-emerald-300 block font-bold">WhatsApp</span>
                  </div>
                  <div className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-center cursor-pointer transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-300 mx-auto mb-1" />
                    <span className="text-[9px] text-teal-300 block font-bold">Chat</span>
                  </div>
                  <div className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-center cursor-pointer transition-colors">
                    <Download className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[9px] text-cyan-300 block font-bold">vCard</span>
                  </div>
                </div>

                {/* Highlighted Service Card */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white">System Scalability Audit</p>
                    <p className="text-[10px] text-slate-400">Complete architectural review</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px]">
                    ₹15,000
                  </span>
                </div>

                {/* Tabletop Acrylic Stand QR Mockup inside phone */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-850 border border-emerald-500/30 flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-white shrink-0">
                    <QrCode className="w-7 h-7 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Tabletop QR Stand
                    </span>
                    <span className="text-[11px] font-medium text-slate-200 block">
                      Tap or camera scan to connect
                    </span>
                  </div>
                </div>

                {/* Direct App Link Button inside Mockup */}
                <a
                  href={APK_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Mobile App on Device</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          2. DEDICATED SHOWCASE: EXPO MOBILE APP DOWNLOAD HUB
          =================================================== */}
      <section id="download-app" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-3xl" />

          <div className="relative z-10 space-y-10">
            {/* Header Badge & Title */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Official Expo EAS Release • v1.0.0</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Download the MyProfile Mobile App
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Take your business anywhere. Scan counter QR codes, receive instant push chat notifications from clients, browse video reels, and manage your rate cards directly from your Android phone.
              </p>
            </div>

            {/* 3-Column Interactive App Hub Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Column 1: Live Scannable Camera QR Code */}
              <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 bg-slate-950/70 flex flex-col items-center text-center space-y-5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan with Phone Camera</span>
                </div>

                {/* High Res QR Box */}
                <div className="p-4 rounded-2xl bg-white shadow-2xl ring-4 ring-emerald-500/30 group hover:scale-105 transition-transform duration-200">
                  <img
                    src={QR_CODE_URL}
                    alt="Scan to Download MyProfile Android APK"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-200">
                    Instant Camera QR Scanner
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Point your iPhone or Android camera to immediately download the standalone APK file without typing any URL.
                  </p>
                </div>

                {/* Action Buttons for Mobile Users */}
                <div className="w-full space-y-2.5 pt-2">
                  <a
                    href={APK_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK Directly (52 MB)</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyApkLink}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Download Link Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy APK Link to Send via WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Column 2: Expo Cloud & EAS Developer Hub */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                
                {/* EAS Spec Card */}
                <div className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-700/80 bg-slate-950/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Expo EAS Cloud Build</h4>
                        <p className="text-[11px] text-slate-400">React Native 0.76 • Expo SDK 52</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>Production</span>
                    </span>
                  </div>

                  {/* Build Spec Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Runtime Version</span>
                      <span className="text-xs font-bold text-white">1.0.0</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">OTA Channel</span>
                      <span className="text-xs font-bold text-emerald-400">production</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Architecture</span>
                      <span className="text-xs font-bold text-teal-300">ARM64 & x86_64</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    The mobile app is actively deployed to Expo Cloud. Any new updates we release are broadcast seamlessly to your phone via Over-The-Air (OTA) channel without needing to re-install.
                  </p>

                  {/* Expo External Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href={EXPO_PROJECT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>Expo Project Dashboard</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                    <a
                      href={EXPO_BUILDS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>EAS Builds & Artifacts</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>

                {/* 4 Key Native Mobile Advantages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold text-white">Instant Client Chat</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Receive immediate 1-on-1 notifications whenever a new prospect messages you on your profile.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center space-x-2 text-teal-400">
                      <QrCode className="w-4 h-4" />
                      <span className="text-xs font-bold text-white">In-App QR Scanner</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Use your camera to scan other creator cards and tabletop stands with zero external scanning apps.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs font-bold text-white">Over-The-Air Updates</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Features update instantly in the background via EAS branch deployment without manual downloads.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center space-x-2 text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold text-white">Offline Contact Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Export vCard phonebook entries and save visiting cards directly to your phone contacts in 1-tap.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          3. PLATFORM METRIC HIGHLIGHTS STRIP
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              10-Second Setup
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Zero Code Required</p>
            <p className="text-[11px] text-slate-400">No technical skills needed</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              1-on-1 Direct Chat
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Realtime Messaging</p>
            <p className="text-[11px] text-slate-400">Negotiate and confirm bookings</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
              Tabletop QR & NFC
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Desks, Counters & Stands</p>
            <p className="text-[11px] text-slate-400">Salons, cafes, clinics & gyms</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              Android App Ready
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Expo EAS Production</p>
            <p className="text-[11px] text-slate-400">Direct standalone APK install</p>
          </div>
        </div>
      </section>

      {/* ===================================================
          4. 6 CORE FEATURES ("Why Choose MyProfile?")
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Platform Advantages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Why Choose MyProfile?
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Everything you need to turn visitors, walk-ins, and online followers into loyal, paying clients.
          </p>
        </div>

        {/* 3x2 Glassmorphism Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`glass-card p-7 rounded-3xl border border-slate-800/80 ${feat.border} transition-all space-y-4 group bg-gradient-to-br ${feat.accent}`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 ${feat.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
                <div className="pt-2 flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================
          5. TAILORED FOR EVERY BUSINESS (6 Categories)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Tailored For Every Industry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Tailored For Every Professional & Business
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Explore dedicated workflows customized for your specific trade, storefront, or consulting service.
          </p>
        </div>

        {/* Tab Selection Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {Object.values(industryTabs).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${tab.color} text-slate-950 shadow-lg shadow-emerald-500/20 scale-105`
                    : 'glass-panel hover:bg-slate-800/80 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : tab.textColor}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Showcase Card */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Tab Details */}
            <div className="lg:col-span-7 space-y-5">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${currentTab.bgLight} ${currentTab.textColor} border ${currentTab.borderColor}`}>
                {currentTab.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                {currentTab.headline}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {currentTab.subhead}
              </p>

              {/* Bullet Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentTab.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${currentTab.textColor}`} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* CTA link */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r ${currentTab.color} text-slate-950 font-extrabold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all`}
                >
                  <span>Build Profile for {currentTab.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#download-app"
                  className="inline-flex items-center space-x-1.5 px-4 py-3 rounded-xl glass-panel hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Get on Mobile App</span>
                </a>
              </div>
            </div>

            {/* Right Tab Mockup Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <currentTab.icon className={`w-5 h-5 ${currentTab.textColor}`} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Live Business Preview
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{currentTab.sampleUser.rating}</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">{currentTab.sampleUser.name}</h4>
                  <p className="text-xs text-slate-400">{currentTab.sampleUser.tagline}</p>
                  <p className="text-xs text-emerald-400 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{currentTab.sampleUser.location}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Highlighted Offering & Rate Card
                  </span>
                  <p className="text-xs font-bold text-emerald-300">
                    {currentTab.sampleUser.popularItem}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center space-x-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Booking</span>
                  </button>
                  <button className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center space-x-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tabletop QR Stand</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          6. FEATURED VERIFIED CREATORS & PROS (Live Profiles)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Featured Verified Professionals
            </h2>
            <p className="text-sm text-slate-400">
              Explore real live portfolios and digital business cards powered by MyProfile
            </p>
          </div>
          <Link
            to="/discover"
            className="px-5 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold text-sm flex items-center space-x-1.5 transition-all border border-emerald-500/30"
          >
            <span>Explore All 250+ Profiles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleCreators.map((creator) => (
            <Link
              key={creator.username}
              to={`/p/${creator.username}`}
              className="glass-card p-6 rounded-2xl hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-slate-800"
            >
              <img
                src={getProfileAvatar(creator.image, creator.name)}
                alt={creator.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {creator.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {creator.badge}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{creator.rating} ({creator.reviews})</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  @{creator.username} • {creator.city}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {creator.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {creator.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800/90 text-[11px] font-medium text-slate-300 border border-slate-700/60">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================================================
          7. FREQUENTLY ASKED QUESTIONS (Accordion)
          =================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about MyProfile, the mobile app, tabletop QR stands, and verified identity.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-slate-800/90 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="font-bold text-white text-sm sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================
          8. BOTTOM HIGH-IMPACT CTA BANNER
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/30 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to upgrade your professional identity?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join hundreds of creators, consultants, and business owners who share their work seamlessly across web and mobile.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Claim Your Username Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-slate-800 text-emerald-300 hover:text-white font-bold text-base transition-all flex items-center justify-center space-x-2 border border-emerald-500/40"
              >
                <Download className="w-5 h-5 text-emerald-400" />
                <span>Download Android APK</span>
              </a>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Free forever tier • No credit card required • Instant Over-The-Air Expo Updates
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
