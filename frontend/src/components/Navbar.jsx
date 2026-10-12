import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Compass,
  Film,
  Shield,
  LogOut,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                MyProfile
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            <Link
              to="/discover"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Discover</span>
            </Link>

            <Link
              to="/reels"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Film className="w-4 h-4 text-teal-400" />
              <span>Reels</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {profile?.username && (
                  <Link
                    to={`/p/${profile.username}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                    title="View My Public Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
