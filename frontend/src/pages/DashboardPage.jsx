import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  User,
  Camera,
  CheckCircle,
  AlertCircle,
  QrCode,
  Globe,
  Share2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lock,
  Sparkles,
  Video,
  Copy,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Palette,
  Eye,
  MousePointer,
  Inbox,
  MessageSquare,
  Check,
  Smartphone,
  X,
  Mail,
  Clock,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import MobileDeviceFrame from '../components/MobileDeviceFrame';

const DashboardPage = () => {
  const { user, profile, updateProfileState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [allowDiscovery, setAllowDiscovery] = useState(false);
  const toast = useToast();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [activeStudioTab, setActiveStudioTab] = useState('editor'); // 'editor', 'inquiries', 'analytics'
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalClicks: 0,
    recentViews: [],
    topLinks: [],
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    city: '',
    profileType: 'Personal',
    contactEmail: '',
    contactPhone: '',
    showEmail: false,
    showPhone: false,
    theme: 'default',
  });

  // Section modal state
  const [newSectionModal, setNewSectionModal] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    type: 'about',
    title: 'About Me',
    text: '',
    itemsString: '',
  });

  // Reel modal state
  const [reelModal, setReelModal] = useState(false);
  const [reelForm, setReelForm] = useState({
    videoUrl: '',
    caption: '',
    durationSeconds: 15,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [resProfile, resDiscovery, resAnalytics, resInquiries] = await Promise.all([
        api.get('/profiles/me'),
        api.get('/discovery/settings'),
        api.get('/profiles/me/analytics').catch(() => ({ data: { success: false } })),
        api.get('/profiles/me/inquiries').catch(() => ({ data: { success: false } })),
      ]);

      if (resProfile.data.success) {
        const p = resProfile.data.data.profile;
        setSections(resProfile.data.data.sections || []);
        updateProfileState(p);

        setFormData({
          name: p.name || '',
          username: p.username || '',
          bio: p.bio || '',
          city: p.city || '',
          profileType: p.profileType || 'Personal',
          contactEmail: p.contactDetails?.email || '',
          contactPhone: p.contactDetails?.phone || '',
          showEmail: !!p.contactDetails?.showEmail,
          showPhone: !!p.contactDetails?.showPhone,
          theme: p.theme || 'default',
        });
      }

      if (resDiscovery.data.success) {
        setAllowDiscovery(resDiscovery.data.data.allowDiscovery);
      }

      if (resAnalytics.data?.success) {
        setAnalytics(resAnalytics.data.data);
      }

      if (resInquiries.data?.success) {
        setInquiries(resInquiries.data.data.inquiries || []);
        setUnreadInquiries(resInquiries.data.data.unreadCount || 0);
      }
    } catch (err) {
      setErrorMsg('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (id, status) => {
    try {
      const res = await api.put(`/profiles/me/inquiries/${id}/status`, { status });
      if (res.data.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === id ? { ...inq, status } : inq))
        );
        setUnreadInquiries((prev) =>
          status === 'read' ? Math.max(prev - 1, 0) : prev + 1
        );
        toast.success(status === 'read' ? 'Inquiry marked as read' : 'Inquiry marked as unread');
      }
    } catch (err) {
      toast.error('Failed to update inquiry status');
    }
  };

  const handleThemeChange = async (newTheme) => {
    setFormData((prev) => ({ ...prev, theme: newTheme }));
    try {
      const res = await api.put('/profiles/me', { theme: newTheme });
      if (res.data.success) {
        updateProfileState(res.data.data);
        toast.success(`Theme updated to ${newTheme}!`);
      }
    } catch (err) {
      toast.error('Failed to update theme');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/profiles/me', {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        city: formData.city,
        profileType: formData.profileType,
        theme: formData.theme,
        contactDetails: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          showEmail: formData.showEmail,
          showPhone: formData.showPhone,
        },
      });

      if (res.data.success) {
        updateProfileState(res.data.data);
        setSuccessMsg('Profile details saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('photo', file);

    try {
      const res = await api.post('/profiles/me/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccessMsg('Photo updated successfully!');
        fetchProfileData();
      }
    } catch (err) {
      setErrorMsg('Failed to upload photo');
    }
  };

  const handleDiscoveryToggle = async (e) => {
    const val = e.target.checked;
    setAllowDiscovery(val);
    try {
      await api.put('/discovery/settings', { allowDiscovery: val });
      setSuccessMsg(val ? 'Phone discovery enabled' : 'Phone discovery disabled');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setAllowDiscovery(!val);
      setErrorMsg('Failed to update discovery setting');
    }
  };

  const handlePublish = async () => {
    try {
      const res = await api.post('/profiles/me/publish');
      if (res.data.success) {
        updateProfileState(res.data.data);
        setSuccessMsg('🎉 Your profile is now published and live!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish profile');
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const content =
        sectionForm.type === 'skills' || sectionForm.type === 'services'
          ? { items: sectionForm.itemsString.split(',').map((s) => s.trim()).filter(Boolean) }
          : { text: sectionForm.text };

      const res = await api.post('/profiles/me/sections', {
        type: sectionForm.type,
        title: sectionForm.title,
        content,
      });

      if (res.data.success) {
        setSections([...sections, res.data.data]);
        setNewSectionModal(false);
        setSectionForm({ type: 'about', title: 'About Me', text: '', itemsString: '' });
        fetchProfileData();
      }
    } catch (err) {
      setErrorMsg('Failed to add section');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await api.delete(`/profiles/me/sections/${id}`);
      setSections(sections.filter((s) => s._id !== id));
      fetchProfileData();
    } catch (err) {
      setErrorMsg('Failed to delete section');
    }
  };

  const handleMoveSection = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    setSections(reordered);

    const sectionOrders = reordered.map((s, idx) => ({ id: s._id, order: idx }));
    try {
      await api.put('/profiles/me/sections/reorder', { sectionOrders });
    } catch (err) {
      fetchProfileData();
    }
  };

  const handleCreateReel = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/reels', {
        videoUrl: reelForm.videoUrl,
        caption: reelForm.caption,
        durationSeconds: reelForm.durationSeconds,
      });

      if (res.data.success) {
        setSuccessMsg('Reel published successfully!');
        setReelModal(false);
        setReelForm({ videoUrl: '', caption: '', durationSeconds: 15 });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload reel');
    }
  };

  const profileUrl = `${window.location.origin}/p/${profile?.username || ''}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header with status & links */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="relative group">
            <img
              src={profile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={profile?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-emerald-500/30"
            />
            <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">{profile?.name || 'New Profile'}</h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  profile?.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {profile?.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">@{profile?.username} • {profile?.profileType}</p>
            <div className="flex items-center space-x-3 mt-3">
              <button
                onClick={copyProfileLink}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={`/p/${profile?.username}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                <span>Live View</span>
              </a>
              <button
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {profile?.status !== 'published' ? (
            <button
              onClick={handlePublish}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setReelModal(true)}
              className="px-5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-400 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
            >
              <Video className="w-4 h-4" />
              <span>Post Reel</span>
            </button>
          )}
        </div>
      </div>

      {/* Completion Meter */}
      <div className="glass-card p-6 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Profile Completion</span>
          <span className="text-sm font-bold text-emerald-400">{profile?.completionPercentage}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${profile?.completionPercentage || 20}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {profile?.completionPercentage < 50
            ? 'Add a bio, custom username, and at least 1 section to reach 50% and unlock public sharing.'
            : 'Looking sharp! Your profile has sufficient details for public discovery.'}
        </p>
      </div>

      {/* Creator Studio Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveStudioTab('editor')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStudioTab === 'editor'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Content</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('inquiries')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all whitespace-nowrap relative ${
              activeStudioTab === 'inquiries'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inquiries Inbox</span>
            {unreadInquiries > 0 && (
              <span
                className={`px-2 py-0.5 text-[11px] rounded-full font-black ${
                  activeStudioTab === 'inquiries'
                    ? 'bg-slate-950 text-emerald-400'
                    : 'bg-rose-500 text-white animate-pulse'
                }`}
              >
                {unreadInquiries}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('analytics')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStudioTab === 'analytics'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Visitor Analytics</span>
          </button>
        </div>

        {/* Mobile Preview Trigger Button (visible on screens < xl) */}
        <button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
          className="xl:hidden inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Smartphone className="w-4 h-4" />
          <span>Live Mobile Preview</span>
        </button>
      </div>

      {/* Notification banners */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: Profile & Content (Dual-Pane on Desktop) */}
      {activeStudioTab === 'editor' && (
        <div className="xl:grid xl:grid-cols-12 xl:gap-8 items-start">
          {/* Left Column: Editor Controls */}
          <div className="xl:col-span-7 space-y-8">
            {/* Core Info & Contact Form */}
            <form onSubmit={handleProfileSubmit} className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Username (Slug)</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Profile Type / Role</label>
                  <select
                    value={formData.profileType}
                    onChange={(e) => setFormData({ ...formData, profileType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Student">Student</option>
                    <option value="Sportsperson">Sportsperson</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Professional">Professional</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="ServiceProvider">Service Provider</option>
                    <option value="SmallBusiness">Small Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">City / Location</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Mumbai, India"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bio / Summary</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="A short punchy intro about your expertise and background..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-sm font-semibold text-white mb-4">Contact Privacy Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <p className="text-xs font-medium text-slate-200">Show Phone Number on Profile</p>
                      <p className="text-[11px] text-slate-500">Allow visitors to call or message you directly</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <p className="text-xs font-medium text-slate-200">Show Email Address</p>
                      <p className="text-[11px] text-slate-500">Display email contact button</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showEmail}
                      onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>

            {/* Visual Aesthetic Themes Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-5 border-slate-800">
              <div className="flex items-center space-x-3 text-fuchsia-400 border-b border-slate-800 pb-3">
                <Palette className="w-5 h-5" />
                <div>
                  <h3 className="text-base font-bold text-white">Visual Aesthetic Themes</h3>
                  <p className="text-xs text-slate-400">Curated styling applied to your public profile and live mobile viewer</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {[
                  { id: 'default', label: 'Dark Slate', desc: 'Emerald Neon', colors: 'from-slate-900 via-slate-800 to-emerald-950', ring: 'ring-emerald-500' },
                  { id: 'dark-neon', label: 'Dark Neon', desc: 'Fuchsia Glow', colors: 'from-purple-950 via-slate-900 to-fuchsia-950', ring: 'ring-fuchsia-500' },
                  { id: 'minimalist-luxe', label: 'Luxe Gold', desc: 'Amber Accent', colors: 'from-zinc-950 via-zinc-900 to-amber-950', ring: 'ring-amber-400' },
                  { id: 'cyberpunk-emerald', label: 'Cyberpunk', desc: 'Cyan / Teal', colors: 'from-teal-950 via-slate-950 to-cyan-950', ring: 'ring-cyan-400' },
                  { id: 'sunset-gradient', label: 'Sunset', desc: 'Rose Crimson', colors: 'from-rose-950 via-slate-950 to-orange-950', ring: 'ring-rose-500' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleThemeChange(th.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                      formData.theme === th.id
                        ? `border-emerald-400 ring-2 ${th.ring} bg-white/10 shadow-lg`
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${th.colors} mb-2 shadow-inner`} />
                    <div>
                      <span className="block text-xs font-bold text-white">{th.label}</span>
                      <span className="block text-[10px] text-slate-400">{th.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modular Profile Sections */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Modular Profile Sections</h2>
                  <p className="text-xs text-slate-400">Order, add, or remove custom blocks</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewSectionModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              {sections.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No custom sections yet. Add an About block or Skills list!
                </p>
              ) : (
                <div className="space-y-3">
                  {sections.map((sec, idx) => (
                    <div
                      key={sec._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">{sec.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                            {sec.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {sec.content?.text || (sec.content?.items && sec.content.items.join(', ')) || 'Custom content'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sections.length - 1}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec._id)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy & Quick Share Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4">
                <div className="flex items-center space-x-3 text-emerald-400">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">Phone Privacy</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When enabled, contacts with your phone number can discover your profile via the search bar.
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Allow Phone Discovery</span>
                  <input
                    type="checkbox"
                    checked={allowDiscovery}
                    onChange={handleDiscoveryToggle}
                    className="rounded text-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Protected by HMAC-SHA256 indexing. Plaintext numbers are never exposed.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border-slate-800 text-center space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Quick Share QR Code</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Scan from any phone camera</p>
                </div>
                {profile?.qrCodeUrl ? (
                  <img
                    src={profile.qrCodeUrl}
                    alt="Profile QR Code"
                    className="w-32 h-32 mx-auto rounded-xl p-2 bg-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500">
                    Publish profile to generate QR
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Open Fullscreen QR
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Live Smartphone Mockup (Desktop) */}
          <div className="hidden xl:block xl:col-span-5 sticky top-24">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-4 mb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Live Mobile Chassis</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Real-Time Sync
                </span>
              </div>
              <MobileDeviceFrame
                profile={{
                  ...profile,
                  ...formData,
                  contactDetails: {
                    email: formData.contactEmail,
                    phone: formData.contactPhone,
                    showEmail: formData.showEmail,
                    showPhone: formData.showPhone,
                  },
                }}
                sections={sections}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Inquiries Inbox */}
      {activeStudioTab === 'inquiries' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Direct Inquiries Inbox</h2>
                <p className="text-xs text-slate-400">Visitor messages and business inquiries sent from your public profile</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'all', label: 'All', count: inquiries.filter((i) => i.status !== 'archived').length },
                { id: 'unread', label: 'Unread', count: inquiries.filter((i) => i.status === 'unread').length },
                { id: 'read', label: 'Read', count: inquiries.filter((i) => i.status === 'read').length },
                { id: 'archived', label: 'Archived', count: inquiries.filter((i) => i.status === 'archived').length },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setInquiryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                    inquiryFilter === f.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      inquiryFilter === f.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Inquiries List */}
          {inquiries.filter((inq) => (inquiryFilter === 'all' ? inq.status !== 'archived' : inq.status === inquiryFilter)).length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No {inquiryFilter} inquiries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {inquiryFilter === 'unread'
                  ? 'Great job! You have cleared all your unread messages.'
                  : 'Visitors can contact you directly by clicking the "Get in Touch" button on your public profile.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries
                .filter((inq) => (inquiryFilter === 'all' ? inq.status !== 'archived' : inq.status === inquiryFilter))
                .map((inq) => (
                  <div
                    key={inq._id}
                    className={`p-5 rounded-2xl border transition-all ${
                      inq.status === 'unread'
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-900/50 border-slate-800/80 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            inq.status === 'unread'
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {inq.name?.charAt(0)?.toUpperCase() || 'V'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-white">{inq.name}</h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                inq.status === 'unread'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : inq.status === 'read'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{inq.email}</span>
                            </span>
                            {inq.phone && (
                              <span className="flex items-center space-x-1">
                                <Smartphone className="w-3 h-3 text-slate-500" />
                                <span>{inq.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {inq.subject && (
                      <div className="mt-3 text-xs font-semibold text-slate-200">
                        Subject: <span className="text-white font-normal">{inq.subject}</span>
                      </div>
                    )}

                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                      {inq.message}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-2">
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(
                          inq.subject || 'Inquiry on MyProfile'
                        )}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply by Email</span>
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateInquiryStatus(inq._id, inq.status === 'read' ? 'unread' : 'read')
                        }
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inq.status === 'read' ? 'Mark as Unread' : 'Mark as Read'}</span>
                      </button>

                      {inq.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateInquiryStatus(inq._id, 'archived')}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
                        >
                          <span>Archive</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Live Visitor Analytics */}
      {activeStudioTab === 'analytics' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Live Visitor Analytics</h2>
                <p className="text-xs text-slate-400">Real-time profile views and engagement metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Total Views:</span>
                <span className="font-bold text-white text-sm">{analytics.totalViews}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MousePointer className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Link Clicks:</span>
                <span className="font-bold text-white text-sm">{analytics.totalClicks}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Trend Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>7-Day View Trend</span>
              </span>
              <div className="flex items-end space-x-3 h-32 pt-4 pb-2 px-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                {analytics.recentViews?.map((item, idx) => {
                  const maxViews = Math.max(...(analytics.recentViews.map((v) => v.views) || [1]), 1);
                  const barHeight = Math.max((item.views / maxViews) * 100, 8);
                  const dayLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-emerald-400 mb-1">
                        {item.views}
                      </div>
                      <div
                        className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-500 hover:brightness-125"
                        style={{ height: `${barHeight}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Clicked Links */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300">Top Clicked Links</span>
              <div className="space-y-2 h-32 overflow-y-auto pr-1">
                {!analytics.topLinks || analytics.topLinks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-500">
                    No link clicks recorded yet
                  </div>
                ) : (
                  analytics.topLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 truncate max-w-[130px] font-medium">{link.label}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold">
                        {link.count} clicks
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {newSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white">Add Modular Section</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Section Type</label>
              <select
                value={sectionForm.type}
                onChange={(e) => setSectionForm({ ...sectionForm, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              >
                <option value="about">About / Narrative</option>
                <option value="skills">Skills & Tags</option>
                <option value="services">Services Offered</option>
                <option value="achievements">Achievements & Awards</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Section Title</label>
              <input
                type="text"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
            </div>

            {sectionForm.type === 'skills' || sectionForm.type === 'services' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Items (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, UI Design, AWS"
                  value={sectionForm.itemsString}
                  onChange={(e) => setSectionForm({ ...sectionForm, itemsString: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Text Content</label>
                <textarea
                  rows={4}
                  value={sectionForm.text}
                  onChange={(e) => setSectionForm({ ...sectionForm, text: e.target.value })}
                  placeholder="Describe your background or narrative..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setNewSectionModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Reel Modal */}
      {reelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white">Post Short-Form Reel</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Video URL (MP4 / WebM)</label>
              <input
                type="url"
                placeholder="https://... or sample video URL"
                value={reelForm.videoUrl}
                onChange={(e) => setReelForm({ ...reelForm, videoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Caption</label>
              <textarea
                rows={2}
                placeholder="Tell viewers what this reel is about..."
                value={reelForm.caption}
                onChange={(e) => setReelForm({ ...reelForm, caption: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Seconds, max 60)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={reelForm.durationSeconds}
                onChange={(e) => setReelForm({ ...reelForm, durationSeconds: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setReelModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateReel}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md"
              >
                Post Reel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Fullscreen Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6">
            <h3 className="text-xl font-bold text-white">{profile?.name}</h3>
            <p className="text-xs text-slate-400">Scan to view digital profile card</p>
            {profile?.qrCodeUrl && (
              <img
                src={profile.qrCodeUrl}
                alt="Profile QR Code"
                className="w-64 h-64 mx-auto rounded-2xl p-3 bg-white shadow-2xl"
              />
            )}
            <p className="text-xs font-mono text-emerald-400">{profileUrl}</p>
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Live Frame Modal (Screens < xl) */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-sm w-full flex flex-col items-center my-auto">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(false)}
              className="absolute -top-12 right-0 p-2 text-slate-300 hover:text-white rounded-full bg-slate-900/90 border border-slate-700 shadow-lg flex items-center justify-center"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <MobileDeviceFrame
              profile={{
                ...profile,
                ...formData,
                contactDetails: {
                  email: formData.contactEmail,
                  phone: formData.contactPhone,
                  showEmail: formData.showEmail,
                  showPhone: formData.showPhone,
                },
              }}
              sections={sections}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
