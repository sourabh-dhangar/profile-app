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
  Compass
} from 'lucide-react';
import { getProfileAvatar } from '../utils/avatar';

const LandingPage = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const [activeTab, setActiveTab] = useState('salons');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/p/${searchUsername.trim().toLowerCase()}`);
    }
  };

  // Industry Tab Content
  const industryTabs = {
    salons: {
      id: 'salons',
      label: 'Salons & Spas',
      icon: Scissors,
      headline: 'Fill Appointment Slots on Auto-Pilot with Tabletop QR Stands',
      subhead: 'Place elegant acrylic QR stands at styling stations and reception counters. Clients scan to explore bridal packages, haircut reels, service rate cards, and book directly on WhatsApp.',
      badge: 'For Stylists & Spas',
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/30',
      bgLight: 'bg-pink-500/10',
      features: [
        'Transparent service rate cards (Bridal, Keratin, Hair Spa, Facials)',
        'Before-and-after 60-second transformation reels',
        'Direct 1-tap WhatsApp booking without phone tag',
        'Google Maps location pin for instant salon directions'
      ],
      sampleUser: {
        name: 'Velvet Hair & Spa Studio',
        tagline: 'Luxury Hair Treatments & Bridal Styling',
        location: 'Indiranagar, Bengaluru',
        rating: '4.9 (180+ Reviews)',
        popularItem: 'Bridal Makeover Package • ₹8,500'
      }
    },
    tech: {
      id: 'tech',
      label: 'Developers & Freelancers',
      icon: Code2,
      headline: 'The High-Converting Portfolio Link That Replaces Outdated Resumes',
      subhead: 'Curate your GitHub repositories, live demo deployments, verified certifications, tech stack pills, and 60-second video code breakdowns in one lightning-fast, modular link-in-bio.',
      badge: 'For Tech Talent',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgLight: 'bg-emerald-500/10',
      features: [
        'GitHub repository showcase & live demo links',
        '60-second elevator pitch video reels',
        '1-Tap vCard contact download for recruiters & clients',
        'Cryptographic HMAC phone privacy protection'
      ],
      sampleUser: {
        name: 'Rahul Sharma',
        tagline: 'Staff Software Engineer & Distributed Systems',
        location: 'Bengaluru, India',
        rating: '5.0 (95+ Recommendations)',
        popularItem: 'Architecture Audit & Consulting • ₹15,000'
      }
    },
    clinics: {
      id: 'clinics',
      label: 'Doctors & Clinics',
      icon: Stethoscope,
      headline: 'Verified Medical Credentials & Hassle-Free Patient Consultations',
      subhead: 'Present your verified medical degrees, clinic operating hours, Google Maps navigation, and offer emergency or scheduled WhatsApp consultations with full patient privacy.',
      badge: 'For Healthcare Pros',
      color: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgLight: 'bg-cyan-500/10',
      features: [
        'Verified medical license & qualification badges',
        'Morning & Evening clinic operating hours display',
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
    cafes: {
      id: 'cafes',
      label: 'Cafes & Restaurants',
      icon: UtensilsCrossed,
      headline: 'Ditch Dirty Paper Menus for Smart Interactive Tabletop Stands',
      subhead: 'Give diners a touch-free digital menu with rich food photos, daily specials, chef introduction reels, and WhatsApp table ordering—no app download required.',
      badge: 'For Food & Hospitality',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgLight: 'bg-amber-500/10',
      features: [
        'Rich visual digital menu with prices & dietary tags',
        'Chef special dishes & recipe video reels',
        'Table reservation & preorder via direct WhatsApp chat',
        'Social media & Google Review QR code integration'
      ],
      sampleUser: {
        name: 'Artisan Roast & Bakery',
        tagline: 'Single-Origin Coffee & Sourdough Pastries',
        location: 'Bandra West, Mumbai',
        rating: '4.8 (310+ Reviews)',
        popularItem: 'Truffle Mushroom Toast & Cortado • ₹420'
      }
    },
    legal: {
      id: 'legal',
      label: 'Lawyers & Consultants',
      icon: Scale,
      headline: 'A Prestigious Verified Digital Card That Commands Instant Trust',
      subhead: 'Replace disposable printed visiting cards. Showcase verified bar credentials, practice areas, case study breakdowns, and allow corporate clients to save your contact with 1-tap.',
      badge: 'For Legal & Advisory',
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-400',
      borderColor: 'border-violet-500/30',
      bgLight: 'bg-violet-500/10',
      features: [
        'Practice areas & corporate advisory specialties',
        'Instant .vcf vCard phonebook sync for iPhone & Android',
        'Confidential client inquiry intake via WhatsApp',
        'Anti-spam phone number security & verification'
      ],
      sampleUser: {
        name: 'Advocate Vikram Singhania',
        tagline: 'Corporate Law, M&A & Intellectual Property',
        location: 'Connaught Place, New Delhi',
        rating: '5.0 (88+ Corporate Clients)',
        popularItem: 'Statutory Compliance Audit • Custom'
      }
    }
  };

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
      q: 'What is MyProfile and how is it different from a basic link-in-bio?',
      a: 'Traditional link-in-bio tools are just static lists of hyperlinks. MyProfile is a full-stack digital identity platform built for real business: it combines verified professional credentials, bookable service cards with transparent pricing, 60-second video reels, 1-tap WhatsApp consultation, instant vCard phonebook sync, and physical acrylic tabletop QR stands.'
    },
    {
      q: 'Do customers need to download an app to scan my QR code?',
      a: 'No app download is needed. Anyone with any smartphone (iPhone or Android) can point their native camera at your tabletop QR stand or scan your digital QR code. Your full portfolio loads instantly in their mobile web browser in under 1 second.'
    },
    {
      q: 'How does the Tabletop Acrylic QR Stand work for offline businesses?',
      a: 'Every profile automatically generates high-resolution, print-ready QR codes formatted for acrylic tabletop stands, mirror stickers, counter displays, and visiting cards. Place them at your salon styling station, clinic reception desk, restaurant table, or exhibition booth for instant client engagement.'
    },
    {
      q: 'How does the WhatsApp Lead Engine work?',
      a: 'Instead of forcing potential customers through long, tedious contact forms that get abandoned, visitors tap one button to open a direct WhatsApp chat with you. The message is pre-formatted with the exact service they are interested in, allowing you to close deals and book appointments instantly.'
    },
    {
      q: 'Is my phone number safe from spammers and web scrapers?',
      a: 'Yes! MyProfile utilizes military-grade cryptographic HMAC-SHA256 one-way hashing for phone discovery. Your raw phone number is never exposed in plain text in the HTML code or accessible to automated web crawlers. You have full control over who can discover or message you.'
    },
    {
      q: 'Can I customize my profile colors, themes, and services anytime?',
      a: 'Absolutely. From your secure dashboard, you can switch between 6+ designer visual themes (such as Dark Neon, Cyberpunk Emerald, Sunset Gradient, and Minimalist Slate), update your service catalog, upload new 60-second video reels, and edit your bio in real time with instant live updates.'
    }
  ];

  const currentTab = industryTabs[activeTab];

  return (
    <div className="relative overflow-hidden space-y-28 py-8 sm:py-12">
      {/* Ambient Radial Gradient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl -z-10 rounded-full" />
      <div className="pointer-events-none absolute top-[700px] -left-40 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-transparent blur-3xl -z-10 rounded-full" />
      <div className="pointer-events-none absolute top-[1300px] -right-40 w-[500px] h-[500px] bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl -z-10 rounded-full" />

      {/* ===================================================
          1. HERO SECTION (Split View with Interactive Phone Mockup)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description & Actions */}
          <div className="lg:col-span-7 text-left space-y-7">
            {/* Announcement Pill */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Next-Gen Verified Identity & Smart Tabletop QR Stands</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Your Entire Professional World. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                In One Smart Link & Instant QR Stand.
              </span>
            </h1>

            {/* Rich Subhead Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Replace scattered links, lost paper visiting cards, and static resumes with an interactive digital portfolio. Showcase verified credentials, bookable service menus, 60-second video reels, and instant 1-tap WhatsApp consultation.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl">
              <div className="relative flex items-center shadow-2xl">
                <input
                  type="text"
                  placeholder="Search by username (e.g. rahul_dev or priya_design)"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  className="w-full px-5 py-4 pl-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
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

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2.5"
              >
                <span>Claim Your Free Profile</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/discover"
                className="px-6 py-4 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 font-semibold text-base transition-all flex items-center space-x-2 border border-slate-700/80 hover:border-emerald-500/40"
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>Explore Directory</span>
              </Link>
              <Link
                to="/reels"
                className="px-5 py-4 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 font-semibold text-base transition-all flex items-center space-x-2 border border-slate-700/80 hover:border-teal-500/40"
              >
                <Video className="w-5 h-5 text-teal-400" />
                <span>Watch Reels</span>
              </Link>
            </div>

            {/* Trust Metric Strip */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-400 border-t border-slate-800/80">
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
                <span>Zero Commission Leads</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Anti-Scraping Phone Guard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Phone Mockup & Acrylic Stand Preview */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Background Decorative Rings */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-3xl blur-2xl -z-10" />

            {/* Floating Live Badge: WhatsApp Inquiry */}
            <div className="absolute -top-4 -left-4 sm:-left-8 z-20 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-xl flex items-center space-x-2.5 text-xs text-white backdrop-blur-md animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-300">New WhatsApp Lead</p>
                <p className="text-[10px] text-slate-400">Appointment booked 2m ago</p>
              </div>
            </div>

            {/* Floating Live Badge: vCard Downloaded */}
            <div className="absolute -bottom-4 -right-4 sm:-right-8 z-20 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl flex items-center space-x-2.5 text-xs text-white backdrop-blur-md">
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-cyan-300">1-Tap vCard Saved</p>
                <p className="text-[10px] text-slate-400">Added to Apple Contacts</p>
              </div>
            </div>

            {/* Mobile Device Frame */}
            <div className="w-full max-w-[340px] rounded-[36px] bg-slate-900 border-4 border-slate-700/80 shadow-2xl shadow-emerald-500/10 p-3.5 text-left relative overflow-hidden ring-1 ring-white/10">
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800" />
              </div>

              {/* Profile Card Header Inside Frame */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 p-4 border border-slate-700/60 space-y-4">
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
                  <div className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-center cursor-pointer transition-colors">
                    <Download className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[9px] text-cyan-300 block font-bold">vCard</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-center cursor-pointer transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-300 block font-medium">Map</span>
                  </div>
                </div>

                {/* Service Card Preview */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
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
                  <div className="p-2 rounded-lg bg-white">
                    <QrCode className="w-8 h-8 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Tabletop Stand QR
                    </span>
                    <span className="text-[11px] font-medium text-slate-200 block">
                      Scan to view & connect
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          2. PLATFORM STATISTICS STRIP (Social Proof)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              10+
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Industries Powered</p>
            <p className="text-[11px] text-slate-400">Salons, Clinics, Tech, Law & Dining</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
              &lt; 1 Sec
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Instant vCard Saving</p>
            <p className="text-[11px] text-slate-400">Direct to iPhone & Android Contacts</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">
              100%
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Direct WhatsApp Connect</p>
            <p className="text-[11px] text-slate-400">Zero middleman commission fees</p>
          </div>

          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              HMAC-256
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white">Anti-Scrape Privacy</p>
            <p className="text-[11px] text-slate-400">Cryptographically protected phone</p>
          </div>
        </div>
      </section>

      {/* ===================================================
          3. INDUSTRY SOLUTION SWITCHER ("Built for Every Profession")
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Tailored Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Engineered for Every Business & Independent Creator
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Whether you run a brick-and-mortar salon counter or write distributed systems code, MyProfile replaces fragmented links with one high-converting hub.
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
              <div className="pt-4">
                <Link
                  to="/login"
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r ${currentTab.color} text-slate-950 font-extrabold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all`}
                >
                  <span>Build Profile for {currentTab.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
                    Highlighted Offering
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
                    <span>View QR Stand</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          4. 6-PILLAR BENTO GRID (Deep Features & Rich Descriptions)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Core Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            6 Reasons Why Modern Professionals Upgrade to MyProfile
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered with deep attention to conversion rate, client convenience, and zero-spam privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Acrylic Tabletop Stand */}
          <div className="glass-card p-7 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Smart Tabletop QR Stands & NFC</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate print-ready, high-resolution QR displays for acrylic stands on salon mirrors, clinic reception desks, or dining tables. Clients scan directly with their smartphone camera—no app download necessary.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <span>Ready for Acrylic Counters & Stands</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: 60s Video Reels */}
          <div className="glass-card p-7 rounded-3xl border border-slate-800/80 hover:border-teal-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Built-in 60s Video Reels</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Video pitches convert 3x higher than static resumes or text descriptions. Upload vertical high-definition reels to demo software projects, explain specialized legal cases, or showcase beauty transformations.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-teal-400">
              <span>Short-Form Video Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Direct WhatsApp Connect */}
          <div className="glass-card p-7 rounded-3xl border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">1-Tap WhatsApp Lead Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Say goodbye to messy contact forms that get lost in junk folders. Potential clients tap one button to start a pre-filled WhatsApp conversation with you directly. You own 100% of the customer relationship.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <span>Zero Middleman Fees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Instant vCard Phonebook Sync */}
          <div className="glass-card p-7 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Instant vCard Phonebook Sync</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              One tap generates and downloads a native <code className="text-emerald-300">.vcf</code> file that instantly adds your name, business name, phone number, email, and social links to iPhone and Android address books.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <span>Direct to Phonebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: HMAC Privacy Engine */}
          <div className="glass-card p-7 rounded-3xl border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">HMAC Anti-Scraping Phone Guard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tired of telemarketers scraping your number? Our cryptographic HMAC-SHA256 privacy engine verifies contact numbers without exposing your raw digits in HTML or giving access to automated bot crawlers.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-purple-400">
              <span>Zero Spam Guarantee</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Visual Themes */}
          <div className="glass-card p-7 rounded-3xl border border-slate-800/80 hover:border-pink-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">6+ Designer Visual Themes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Match your personal or corporate brand aesthetic effortlessly. Choose from Dark Neon, Cyberpunk Emerald, Sunset Gradient, Velvet Crimson, Midnight Obsidian, or Clean Slate with a single click.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-pink-400">
              <span>Tailored Color Palettes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          5. FEATURED VERIFIED CREATORS & PROS (Live Direct Profiles)
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
          6. HOW IT WORKS (3 Simple Steps)
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Fast Setup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Go Live in Less Than 3 Minutes
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            No coding, no hosting setup, and no complex configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              1
            </div>
            <h3 className="text-xl font-bold text-white">Claim Your Unique Handle</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Register in 30 seconds and lock in your permanent custom URL (e.g. <code className="text-emerald-300">myprofile.com/p/yourname</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              2
            </div>
            <h3 className="text-xl font-bold text-white">Add Services & 60s Reel</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              List your services with transparent pricing, configure your WhatsApp number, and upload a short-form video elevator pitch.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              3
            </div>
            <h3 className="text-xl font-bold text-white">Print QR Stand or Share Link</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Download your tabletop QR stand graphics for your counter or add your bio link to Instagram, LinkedIn, and visiting cards.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          7. FREQUENTLY ASKED QUESTIONS (Accordion)
          =================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about MyProfile, tabletop QR stands, and verified identity.
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
          8. HIGH-CONVERTING CLOSING CTA BANNER
          =================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/30 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
              ⚡ Free to Start • No Credit Card Required
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Claim Your Verified Digital Identity?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join thousands of doctors, developers, salon owners, and corporate consultants who have modernized their client acquisition and professional presence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/login"
                className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started Now — It's Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/discover"
                className="w-full sm:w-auto px-7 py-4 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all border border-slate-700 hover:border-emerald-500/40 flex items-center justify-center space-x-2"
              >
                <Compass className="w-5 h-5 text-emerald-400" />
                <span>Browse All Profiles</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
