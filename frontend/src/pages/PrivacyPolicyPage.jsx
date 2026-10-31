import React from 'react';
import { Shield, Lock, Eye, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-200">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Privacy Policy & Data Safety</h1>
            <p className="text-xs sm:text-sm text-slate-400">Effective Date: October 31, 2026 • MyProfile Platform</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Welcome to <strong>MyProfile</strong> ("we", "our", or "us"). We provide an interactive creator and professional digital identity platform, including web applications and mobile apps built with Expo. This Privacy Policy outlines how your personal data, media, and profile details are collected, stored, processed, and safeguarded in full compliance with Google Play Developer Policies and global privacy standards.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        {/* 1. Information We Collect */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2.5 mb-3 text-emerald-400 font-bold text-base">
            <Eye className="w-5 h-5" />
            <h2>1. Information We Collect</h2>
          </div>
          <ul className="space-y-2 list-disc list-inside text-slate-300">
            <li><strong>Account & Authentication:</strong> Full name, verified email address, hashed passwords (bcrypt), and transient 6-digit OTP verification codes.</li>
            <li><strong>Profile Information:</strong> Professional category, bio, custom links, contact handles, and services offered.</li>
            <li><strong>User Media & Content:</strong> Profile photos/avatars, cover images, and short-form video reels uploaded by you via device gallery or camera.</li>
            <li><strong>Phone Number Privacy (Zero-Knowledge):</strong> Phone numbers entered for discovery are processed using one-way cryptographic SHA-256 HMAC hashing. Plaintext phone numbers are never stored in public databases or exposed in client responses.</li>
            <li><strong>Technical & App Diagnostics:</strong> Standard crash reports, device runtime version, and analytics to ensure app stability and video playback performance.</li>
          </ul>
        </section>

        {/* 2. Media & Permissions */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2.5 mb-3 text-teal-400 font-bold text-base">
            <Lock className="w-5 h-5" />
            <h2>2. Device Permissions (Camera & Media Storage)</h2>
          </div>
          <p className="text-slate-300 mb-2">
            Our mobile application requests device permissions strictly to facilitate user-initiated features:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-300">
            <li><strong>Photo Library / Gallery:</strong> Required to select images or short videos (under 60s) for your profile photo or reels showcase.</li>
            <li><strong>Camera:</strong> Optional permission to record or capture a profile photo or reel directly within the app.</li>
            <li>Media files are uploaded securely to our certified CDN partner (Cloudinary) over HTTPS TLS 1.3 encryption. We never access your photo library in the background.</li>
          </ul>
        </section>

        {/* 3. Data Protection & Security */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2.5 mb-3 text-cyan-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <h2>3. Security & Encryption Standards</h2>
          </div>
          <p className="text-slate-300">
            All data in transit between your mobile device, browser, and backend servers is encrypted using standard Transport Layer Security (TLS 1.2/1.3 / HTTPS). Passwords are cryptographically salted and hashed using bcrypt. Access tokens use signed JSON Web Tokens (JWT) with strict expiration periods.
          </p>
        </section>

        {/* 4. Third-Party Infrastructure */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-2">4. Third-Party Services</h2>
          <p className="text-slate-300 mb-2">
            To provide reliable cloud functionality, MyProfile interfaces with trusted enterprise service providers:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300">
            <li><strong>MongoDB Atlas:</strong> Encrypted database cluster hosting user account records and profile data.</li>
            <li><strong>Cloudinary CDN:</strong> Secure, optimized media streaming and image storage.</li>
            <li><strong>Nodemailer / Gmail SMTP:</strong> Secure delivery of transactional OTP authentication emails.</li>
            <li><strong>Expo EAS (Expo Application Services):</strong> Secure app updates and build distribution.</li>
          </ul>
        </section>

        {/* 5. User Rights & Account Deletion */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center space-x-2.5 mb-3 text-amber-400 font-bold text-base">
            <Trash2 className="w-5 h-5" />
            <h2>5. Account Deletion & Data Removal (Google Play Requirement)</h2>
          </div>
          <p className="text-slate-300 mb-3">
            In compliance with Google Play's User Data policy, users have full right to request complete deletion of their account, uploaded reels, profile data, and media records at any time.
          </p>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <p className="text-xs text-slate-300">
              <strong>How to Request Account Deletion:</strong>
            </p>
            <p className="text-xs text-slate-400">
              1. Inside the mobile or web app, navigate to <strong>Dashboard → Privacy & Settings → Delete Account</strong>, OR<br />
              2. Send an email to our Data Protection Officer at <a href="mailto:sourabhskd187@gmail.com" className="text-emerald-400 underline">sourabhskd187@gmail.com</a> with the subject line <em>"Account Deletion Request"</em> from your registered email address.
            </p>
            <p className="text-xs text-slate-400">
              Upon request verification, all associated records, uploaded media files, and authentication credentials will be permanently erased from our databases within 7 business days.
            </p>
          </div>
        </section>

        {/* 6. Contact Us */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2.5 mb-3 text-slate-200 font-bold text-base">
            <Mail className="w-5 h-5" />
            <h2>6. Developer & Privacy Contact</h2>
          </div>
          <p className="text-slate-300">
            For questions or concerns regarding this policy or your personal data, contact:
          </p>
          <div className="mt-2 text-xs text-slate-400 space-y-1">
            <p><strong className="text-white">Developer:</strong> Sourabh Kumar Dhangar</p>
            <p><strong className="text-white">Email:</strong> <a href="mailto:sourabhskd187@gmail.com" className="text-emerald-400">sourabhskd187@gmail.com</a></p>
            <p><strong className="text-white">Website:</strong> <a href="https://myprofile-official-web.vercel.app" className="text-emerald-400">https://myprofile-official-web.vercel.app</a></p>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <Link to="/" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
          ← Return to MyProfile Homepage
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

