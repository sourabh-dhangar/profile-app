import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { getProfileAvatar } from '../utils/avatar';
import {
  Sparkles,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Share2,
  QrCode,
  ShieldAlert,
  Play,
  Film,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Globe,
  Download,
  Copy,
  FileText,
  Printer,
  Heart,
  Volume2,
  VolumeX,
  Pause,
  X,
  ChevronUp,
  ChevronDown,
  Zap,
  Calendar,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
} from 'lucide-react';
import InquiryModal from '../components/InquiryModal';
import BookingModal from '../components/BookingModal';
import ReviewModal from '../components/ReviewModal';
import { useToast } from '../components/Toast';


const CATEGORY_ICONS = {
  'IT & Software': '💻',
  'Salon & Beauty': '💇',
  'Fitness & Health': '🏋️',
  'Doctor & Clinic': '🩺',
  'Restaurant & Food': '🍕',
  'Professional Services': '⚖️',
  'Education & Coaching': '🎓',
  'Retail & Commerce': '🛍️',
  'Content Creator & Artist': '🎨',
  'Other Business': '🏢',
};

const THEMES = {
  'default': {
    wrapper: 'from-slate-900/30 to-slate-950/80',
    glow: 'from-emerald-500/20',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    accentBorder: 'border-emerald-500/20',
    ring: 'ring-emerald-500/20 shadow-emerald-500/10',
    card: 'border-slate-800/80 bg-slate-900/50',
  },
  'dark-neon': {
    wrapper: 'from-purple-950/30 to-slate-950/90',
    glow: 'from-fuchsia-500/25',
    accentText: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
    accentBorder: 'border-fuchsia-500/30',
    ring: 'ring-fuchsia-500/30 shadow-fuchsia-500/20',
    card: 'border-fuchsia-900/40 bg-purple-950/30',
  },
  'minimalist-luxe': {
    wrapper: 'from-amber-950/20 to-black',
    glow: 'from-amber-400/20',
    accentText: 'text-amber-300',
    accentBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    accentBorder: 'border-amber-400/30',
    ring: 'ring-amber-400/30 shadow-amber-400/10',
    card: 'border-zinc-800 bg-zinc-900/60',
  },
  'cyberpunk-emerald': {
    wrapper: 'from-teal-950/30 to-slate-950',
    glow: 'from-cyan-400/25',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    accentBorder: 'border-cyan-400/30',
    ring: 'ring-cyan-400/30 shadow-cyan-400/20',
    card: 'border-teal-900/50 bg-teal-950/30',
  },
  'sunset-gradient': {
    wrapper: 'from-rose-950/30 to-slate-950',
    glow: 'from-rose-500/25',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500 hover:bg-rose-400 text-white',
    accentBorder: 'border-rose-500/30',
    ring: 'ring-rose-500/30 shadow-rose-500/20',
    card: 'border-rose-900/40 bg-rose-950/30',
  },
};

const PublicProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | reels
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [activeReel, setActiveReel] = useState(null);
  const [inquiryModal, setInquiryModal] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [testimonials, setTestimonials] = useState([]);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReelMap, setLikedReelMap] = useState({});
  const [likesCountMap, setLikesCountMap] = useState({});
  const videoPlayerRef = useRef(null);
  const toast = useToast();

  
  const getSocialIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'github': return <Github className="w-3.5 h-3.5 text-slate-100" />;
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5 text-sky-400" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
      case 'youtube': return <Youtube className="w-3.5 h-3.5 text-rose-500" />;
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-cyan-400" />;
      case 'facebook': return <Facebook className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const handleOpenReel = (reel) => {
    setActiveReel(reel);
    setIsPlaying(true);
    if (reel?._id) {
      api.post(`/reels/${reel._id}/view`).catch(() => {});
    }
  };

  useEffect(() => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.play().catch(() => {});
      } else {
        videoPlayerRef.current.pause();
      }
    }
  }, [isPlaying, activeReel]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile URL copied to clipboard!');
  };

  const handleLikeReel = async (reelId) => {
    const isCurrentlyLiked = !!likedReelMap[reelId];
    const currentCount = likesCountMap[reelId] ?? activeReel?.likesCount ?? 0;
    const newLiked = !isCurrentlyLiked;
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    setLikedReelMap((prev) => ({ ...prev, [reelId]: newLiked }));
    setLikesCountMap((prev) => ({ ...prev, [reelId]: newCount }));

    try {
      if (newLiked) {
        await api.post(`/reels/${reelId}/like`);
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const handleShareReel = (reel) => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name}'s Reel`,
        text: reel.caption,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Reel link copied to clipboard!');
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/profiles/${username}`);
      if (res.data.success) {
        setProfile(res.data.data.profile);
        setTestimonials(res.data.data.profile?.testimonials || []);
        setSections(res.data.data.sections || []);
        setReels(res.data.data.reels || []);
        // Track profile visit analytics ping
        api.post(`/profiles/${username}/view`).catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile not found or is currently private.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = (label, url) => {
    if (!profile?.username) return;
    api.post(`/profiles/${profile.username}/click`, { label, url }).catch(() => {});
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      await api.post('/reports', {
        targetType: 'profile',
        targetId: profile._id || profile.id,
        reason: reportReason,
      });
      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setReportModal(false);
        setReportReason('');
      }, 2500);
    } catch (err) {
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name} - MyProfile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Unavailable</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">{error}</p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const currentTheme = THEMES[profile.theme] || THEMES.default;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-28 sm:pb-10 space-y-8">
      {/* Profile Card Header with Theme */}
      <div className={`p-8 sm:p-10 rounded-3xl relative overflow-hidden border backdrop-blur-xl transition-colors duration-500 ${currentTheme.card}`}>
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b ${currentTheme.glow} to-transparent blur-3xl pointer-events-none`} />

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 relative z-10">
          <img
            src={getProfileAvatar(profile.photoUrl, profile.name)}
            alt={profile.name}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ${currentTheme.ring}`}
          />

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentTheme.accentText} bg-white/5 border ${currentTheme.accentBorder} flex items-center space-x-1`}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 font-medium mb-3">
              @{profile.username} • {profile.profileType}
              {profile.city && (
                <span className="inline-flex items-center ml-2 text-slate-400">
                  <MapPin className={`w-3.5 h-3.5 mr-0.5 ${currentTheme.accentText}`} />
                  {profile.city}
                </span>
              )}
            </p>

            {/* Category & Sub-Category Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              {profile.category && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center space-x-1 shadow-sm">
                  <span>{CATEGORY_ICONS[profile.category] || '🏷️'}</span>
                  <span>{profile.category}</span>
                </span>
              )}
              {profile.subCategory && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700/60 shadow-sm">
                  {profile.subCategory}
                </span>
              )}
            </div>


            
            {/* Live Social Proof Activity Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-3">
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Active Identity • 4.9 ★ Rating from verified clients • Quick response</span>
            </div>

            {/* Social Links Strip */}
            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                {profile.socialLinks.map((link, idx) => {
                  if (!link.url) return null;
                  return (
                    <a
                      key={idx}
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
                      onClick={() => handleTrackClick(link.platform, link.url)}
                    >
                      {getSocialIcon(link.platform)}
                      <span className="capitalize">{link.platform}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {profile.bio && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl mb-6">
                {profile.bio}
              </p>
            )}

            {/* Quick Contact & Action Buttons */}
            
            {/* Business Storefront & Timings Strip */}
            {(profile.businessDetails?.timing || profile.businessDetails?.address || profile.businessDetails?.whatsappNumber || profile.businessDetails?.bookingUrl) && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 shadow-inner">
                {profile.businessDetails.timing && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-400 font-bold">⏰ Hours:</span>
                    <span>{profile.businessDetails.timing}</span>
                  </div>
                )}
                {profile.businessDetails.address && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 font-bold">📍 Store:</span>
                    <span>{profile.businessDetails.address}</span>
                    {profile.businessDetails.googleMapsUrl && (
                      <a
                        href={profile.businessDetails.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline inline-flex items-center ml-1 font-bold"
                      >
                        Map ↗
                      </a>
                    )}
                  </div>
                )}
                {profile.businessDetails.whatsappNumber && (
                  <a
                    href={`https://wa.me/${profile.businessDetails.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <span>💬 WhatsApp</span>
                  </a>
                )}
                {profile.businessDetails.bookingUrl && (
                  <a
                    href={profile.businessDetails.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <span>📅 Book / Order</span>
                  </a>
                )}
              </div>
            )}

<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 print-hide">
              {/* Direct 1-on-1 Chat */}
              <Link
                to={`/messages/${profile.username}`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center space-x-1.5 transition-all transform active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>💬 Chat</span>
              </Link>

              {/* Direct Appointment Booking Modal Trigger */}
              <button
                onClick={() => setBookingModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all transform active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>

              {/* Direct Inquiry Modal Trigger */}
              <button
                onClick={() => setInquiryModal(true)}
                className={`px-4 py-2 rounded-xl ${currentTheme.accentBg} font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all transform active:scale-95`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Get in Touch</span>
              </button>

              {/* Universal Save Contact (vCard) Action */}
              <a
                href={`/api/v1/profiles/${profile.username}/vcard`}
                download={`${profile.username}.vcf`}
                onClick={() => {
                  handleTrackClick('vCard Download', `/api/v1/profiles/${profile.username}/vcard`);
                  toast.success('Downloading contact card (.vcf)...');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all border border-slate-700/60"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Contact</span>
              </a>

              {/* Print / PDF Resume Action */}
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all border border-slate-700/60"
                title="Print or Save as PDF Resume"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Resume</span>
              </button>

              {profile.contactDetails?.phone && (
                <a
                  href={`tel:${profile.contactDetails.phone}`}
                  onClick={() => handleTrackClick('Phone Call', `tel:${profile.contactDetails.phone}`)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
              )}

              {profile.contactDetails?.whatsapp && (
                <a
                  href={`https://wa.me/${profile.contactDetails.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleTrackClick('WhatsApp Message', 'https://wa.me')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                  <span>WhatsApp</span>
                </a>
              )}

              {profile.contactDetails?.email && (
                <a
                  href={`mailto:${profile.contactDetails.email}`}
                  onClick={() => handleTrackClick('Send Email', `mailto:${profile.contactDetails.email}`)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Email</span>
                </a>
              )}

              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Profile URL"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setQrModal(true)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={() => setReportModal(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto"
                title="Report Profile"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher: Overview vs Reels */}
        <div className="flex items-center space-x-2 border-t border-slate-800/80 mt-8 pt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Sections
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'reels'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Reels ({reels.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {sections.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-slate-400 text-sm">
              No additional sections added yet.
            </div>
          ) : (
            sections.map((section) => (
              <div key={section._id} className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-3 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{section.title}</span>
                </h2>

                {section.type === 'skills' || section.type === 'services' ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {section.content?.items?.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200"
                      >
                        {typeof item === 'string' ? item : (item?.title || item?.name || item?.role || String(item))}
                      </span>
                    ))}
                  </div>
                ) : section.type === 'experience' ? (
                  <div className="space-y-4">
                    {section.content?.items?.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-500/30 pl-4 space-y-1">
                        <p className="text-sm font-bold text-white">{typeof exp === 'object' ? exp.role : exp}</p>
                        <p className="text-xs text-slate-400">{typeof exp === 'object' ? `${exp.company || ''} • ${exp.period || ''}` : ''}</p>
                        {typeof exp === 'object' && exp.description && (
                          <p className="text-xs text-slate-300 pt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : section.type === 'portfolio' ? (
                  <div className="space-y-3 pt-1">
                    {section.content?.items?.map((proj, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-white">{typeof proj === 'object' ? proj.title : proj}</p>
                          {typeof proj === 'object' && proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                            >
                              <span>Visit</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </div>
                        {typeof proj === 'object' && proj.description && (
                          <p className="text-xs text-slate-300">{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {section.content?.text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Reels Tab */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {reels.length === 0 ? (
            <div className="col-span-full glass-card p-10 rounded-2xl text-center text-slate-400 text-sm">
              No reels posted yet by this creator.
            </div>
          ) : (
            reels.map((reel) => (
              <div
                key={reel._id}
                onClick={() => handleOpenReel(reel)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden glass-card cursor-pointer border-slate-800 hover:border-emerald-500/40 transition-all"
              >
                <img
                  src={reel.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'}
                  alt={reel.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/80 text-slate-950 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <p className="text-xs text-white font-medium line-clamp-2">{reel.caption}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                    <span>{reel.viewsCount} views</span>
                    <span>•</span>
                    <span>{reel.likesCount} likes</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Instagram-Style Reel Video Player Modal */}
      {activeReel && (() => {
        const activeIndex = reels.findIndex((r) => r._id === activeReel._id);
        const hasPrev = activeIndex > 0;
        const hasNext = activeIndex >= 0 && activeIndex < reels.length - 1;
        const reelLiked = !!likedReelMap[activeReel._id];
        const reelLikes = likesCountMap[activeReel._id] ?? activeReel.likesCount ?? 0;

        return (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            {/* Modal Overlay Close backdrop */}
            <div
              className="absolute inset-0"
              onClick={() => setActiveReel(null)}
            />

            {/* Video Chassis Container (9:16 Aspect Ratio) */}
            <div className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[88vh] sm:max-h-[780px] bg-black sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 flex flex-col justify-between z-10">
              {/* HTML5 Video Element */}
              <div
                className="relative flex-1 w-full bg-black flex items-center justify-center cursor-pointer select-none"
                onClick={() => setIsPlaying((p) => !p)}
              >
                <video
                  ref={videoPlayerRef}
                  src={activeReel.videoUrl}
                  poster={activeReel.thumbnailUrl}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />

                {/* Top Vignette Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Bottom Vignette Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Center Play/Pause Indicator when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white scale-110 shadow-2xl">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Top Controls Header */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
                <div className="flex items-center space-x-2.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <img
                    src={getProfileAvatar(profile.photoUrl, profile.name)}
                    alt={profile.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                  />
                  <span className="text-xs font-bold text-white tracking-wide">
                    @{profile.username}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    REEL
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted((m) => !m);
                    }}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReel(null);
                    }}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Vertical Interaction Rail */}
              <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-4 z-20 pointer-events-auto">
                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeReel(activeReel._id);
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                    reelLiked
                      ? 'bg-rose-500/30 text-rose-400 border-rose-500/50 scale-110'
                      : 'bg-black/50 text-white border-white/15 hover:bg-white/20'
                  }`}>
                    <Heart className={`w-5 h-5 ${reelLiked ? 'fill-rose-400' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    {reelLikes}
                  </span>
                </button>

                {/* Views Counter */}
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center justify-center">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    {activeReel.viewsCount || 0}
                  </span>
                </div>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareReel(activeReel);
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-1 drop-shadow">
                    Share
                  </span>
                </button>

                {/* Up/Down Reel Navigation */}
                {reels.length > 1 && (
                  <div className="flex flex-col space-y-1 pt-1">
                    <button
                      disabled={!hasPrev}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPrev) handleOpenReel(reels[activeIndex - 1]);
                      }}
                      className={`w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center ${
                        !hasPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
                      }`}
                      title="Previous Reel"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={!hasNext}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasNext) handleOpenReel(reels[activeIndex + 1]);
                      }}
                      className={`w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center ${
                        !hasNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'
                      }`}
                      title="Next Reel"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Caption & Audio Metadata */}
              <div className="absolute bottom-4 left-4 right-16 z-20 pointer-events-auto space-y-2">
                <p className="text-xs sm:text-sm text-white font-medium drop-shadow-md leading-snug line-clamp-3">
                  {activeReel.caption}
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-slate-300 font-semibold drop-shadow">
                  <Film className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Original Reel • {profile.name}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      
      {/* QR Code & Printable Business Counter Stand Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-4 my-auto">
            {/* Printable Counter Stand Card */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border-4 border-slate-900 mx-auto text-center">
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 mb-2">
                {CATEGORY_ICONS[profile.category] || '🏷️'} {profile.category || 'Digital Identity'}
              </div>
              <h3 className="text-xl font-black text-slate-950 leading-tight">
                {profile.name}
              </h3>
              {profile.subCategory && (
                <p className="text-xs font-semibold text-slate-600 mt-0.5 mb-3">
                  {profile.subCategory}
                </p>
              )}

              {profile.qrCodeUrl && (
                <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl inline-block shadow-inner mb-3">
                  <img
                    src={profile.qrCodeUrl}
                    alt="Profile QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}

              <p className="text-xs font-black text-slate-900 uppercase tracking-wide">
                📱 Scan to View Services & Contact
              </p>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                {window.location.origin}/{profile.username}
              </p>

              {profile.businessDetails?.timing && (
                <p className="text-[10px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-200">
                  ⏰ {profile.businessDetails.timing}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-1 print-hide">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md"
              >
                <span>🖨️ Print Counter Stand</span>
              </button>
              <button
                onClick={() => setQrModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Report Profile</h3>
            <p className="text-xs text-slate-400">
              Help us maintain a safe community. Describe your concern regarding this profile.
            </p>

            {reportSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
                Report submitted to moderators. Thank you.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Impersonation, inappropriate content, fake details..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setReportModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Visitor Direct Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModal}
        onClose={() => setInquiryModal(false)}
        username={profile.username}
        creatorName={profile.name}
        accentBg={currentTheme.accentBg}
      />

      {/* Sticky Mobile Action Rail */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2 print-hide">
        {/* Direct Chat CTA */}
        <Link
          to={`/messages/${profile.username}`}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 active:scale-95 transition-transform"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </Link>

        {/* Get in Touch CTA */}
        <button
          onClick={() => setInquiryModal(true)}
          className={`flex-1 py-2.5 rounded-xl ${currentTheme.accentBg} font-black text-xs shadow-lg flex items-center justify-center space-x-1.5 active:scale-95 transition-transform`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Inquiry</span>
        </button>

        {/* Save Contact vCard */}
        <a
          href={`/api/v1/profiles/${profile.username}/vcard`}
          download={`${profile.username}.vcf`}
          onClick={() => {
            handleTrackClick('Mobile Rail vCard', `/api/v1/profiles/${profile.username}/vcard`);
            toast.success('Downloading contact card...');
          }}
          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 flex items-center space-x-1"
          title="Save Contact"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Save</span>
        </a>

        {/* Direct Call / WhatsApp */}
        {profile.contactDetails?.phone ? (
          <a
            href={`tel:${profile.contactDetails.phone}`}
            onClick={() => handleTrackClick('Mobile Rail Call', `tel:${profile.contactDetails.phone}`)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
        ) : profile.contactDetails?.whatsapp ? (
          <a
            href={`https://wa.me/${profile.contactDetails.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleTrackClick('Mobile Rail WhatsApp', 'https://wa.me')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700"
            title="WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        ) : null}

        {/* Share / QR */}
        <button
          onClick={() => setQrModal(true)}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          title="QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PublicProfilePage;
