import React, { useState } from 'react';
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
  UserCheck
} from 'lucide-react';

const DiscoveryPage = () => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setResult(null);
    setSearched(true);

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/discovery/search-by-phone', {
        phone: clean,
        countryCode,
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMessage('Rate limit reached: Maximum 5 phone searches per minute for privacy protection.');
      } else {
        setErrorMessage('No discoverable profile found for this phone number.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy-Preserving Contact Lookup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Find Profile by Phone</h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Look up colleagues or friends who have registered and enabled phone discovery.
        </p>
      </div>

      {/* Search Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
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
              disabled={loading}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
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
      {result && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border-emerald-500/40 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img
              src={result.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={result.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/40"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white">{result.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                  {result.profileType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">@{result.username} • {result.city}</p>
              {result.bio && (
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 max-w-md">{result.bio}</p>
              )}
            </div>
          </div>

          <Link
            to={`/p/${result.username}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>View Full Profile</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Error / Not Found Message */}
      {errorMessage && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2 animate-fade-in">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Match</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
