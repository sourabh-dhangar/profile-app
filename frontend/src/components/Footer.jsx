import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Smartphone, Download, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800/80 text-left">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <p className="text-base font-extrabold text-white">MyProfile Platform</p>
                <p className="text-xs text-emerald-400 font-semibold">One Person, One Verified Digital Identity.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Replace outdated paper visiting cards with interactive digital portfolios, 1-on-1 direct client chat, tabletop acrylic QR stands, and service rate cards for every modern trade.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/discover" className="hover:text-emerald-400 transition-colors">
                  Discover Creators & Pros
                </Link>
              </li>
              <li>
                <Link to="/reels" className="hover:text-teal-400 transition-colors">
                  60s Video Reels
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Create Free Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile App & Expo */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App (Expo)</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://expo.dev/artifacts/eas/HGuyumyw8sYrP43V-wsN8BjrZrVpZurcNlqPCSr96ro.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-emerald-300 font-bold hover:text-emerald-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Android APK (Latest v2.2)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://expo.dev/accounts/sourabh-dhangar/projects/myprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Expo Project Hub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://expo.dev/accounts/sourabh-dhangar/projects/myprofile/builds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>EAS Cloud Builds</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MyProfile. Cryptographic Anti-Scraping Phone Guard & Tabletop QR enabled.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </span>
            <span>OTA Channel: production (v1.0.0)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
