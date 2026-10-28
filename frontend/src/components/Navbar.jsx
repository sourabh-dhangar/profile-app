import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  User,
  Compass,
  Film,
  Shield,
  LogOut,
  LogIn,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Smartphone,
  Download,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Poll for unread direct messages when logged in
  useEffect(() => {
    if (!user) {
      setUnreadChatCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await api.get('/chat/unread-count');
        if (res.data?.success) {
          setUnreadChatCount(res.data.data.unreadCount || 0);
        }
      } catch (err) {
        // Silent fail on background counter
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 group shrink-0"
            aria-label="MyProfile Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                MyProfile
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (md and larger) */}
          <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            <Link
              to="/discover"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                isActive('/discover')
                  ? 'bg-slate-800/90 text-white border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Discover Creators & Businesses"
            >
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Discover</span>
            </Link>

            <Link
              to="/reels"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                isActive('/reels')
                  ? 'bg-slate-800/90 text-white border border-teal-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              title="60s Video Reels"
            >
              <Film className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Reels</span>
            </Link>

            {/* Direct Mobile App APK Download CTA */}
            <a
              href="https://expo.dev/artifacts/eas/NjnLkCez5bqVeS3Yfy9lvzQRjsKU_FM7Ljz_bEPm558.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all shadow-sm shadow-emerald-500/10 group"
              title="Download Android APK (Direct Link, 52MB)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Get App</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                APK
              </span>
            </a>

            {/* Direct 1-on-1 Messages Link */}
            {user && (
              <Link
                to="/messages"
                className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                  isActive('/messages')
                    ? 'bg-slate-800/90 text-white border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Direct Messages & Chat"
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-teal-300 shrink-0" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 ring-1 ring-slate-950 animate-pulse">
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  )}
                </div>
                <span>Messages</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                  isActive('/admin')
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40 shadow-sm'
                    : 'text-amber-400 hover:bg-amber-400/10'
                }`}
                title="Admin Control Panel"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all ${
                    isActive('/dashboard')
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                  title="Creator Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                {profile?.username && (
                  <Link
                    to={`/p/${profile.username}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                    title={`View Public Profile (@${profile.username})`}
                    aria-label="View Public Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-xl text-xs lg:text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all whitespace-nowrap"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Right Controls (Mobile Only) */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Quick 1-tap Messages icon on mobile if logged in */}
            {user && (
              <Link
                to="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-colors"
                title="Direct Messages"
                aria-label="Direct Messages"
              >
                <MessageSquare className="w-5 h-5 text-teal-300" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 ring-2 ring-slate-950">
                    {unreadChatCount > 9 ? '9+' : unreadChatCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-400" />
              ) : (
                <div className="relative">
                  <Menu className="w-5 h-5 text-slate-200" />
                  {unreadChatCount > 0 && !user && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-16 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-down Menu Content */}
          <div className="fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto glass-panel border-b border-slate-800 bg-slate-950/98 p-4 z-50 md:hidden animate-slide-up shadow-2xl space-y-4">
            {/* User Profile Card (if logged in) */}
            {user && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-850/80 border border-slate-800/80 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-emerald-500/20 shrink-0">
                      {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {profile?.name || user?.name || 'Creator'}
                      </p>
                      <p className="text-xs text-emerald-400 font-mono truncate">
                        {profile?.username ? `@${profile.username}` : user?.mobile || 'Verified'}
                      </p>
                    </div>
                  </div>
                  {profile?.username && (
                    <Link
                      to={`/p/${profile.username}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="ml-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center space-x-1 shrink-0"
                    >
                      <span>Public Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1.5">
              <Link
                to="/discover"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isActive('/discover')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Compass className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Discover</p>
                    <p className="text-xs text-slate-400">Explore creators & services</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              <Link
                to="/reels"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isActive('/reels')
                    ? 'bg-teal-500/10 border-teal-500/30 text-white'
                    : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    <Film className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="text-sm font-semibold">Reels</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        60s
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Short video portfolio feed</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              {user && (
                <Link
                  to="/messages"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive('/messages')
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Messages</p>
                      <p className="text-xs text-slate-400">Direct 1-on-1 client chat</p>
                    </div>
                  </div>
                  {unreadChatCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                      {unreadChatCount} new
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </Link>
              )}

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive('/dashboard')
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Creator Dashboard</p>
                      <p className="text-xs text-slate-400">Analytics, QR stand & settings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive('/admin')
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/50 border-slate-800/70 text-amber-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Shield className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Admin Portal</p>
                      <p className="text-xs text-slate-400">Platform moderation & metrics</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              )}
            </div>

            {/* Direct Mobile App APK Download Banner */}
            <div className="pt-1">
              <a
                href="https://expo.dev/artifacts/eas/NjnLkCez5bqVeS3Yfy9lvzQRjsKU_FM7Ljz_bEPm558.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="text-sm font-bold text-emerald-200">Download Mobile App</p>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        APK
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Direct Android build • 52MB</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <Download className="w-4 h-4" />
                </div>
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800/80">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-[0.99]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Get Started / Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
