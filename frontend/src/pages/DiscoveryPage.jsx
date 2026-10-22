import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { getProfileAvatar } from '../utils/avatar';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Clock,
  MapPin,
  MessageCircle,
  Sparkles,
  Building2,
  Scissors,
  Code2,
  Dumbbell,
  Stethoscope,
  UtensilsCrossed,
  Scale,
  GraduationCap,
  ShoppingBag,
  Palette,
  Star,
  QrCode,
  Share2,
  Check,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

const CATEGORIES = [
  { label: 'All Industries', value: '', icon: Sparkles, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10' },
  { label: 'Salon & Beauty', value: 'Salon & Beauty', icon: Scissors, color: 'text-pink-400', badgeBg: 'bg-pink-500/10' },
  { label: 'IT & Software', value: 'IT & Software', icon: Code2, color: 'text-cyan-400', badgeBg: 'bg-cyan-500/10' },
  { label: 'Fitness & Health', value: 'Fitness & Health', icon: Dumbbell, color: 'text-amber-400', badgeBg: 'bg-amber-500/10' },
  { label: 'Doctor & Clinic', value: 'Doctor & Clinic', icon: Stethoscope, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/10' },
  { label: 'Restaurant & Food', value: 'Restaurant & Food', icon: UtensilsCrossed, color: 'text-orange-400', badgeBg: 'bg-orange-500/10' },
  { label: 'Professional Services', value: 'Professional Services', icon: Scale, color: 'text-indigo-400', badgeBg: 'bg-indigo-500/10' },
  { label: 'Education & Coaching', value: 'Education & Coaching', icon: GraduationCap, color: 'text-purple-400', badgeBg: 'bg-purple-500/10' },
  { label: 'Retail & Commerce', value: 'Retail & Commerce', icon: ShoppingBag, color: 'text-teal-400', badgeBg: 'bg-teal-500/10' },
  { label: 'Content Creator & Artist', value: 'Content Creator & Artist', icon: Palette, color: 'text-rose-400', badgeBg: 'bg-rose-500/10' },
  { label: 'Other Business', value: 'Other Business', icon: Building2, color: 'text-slate-400', badgeBg: 'bg-slate-500/10' }
];

const TRENDING_SEARCHES = [
  'Bridal Makeup',
  'Full Stack Architect',
  'Physiotherapy',
  'Yoga Studio',
  'Chartered Accountant',
  'Digital Illustrator',
  'Cloud Kitchen'
];

const DiscoveryPage = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'phone'
  
  // Phone search state
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneResult, setPhoneResult] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  // Category browse state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [browseProfiles, setBrowseProfiles] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch profiles by category/keyword
  const fetchCategoryProfiles = async (category = '', search = '') => {
    setBrowseLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await api.get(`/discovery/browse?${params.toString()}`);
      if (res.data?.success && res.data?.data?.profiles) {
        setBrowseProfiles(res.data.data.profiles);
      } else {
        setBrowseProfiles([]);
      }
    } catch (err) {
      console.error('Error fetching category profiles:', err);
      setBrowseProfiles([]);
    } finally {
      setBrowseLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProfiles(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleBrowseSearchSubmit = (e) => {
    e.preventDefault();
    fetchCategoryProfiles(selectedCategory, searchQuery);
  };

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
    fetchCategoryProfiles(selectedCategory, term);
  };

  const handleCopyLink = (username, id) => {
    const url = `${window.location.origin}/p/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePhoneSearch = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneResult(null);

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await api.post('/discovery/search-by-phone', {
        phone: clean,
        countryCode,
      });

      if (res.data.success) {
        setPhoneResult(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setPhoneError('Rate limit reached: Maximum 5 phone searches per minute for privacy protection.');
      } else {
        setPhoneError('No discoverable profile found for this phone number.');
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  // Helper to generate rich context description if bio is empty
  const getProfileBio = (p) => {
    if (p.bio && p.bio.trim().length > 0) return p.bio;
    const cat = p.category || 'Professional Business';
    const role = p.profileType || 'Specialist';
    const cityStr = p.city ? ` in ${p.city}` : '';
    return `Verified ${cat} ${role}${cityStr}. Offering professional services, transparent digital rate cards, and direct customer appointments.`;
  };

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 rounded-full blur-[120px] -z-10" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10" />
      <div className="pointer-events-none absolute top-2/3 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* ========================================================================= */}
        {/* 1. HERO HEADER SECTION */}
        {/* ========================================================================= */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>Universal Business & Digital Profiles Directory</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Discover Verified <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Profiles & Businesses</span>
          </h1>

          {/* Detailed Description */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Explore trusted local salons, clinics, fitness trainers, IT professionals, and verified creators. Browse transparent digital rate cards, tabletop QR stands, verified portfolios, and connect directly with zero platform commission.
          </p>

          {/* Value Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-left">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">10 Industries</p>
                <p className="text-[11px] text-slate-400">Salons to IT hubs</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Tabletop QR</p>
                <p className="text-[11px] text-slate-400">Scan & save vCard</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Direct WhatsApp</p>
                <p className="text-[11px] text-slate-400">Zero commission</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">100% Verified</p>
                <p className="text-[11px] text-slate-400">Anti-fraud identity</p>
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Browse by Industry Directory</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'phone'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Private Phone Lookup</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BROWSE BY INDUSTRY CATEGORY */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-8 animate-fade-in">
            {/* Search Box & Category Filter Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
              {/* Search Form */}
              <form onSubmit={handleBrowseSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by specialty, business name, service or city (e.g. Bridal Hair, React, Dental Clinic)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-500 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); fetchCategoryProfiles(selectedCategory, ''); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-lg"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>

              {/* Trending Searches Row */}
              <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
                <span className="text-slate-400 flex items-center space-x-1 font-semibold mr-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trending:</span>
                </span>
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleTrendingClick(term)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/60 transition-colors text-[11px]"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Category Pills Header */}
              <div className="border-t border-slate-800/80 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Filter by Business Industry ({CATEGORIES.length - 1} Specializations)
                  </span>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('')}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Show All Industries
                    </button>
                  )}
                </div>

                {/* Categories Grid / Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.value;
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.value || 'all'}
                        type="button"
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`p-2.5 rounded-2xl text-xs font-bold border transition-all text-left flex items-center space-x-2.5 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                            : 'bg-slate-950/60 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl ${cat.badgeBg} ${cat.color} flex-shrink-0`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Profiles Feed Results */}
            {browseLoading ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-300 font-medium">Fetching verified businesses & digital storefronts...</p>
              </div>
            ) : browseProfiles.length === 0 ? (
              <div className="text-center py-20 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Profiles Found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  No verified profiles found matching "{selectedCategory || searchQuery || 'this filter'}". Try clearing the filter or searching for a general keyword.
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results count banner */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>
                    Showing <strong className="text-white">{browseProfiles.length}</strong> verified {selectedCategory ? `${selectedCategory} businesses` : 'profiles across all industries'}
                  </span>
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-time Active Feed</span>
                  </span>
                </div>

                {/* Profiles Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {browseProfiles.map((p) => {
                    const isCopied = copiedId === (p._id || p.username);
                    const bioText = getProfileBio(p);

                    return (
                      <div
                        key={p._id || p.username}
                        className="rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                      >
                        {/* Top Accent Gradient Header */}
                        <div className="h-16 bg-gradient-to-r from-slate-800 via-slate-800/80 to-slate-900 relative p-3 flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 shadow-sm backdrop-blur-md">
                            <Building2 className="w-3 h-3" />
                            <span>{p.category || 'Professional'}</span>
                          </span>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(p.username, p._id || p.username)}
                              title="Copy Profile Link"
                              className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Profile Body */}
                        <div className="px-5 pt-0 pb-5 space-y-4 -mt-8 flex-1 flex flex-col justify-between">
                          <div className="space-y-3.5">
                            {/* Avatar & Basic Credentials */}
                            <div className="flex items-end justify-between">
                              <div className="relative">
                                <img
                                  src={getProfileAvatar(p.photoUrl, p.name)}
                                  alt={p.name}
                                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-900 border border-slate-700/80 shadow-md group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-slate-950 rounded-full shadow-md" title="Verified Identity">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* Rating / Credential Badge */}
                              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>4.9 Verified</span>
                              </div>
                            </div>

                            {/* Name, Handle & SubCategory */}
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <Link
                                  to={`/p/${p.username}`}
                                  className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate"
                                >
                                  {p.name}
                                </Link>
                                <span className="text-emerald-400 text-xs font-bold" title="Identity Verified">✓</span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium truncate">
                                @{p.username} • <span className="text-slate-300 font-semibold">{p.profileType || 'Business'}</span>
                              </p>
                              
                              {p.subCategory ? (
                                <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                                  {p.subCategory}
                                </span>
                              ) : null}
                            </div>

                            {/* Rich Description / Bio */}
                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                              {bioText}
                            </p>

                            {/* Location & Operating Hours */}
                            <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                              <div className="flex items-center space-x-2 truncate">
                                <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                <span className="truncate">{p.businessDetails?.address || p.city || 'Available Worldwide'}</span>
                              </div>

                              <div className="flex items-center space-x-2 truncate">
                                <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                <span className="truncate">{p.businessDetails?.timing || 'Business Hours: Mon - Sat (9 AM - 8 PM)'}</span>
                              </div>
                            </div>

                            {/* Feature Chips */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center space-x-1">
                                <QrCode className="w-2.5 h-2.5 text-emerald-400" />
                                <span>Tabletop QR</span>
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                                📱 Digital vCard
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                                💬 Direct Chat
                              </span>
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="flex items-center space-x-2 pt-4 border-t border-slate-800/80">
                            <Link
                              to={`/p/${p.username}`}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-emerald-500/10"
                            >
                              <span>View Profile & QR</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {p.businessDetails?.whatsappNumber ? (
                              <a
                                href={`https://wa.me/${p.businessDetails.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(p.name)},%20I%20found%20your%20business%20on%20MyProfile!`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/30 transition-all"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            ) : (
                              <Link
                                to={`/p/${p.username}`}
                                title="Contact Provider"
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. WHY BUSINESSES USE MYPROFILE EXPLAINER */}
            {/* ========================================================================= */}
            <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-8 backdrop-blur-xl">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Why Customers & Businesses Love MyProfile
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  The Complete Operating System for Local Commerce
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Whether you're running a boutique salon, dental clinic, consulting practice, or tech consultancy, MyProfile powers your digital presence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Tabletop Acrylic QR Stands</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Place custom acrylic QR displays on client desks, salon mirrors, or reception counters. Customers scan to view rates and save your contact to their phone instantly.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Dynamic Rate Cards & Hours</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Update service prices, working hours, and portfolio photos from your phone in real time without printing expensive brochures or maintaining complex websites.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">Zero Commission Direct Contact</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Customers message your WhatsApp or call you directly. We never charge booking commissions or take a percentage of your service earnings.
                  </p>
                </div>
              </div>

              {/* Bottom CTA Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base font-bold text-white">Want to list your business on this directory?</h4>
                  <p className="text-xs text-slate-300">Create your verified profile, custom tabletop QR stand, and portfolio in under 60 seconds.</p>
                </div>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                >
                  <span>Claim Your Free Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRIVATE PHONE LOOKUP */}
        {/* ========================================================================= */}
        {activeTab === 'phone' && (
          <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            {/* Search Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>Private Anti-Fraud Phone Verification</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Search someone by their 10-digit mobile number to verify their digital identity before dealing, without exposing their number publicly.
                </p>
              </div>

              <form onSubmit={handlePhoneSearch} className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Enter Mobile Number
                </label>
                <div className="flex rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-slate-900 px-3.5 text-sm text-slate-200 border-r border-slate-800 focus:outline-none"
                  >
                    <option value="+91">🇮🇳 +91 (India)</option>
                    <option value="+1">🇺🇸 +1 (USA)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={phoneLoading}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    {phoneLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span className="hidden sm:inline">Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-200 font-semibold">Zero-Knowledge Privacy:</strong> Phone numbers are matched via one-way cryptographic SHA-256 hashes. Responses never reveal plain phone numbers. Lookups are strictly rate-limited to 5 per minute to prevent automated scraping.
                </p>
              </div>
            </div>

            {/* Result Section */}
            {phoneResult && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <img
                    src={getProfileAvatar(phoneResult.photoUrl, phoneResult.name)}
                    alt={phoneResult.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-white">{phoneResult.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {phoneResult.category || phoneResult.profileType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">@{phoneResult.username} • {phoneResult.city || 'India'}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 max-w-md">
                      {phoneResult.bio || 'Verified registered identity on MyProfile.'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/p/${phoneResult.username}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all whitespace-nowrap"
                >
                  <span>View Full Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Error / Not Found Message */}
            {phoneError && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 animate-fade-in">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Match Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">{phoneError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryPage;
