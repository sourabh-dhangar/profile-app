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
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  const [searchUsername, setSearchUsername] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      navigate(`/p/${searchUsername.trim().toLowerCase()}`);
    }
  };

  const sampleCreators = [
    {
      name: 'Rahul Sharma',
      username: 'rahul_dev',
      title: 'Full Stack Engineer',
      city: 'Bengaluru',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      badge: 'Professional',
      skills: ['React', 'Node.js', 'System Design']
    },
    {
      name: 'Priya Patel',
      username: 'priya_design',
      title: 'Product & UI Designer',
      city: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      badge: 'Freelancer',
      skills: ['Figma', 'Design Systems', 'UX Audit']
    }
  ];

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Next-Gen Identity & Personal Branding</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          One Person. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            One Verified Digital Identity.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
          Build a modular, link-in-bio style portfolio that showcases your experience, services,
          and short-form reels. Share seamlessly via custom link or instant QR code.
        </p>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search by username (e.g. rahul_dev)"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-xl transition-all"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all"
            >
              View
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
          >
            <span>Claim Your Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/discover"
            className="px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 font-semibold text-base transition-all flex items-center space-x-2"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Find by Phone</span>
          </Link>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Profiles</h2>
            <p className="text-sm text-slate-400">Discover top verified creators and professionals</p>
          </div>
          <Link to="/reels" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
            <span>Watch Reels</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleCreators.map((creator) => (
            <Link
              key={creator.username}
              to={`/p/${creator.username}`}
              className="glass-card p-6 rounded-2xl hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <img
                src={creator.image}
                alt={creator.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {creator.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {creator.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">@{creator.username} • {creator.city}</p>
                <p className="text-sm text-slate-300 mb-3">{creator.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {creator.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Core Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Why Professionals Choose MyProfile
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Engineered to replace scattered links, paper resumes, and lost contacts with one smart hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant QR & Custom URL</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every profile gets a clean slug (`/p/yourname`) and an auto-generated high-res QR code ready to print on visiting cards or share digitally.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Built-in 60s Reels</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Show, don't just tell. Pitch your skills, demo your product, or share knowledge with short-form vertical video reels right on your profile.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Privacy & Anti-Enumeration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Phone discovery uses irreversible HMAC hashing with full opt-in control. Contact numbers are never exposed to scrapers or crawlers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
