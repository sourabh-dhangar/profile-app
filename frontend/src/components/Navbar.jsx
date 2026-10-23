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
  Sparkles,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                MyProfile
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/discover"
              className="flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Discover Creators & Businesses"
            >
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">Discover</span>
            </Link>

            <Link
              to="/reels"
              className="flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="60s Video Reels"
            >
              <Film className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="hidden md:inline">Reels</span>
            </Link>

            {/* Direct 1-on-1 Messages Link */}
            {user && (
              <Link
                to="/messages"
                className="relative flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Direct Messages & Chat"
              >
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-teal-300 shrink-0" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 ring-1 ring-slate-950">
                      {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">Messages</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
                title="Admin Control Panel"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5 pl-1.5 sm:pl-2 border-l border-slate-800">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                  title="Creator Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {profile?.username && (
                  <Link
                    to={`/p/${profile.username}`}
                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                    title="View My Public Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 sm:ml-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all whitespace-nowrap"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
