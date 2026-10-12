import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Smartphone, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [step, setStep] = useState(1); // 1 = mobile, 2 = otp
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!ageConfirmed) {
      setError('You must confirm age verification or guardian consent');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', {
        mobile: cleanMobile,
        countryCode,
      });

      if (res.data.success) {
        setStep(2);
        if (res.data.data?.devOtp) {
          setDevOtpHint(res.data.data.devOtp);
          setOtp(res.data.data.devOtp); // pre-fill in dev mode for maximum convenience
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        mobile: mobile.replace(/[^0-9]/g, ''),
        otp,
        countryCode,
      });

      if (res.data.success) {
        const { token, user, profile } = res.data.data;
        login(token, user, profile);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please check and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            {step === 1 ? <Smartphone className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {step === 1 ? 'Sign in with Mobile' : 'Enter OTP Verification'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {step === 1
              ? 'No password needed. We will send a secure one-time code.'
              : `Code sent to ${countryCode} ${mobile}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Mobile Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-800 px-3 text-sm text-slate-300 border-r border-slate-700 focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <input
                id="age-consent"
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 rounded text-emerald-500 focus:ring-emerald-500/30"
              />
              <label htmlFor="age-consent" className="text-xs text-slate-400 leading-tight">
                I confirm I am 18+ or have guardian consent to create a profile.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">
                Demo helper: Any phone number works in dev mode. OTP is <code className="text-emerald-400">123456</code>.
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
              {devOtpHint && (
                <p className="mt-2 text-xs text-emerald-400 text-center font-mono">
                  Dev Mode Hint: OTP is {devOtpHint}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <span>Verifying...</span> : <span>Verify & Continue</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
