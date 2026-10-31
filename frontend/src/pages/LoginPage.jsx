import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

const PROFILE_TYPES = [
  'Creator',
  'Professional',
  'Freelancer',
  'Engineer',
  'Designer',
  'Student',
  'SmallBusiness',
  'ServiceProvider',
  'Businessman',
];

const LoginPage = () => {
  // Mode: 'signin' | 'register' | 'forgot'
  const [mode, setMode] = useState('signin');
  // Step for multi-step flows: 1 = email/details, 2 = OTP & password
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [profileType, setProfileType] = useState('Creator');
  const [otp, setOtp] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const switchMode = (newMode) => {
    resetMessages();
    setMode(newMode);
    setStep(1);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
  };

  // Helper: Autofill Admin credentials for instant review
  const handleFillAdmin = () => {
    resetMessages();
    setMode('signin');
    setEmail('admin@myprofile.com');
    setPassword('Admin@myprofile2026!');
  };

  // 1. Direct Email + Password Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setError('Please provide both email address and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        const { token, user, profile } = res.data.data;
        login(token, user, profile);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Request OTP for Registration
  const handleRegisterRequestOtp = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!ageConfirmed) {
      setError('You must confirm age verification or guardian consent');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/request-otp', {
        email: email.trim().toLowerCase(),
        name: name.trim(),
      });

      if (res.data.success) {
        setStep(2);
        setSuccessMsg(`Verification code sent to ${email.trim()}. Please check your email inbox.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP & Complete Registration
  const handleRegisterVerify = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
        name: name.trim(),
        profileType,
      });

      if (res.data.success) {
        const { token, user, profile } = res.data.data;
        login(token, user, profile);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Request OTP for Forgot Password
  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter your registered email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        setStep(2);
        setSuccessMsg(`Password reset code sent to ${email.trim()}. Please check your email inbox.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit reset code');
      return;
    }

    if (!password || password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: password,
      });

      if (res.data.success) {
        setMode('signin');
        setStep(1);
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setSuccessMsg('Password reset successfully! Please log in with your new password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            {mode === 'signin' && <Lock className="w-6 h-6" />}
            {mode === 'register' && (step === 1 ? <User className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />)}
            {mode === 'forgot' && <KeyRound className="w-6 h-6" />}
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'signin' && 'Sign in to MyProfile'}
            {mode === 'register' && (step === 1 ? 'Create Your Creator Profile' : 'Verify Email & Password')}
            {mode === 'forgot' && (step === 1 ? 'Reset Your Password' : 'Set New Password')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'signin' && 'Enter your email ID and password to access your dashboard'}
            {mode === 'register' && (step === 1 ? 'Get verified via email OTP and launch your digital identity' : `Code sent to ${email}`)}
            {mode === 'forgot' && (step === 1 ? 'Enter your registered email to receive a recovery code' : `Enter code sent to ${email}`)}
          </p>
        </div>

        {/* Mode Switcher Tabs (Only when on Step 1 of Signin or Register) */}
        {mode !== 'forgot' && step === 1 && (
          <div className="grid grid-cols-2 p-1 mb-6 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Alerts: Error, Success, Dev OTP */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-start gap-2">
            <span className="shrink-0 font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* -------------------- 1. SIGN IN FORM -------------------- */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Admin Quick Fill Pill */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleFillAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fill Super Admin (<code>admin@myprofile.com</code>)</span>
              </button>
            </div>
          </form>
        )}

        {/* -------------------- 2. REGISTER STEP 1 -------------------- */}
        {mode === 'register' && step === 1 && (
          <form onSubmit={handleRegisterRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Creator / Profile Role
              </label>
              <select
                value={profileType}
                onChange={(e) => setProfileType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {PROFILE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start space-x-2 pt-1">
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
                <span>Sending Code via Nodemailer...</span>
              ) : (
                <>
                  <span>Send Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* -------------------- 2. REGISTER STEP 2 (OTP & PASSWORD) -------------------- */}
        {mode === 'register' && step === 2 && (
          <form onSubmit={handleRegisterVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                6-Digit Email Verification Code
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono bg-transparent text-emerald-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Set Password (min. 6 characters)
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <span>Verifying & Setting Password...</span> : <span>Create Account & Publish</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-400 hover:text-white transition-colors text-center pt-1"
            >
              ← Change Email or Details
            </button>
          </form>
        )}

        {/* -------------------- 3. FORGOT PASSWORD STEP 1 -------------------- */}
        {mode === 'forgot' && step === 1 && (
          <form onSubmit={handleForgotRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Reset Code...</span>
              ) : (
                <>
                  <span>Send Recovery OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}

        {/* -------------------- 3. FORGOT PASSWORD STEP 2 (RESET) -------------------- */}
        {mode === 'forgot' && step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                6-Digit Recovery Code
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono bg-transparent text-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                New Password (min. 6 characters)
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative rounded-xl border border-slate-700 bg-slate-900 focus-within:border-emerald-500 transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <span>Resetting Password...</span> : <span>Confirm & Reset Password</span>}
            </button>

            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel & Back to Sign In</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
