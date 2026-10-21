import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Smartphone,
  Search,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Lock,
  UserCheck,
  Briefcase,
  Clock,
  MapPin,
  MessageCircle,
  Sparkles,
  Building2
} from 'lucide-react';

const CATEGORIES = [
  { label: 'All Industries', value: '' },
  { label: '💇 Salon & Beauty', value: 'Salon & Beauty' },
  { label: '💻 IT & Software', value: 'IT & Software' },
  { label: '🏋️ Fitness & Health', value: 'Fitness & Health' },
  { label: '🩺 Doctor & Clinic', value: 'Doctor & Clinic' },
  { label: '🍕 Restaurant & Food', value: 'Restaurant & Food' },
  { label: '⚖️ Professional Services', value: 'Professional Services' },
  { label: '🎓 Education & Coaching', value: 'Education & Coaching' },
  { label: '🛍️ Retail & Commerce', value: 'Retail & Commerce' },
  { label: '🎨 Content Creator & Artist', value: 'Content Creator & Artist' },
  { label: '🏢 Other Business', value: 'Other Business' }
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Business & Digital Profiles Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Discover Verified Profiles & Businesses
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Explore local salons, IT professionals, clinics, fitness trainers, and creators with digital rate cards, working hours, and direct contact.
        </p>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'categories'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Browse by Industry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'phone'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Private Phone Lookup</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE BY INDUSTRY CATEGORY */}
      {activeTab === 'categories' && (
        <div className="space-y-8 animate-fade-in">
          {/* Search bar & Category filter */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <form onSubmit={handleBrowseSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by specialty, business name, or skill (e.g. Bridal Makeup, React, Dental)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition-colors shadow-lg shadow-emerald-500/10 flex items-center space-x-1.5"
              >
                <span>Filter</span>
              </button>
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value || 'all'}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profiles Grid */}
          {browseLoading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Loading verified businesses...</p>
            </div>
          ) : browseProfiles.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl glass-card border border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Profiles Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active profiles found under "{selectedCategory || 'this filter'}". Try selecting another category or clearing your search.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {browseProfiles.map((p) => (
                <div
                  key={p._id || p.username}
                  className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header: Avatar, Name, Category Tag */}
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-emerald-400 text-xs">✓</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">@{p.username}</p>
                        
                        {/* Category & SubCategory badges */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                            {p.category || 'Professional'}
                          </span>
                          {p.subCategory ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20 truncate max-w-[130px]">
                              {p.subCategory}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    {p.bio ? (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {p.bio}
                      </p>
                    ) : null}

                    {/* Storefront details strip */}
                    <div className="space-y-1 pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                      {p.businessDetails?.timing ? (
                        <div className="flex items-center space-x-1.5 truncate">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{p.businessDetails.timing}</span>
                        </div>
                      ) : null}

                      {p.city || p.businessDetails?.address ? (
                        <div className="flex items-center space-x-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span>{p.businessDetails?.address || p.city}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                    <Link
                      to={`/p/${p.username}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <span>View Profile & QR</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {p.businessDetails?.whatsappNumber ? (
                      <a
                        href={`https://wa.me/${p.businessDetails.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(p.name)},%20I%20found%20your%20profile%20on%20MyProfile!`}
                        target="_blank"
                        rel="noreferrer"
                        title="Chat on WhatsApp"
                        className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRIVATE PHONE LOOKUP */}
      {activeTab === 'phone' && (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
          {/* Search Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <form onSubmit={handlePhoneSearch} className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Enter Phone Number
              </label>
              <div className="flex rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-800 px-3.5 text-sm text-slate-200 border-r border-slate-700 focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
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
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {phoneLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">Privacy Policy:</strong> We protect user privacy by never exposing phone numbers in search responses. Lookups are strictly limited to 5 per minute to prevent automated scanning.
              </p>
            </div>
          </div>

          {/* Result Section */}
          {phoneResult && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-500/40 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <img
                  src={phoneResult.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={phoneResult.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{phoneResult.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                      {phoneResult.category || phoneResult.profileType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">@{phoneResult.username} • {phoneResult.city}</p>
                  {phoneResult.bio && (
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 max-w-md">{phoneResult.bio}</p>
                  )}
                </div>
              </div>

              <Link
                to={`/p/${phoneResult.username}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
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
              <h3 className="text-base font-bold text-white">No Match</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{phoneError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
