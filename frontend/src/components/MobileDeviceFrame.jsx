import React from 'react';
import { Sparkles, MapPin, Mail, Phone, ExternalLink, Download, MessageSquare } from 'lucide-react';

const THEME_STYLES = {
  'default': {
    bg: 'from-slate-900 to-slate-950',
    accent: '#10b981',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    card: 'bg-slate-900/80 border-slate-800',
    btn: 'bg-emerald-500 text-slate-950',
  },
  'dark-neon': {
    bg: 'from-purple-950 to-slate-950',
    accent: '#8b5cf6',
    badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    card: 'bg-purple-950/40 border-fuchsia-900/40',
    btn: 'bg-fuchsia-500 text-white',
  },
  'minimalist-luxe': {
    bg: 'from-amber-950/40 to-black',
    accent: '#d4af37',
    badge: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    card: 'bg-zinc-900/80 border-zinc-800',
    btn: 'bg-amber-400 text-slate-950',
  },
  'cyberpunk-emerald': {
    bg: 'from-teal-950 to-slate-950',
    accent: '#06b6d4',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    card: 'bg-teal-950/50 border-cyan-900/40',
    btn: 'bg-cyan-500 text-slate-950',
  },
  'sunset-gradient': {
    bg: 'from-rose-950 to-slate-950',
    accent: '#f43f5e',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    card: 'bg-rose-950/40 border-rose-900/40',
    btn: 'bg-rose-500 text-white',
  },
};

const MobileDeviceFrame = ({ profile, sections = [] }) => {
  const currentTheme = THEME_STYLES[profile?.theme] || THEME_STYLES['default'];

  return (
    <div className="flex flex-col items-center">
      {/* Phone chassis */}
      <div className="relative w-[340px] h-[690px] rounded-[52px] bg-slate-950 p-3 shadow-2xl shadow-emerald-500/10 ring-1 ring-slate-800/80 border-[6px] border-slate-900 overflow-hidden">
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center space-x-2 w-28 h-5 rounded-full bg-black border border-slate-800/60 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50" />
        </div>

        {/* Screen inner container */}
        <div className={`relative w-full h-full rounded-[42px] overflow-y-auto bg-gradient-to-b ${currentTheme.bg} text-slate-100 p-5 pt-10 scrollbar-none`}>
          
          {/* Header Profile Info */}
          <div className="text-center pt-2 pb-4">
            <div className="relative inline-block mx-auto mb-3">
              <img
                src={profile?.photoUrl || 'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256'}
                alt={profile?.name || 'Creator'}
                className="w-20 h-20 rounded-full object-cover border-2 shadow-lg"
                style={{ borderColor: currentTheme.accent }}
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-slate-950" />
              </span>
            </div>

            <h4 className="text-base font-extrabold text-white tracking-tight">
              {profile?.name || 'Your Name'}
            </h4>
            <div className="flex items-center justify-center space-x-1.5 mt-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentTheme.badge}`}>
                @{profile?.username || 'username'}
              </span>
              <span className="text-[10px] text-slate-400">
                • {profile?.profileType || 'Personal'}
              </span>
            </div>

            {profile?.bio && (
              <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {profile?.city && (
              <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400 mt-2">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{profile.city}</span>
              </div>
            )}

            {/* Stats Metric Strip */}
            <div className="mt-3.5 grid grid-cols-3 gap-1 p-2 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-center">
                <div className="text-xs font-black text-white">{profile?.completionPercentage || 100}%</div>
                <div className="text-[8px] font-bold text-slate-500 tracking-wider">VERIFIED</div>
              </div>
              <div className="text-center border-x border-white/5">
                <div className="text-xs font-black text-white">4</div>
                <div className="text-[8px] font-bold text-slate-500 tracking-wider">REELS</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-black text-white">1.4K</div>
                <div className="text-[8px] font-bold text-slate-500 tracking-wider">VIEWS</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-3 flex items-center justify-center space-x-2">
              <div
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl shadow flex items-center space-x-1 cursor-default ${currentTheme.btn}`}
              >
                <Download className="w-3 h-3" />
                <span>Save Contact</span>
              </div>
              <div className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center space-x-1 cursor-default">
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>Inquiry</span>
              </div>
            </div>
          </div>

          {/* Modular Sections Preview */}
          <div className="space-y-3 mt-1 pb-16">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Sections & Portfolio</span>
              <span className="text-[10px] text-emerald-400 font-medium">{sections.length} active</span>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-6 px-3 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                No sections added yet. Add skills, projects, or links to display here.
              </div>
            ) : (
              sections.map((sec) => (
                <div
                  key={sec._id || sec.id || Math.random()}
                  className={`p-3 rounded-2xl border shadow-sm transition-all ${currentTheme.card}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white tracking-tight">{sec.title}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {sec.type}
                    </span>
                  </div>

                  {sec.content?.items && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sec.content.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/40"
                        >
                          {it}
                        </span>
                      ))}
                    </div>
                  )}

                  {sec.content?.text && (
                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                      {sec.content.text}
                    </p>
                  )}

                  {sec.content?.links && (
                    <div className="space-y-1 mt-1.5">
                      {sec.content.links.map((lnk, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 text-[10px] text-slate-300"
                        >
                          <span className="font-medium text-white">{lnk.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Simulated Floating Bottom Dock inside chassis */}
        <div className="absolute bottom-4 left-6 right-6 z-30 flex items-center justify-around py-2 px-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-[11px]">👤</span>
            <span className="text-[8px] font-bold text-emerald-400">Profile</span>
          </div>
          <div className="flex flex-col items-center opacity-60">
            <span className="text-[11px]">🎬</span>
            <span className="text-[8px] font-medium text-slate-400">Reels</span>
          </div>
          <div className="flex flex-col items-center opacity-60">
            <span className="text-[11px]">🔍</span>
            <span className="text-[8px] font-medium text-slate-400">Discover</span>
          </div>
          <div className="flex flex-col items-center opacity-60">
            <span className="text-[11px]">🔐</span>
            <span className="text-[8px] font-medium text-slate-400">Sign In</span>
          </div>
        </div>
      </div>

      {/* Device Label */}
      <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Device Preview (Updates Real-time)</span>
      </div>
    </div>
  );
};

export default MobileDeviceFrame;
