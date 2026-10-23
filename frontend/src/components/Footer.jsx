import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">MyProfile Platform</p>
              <p className="text-xs text-slate-400">One Person, One Digital Identity.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-400">
            <Link to="/discover" className="hover:text-emerald-400 transition-colors">
              Privacy & Discovery
            </Link>
            <Link to="/reels" className="hover:text-emerald-400 transition-colors">
              Reels
            </Link>
            <a
              href="#safety"
              className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Safety Guidelines</span>
            </a>
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <span>Built with modern MERN architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
