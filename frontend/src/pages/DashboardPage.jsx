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
  Layers,
  Shield,
  Wand2,
  ShieldAlert,
  Play,
  Heart,
  Download,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import MobileDeviceFrame from '../components/MobileDeviceFrame';

const DashboardPage = () => {
  const { user, profile, updateProfileState, logout } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [myReels, setMyReels] = useState([]);
  const [allowDiscovery, setAllowDiscovery] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Studio Tab: 'profile' | 'sections' | 'reels' | 'privacy' | 'inquiries' | 'analytics'
  const [activeStudioTab, setActiveStudioTab] = useState('profile');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [inquiryFilter, setInquiryFilter] = useState('all');

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
    category: 'IT & Software',
    subCategory: '',
    timing: '',
    address: '',
    googleMapsUrl: '',
    whatsappNumber: '',
    bookingUrl: '',
    contactEmail: '',
    contactPhone: '',
    showEmail: false,
    showPhone: false,
    theme: 'default',
    github: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    twitter: '',
    website: '',
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
    visibility: 'public',
  });

  // AI Bio Helper State
  const [aiBioModal, setAiBioModal] = useState(false);
  const [aiBioTone, setAiBioTone] = useState('professional');
  const [aiBioKeywords, setAiBioKeywords] = useState('');
  const [aiBioSuggestions, setAiBioSuggestions] = useState([]);
  const [aiBioLoading, setAiBioLoading] = useState(false);

  // AI Caption Helper State
  const [aiCaptionModal, setAiCaptionModal] = useState(false);
  const [aiCaptionTopic, setAiCaptionTopic] = useState('');
  const [aiCaptionTone, setAiCaptionTone] = useState('engaging');
  const [aiCaptionSuggestions, setAiCaptionSuggestions] = useState([]);
  const [aiCaptionLoading, setAiCaptionLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [resProfile, resDiscovery, resAnalytics, resInquiries, resReels] = await Promise.all([
        api.get('/profiles/me'),
        api.get('/discovery/settings'),
        api.get('/profiles/me/analytics').catch(() => ({ data: { success: false } })),
        api.get('/profiles/me/inquiries').catch(() => ({ data: { success: false } })),
        api.get('/reels/my-reels').catch(() => ({ data: { success: false } })),
      ]);

      if (resProfile.data?.success) {
        const p = resProfile.data.data.profile;
        setSections(resProfile.data.data.sections || []);
        updateProfileState(p);

        setFormData({
          name: p.name || '',
          username: p.username || '',
          bio: p.bio || '',
          city: p.city || '',
          profileType: p.profileType || 'Personal',
          category: p.category || 'IT & Software',
          subCategory: p.subCategory || '',
          timing: p.businessDetails?.timing || '',
          address: p.businessDetails?.address || '',
          googleMapsUrl: p.businessDetails?.googleMapsUrl || '',
          whatsappNumber: p.businessDetails?.whatsappNumber || '',
          bookingUrl: p.businessDetails?.bookingUrl || '',
          contactEmail: p.contactDetails?.email || '',
          contactPhone: p.contactDetails?.phone || '',
          showEmail: !!p.contactDetails?.showEmail,
          showPhone: !!p.contactDetails?.showPhone,
          theme: p.theme || 'default',
          github: p.socialLinks?.find((s) => s.platform === 'github')?.url || '',
          linkedin: p.socialLinks?.find((s) => s.platform === 'linkedin')?.url || '',
          instagram: p.socialLinks?.find((s) => s.platform === 'instagram')?.url || '',
          youtube: p.socialLinks?.find((s) => s.platform === 'youtube')?.url || '',
          twitter: p.socialLinks?.find((s) => s.platform === 'twitter')?.url || '',
          website: p.socialLinks?.find((s) => s.platform === 'website')?.url || '',
        });
      }

      if (resDiscovery.data?.success) {
        setAllowDiscovery(resDiscovery.data.data.allowDiscovery);
      }

      if (resAnalytics.data?.success) {
        setAnalytics(resAnalytics.data.data);
      }

      if (resInquiries.data?.success) {
        setInquiries(resInquiries.data.data.inquiries || []);
        setUnreadInquiries(resInquiries.data.data.unreadCount || 0);
      }

      if (resReels.data?.success) {
        setMyReels(resReels.data.data.reels || []);
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
      if (res.data?.success) {
        setInquiries((prev) =>
          prev.map((i) => (i._id === id ? { ...i, status } : i))
        );
        if (status === 'read') {
          setUnreadInquiries((c) => Math.max(0, c - 1));
        }
        toast.success(`Inquiry marked as ${status}`);
      }
    } catch (err) {
      toast.error('Failed to update inquiry status');
    }
  };

  const handleExportInquiriesCSV = () => {
    if (!inquiries || inquiries.length === 0) {
      toast.error('No inquiries available to export');
      return;
    }
    const headers = ['Date', 'Sender Name', 'Sender Email', 'Sender Phone', 'Subject', 'Status', 'Message'];
    const rows = inquiries.map((inq) => [
      `"${new Date(inq.createdAt || Date.now()).toLocaleDateString()}"`,
      `"${(inq.senderName || '').replace(/"/g, '""')}"`,
      `"${(inq.senderEmail || '').replace(/"/g, '""')}"`,
      `"${(inq.senderPhone || '').replace(/"/g, '""')}"`,
      `"${(inq.subject || 'General Inquiry').replace(/"/g, '""')}"`,
      `"${inq.status || 'unread'}"`,
      `"${(inq.message || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${profile?.username || 'business'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads CSV exported successfully!');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      
      const socialLinks = [
        { platform: 'github', url: formData.github },
        { platform: 'linkedin', url: formData.linkedin },
        { platform: 'instagram', url: formData.instagram },
        { platform: 'youtube', url: formData.youtube },
        { platform: 'twitter', url: formData.twitter },
        { platform: 'website', url: formData.website },
      ].filter((s) => s.url && s.url.trim().length > 0);
  
      const res = await api.put('/profiles/me', {
        socialLinks,
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        city: formData.city,
        profileType: formData.profileType,
        category: formData.category,
        subCategory: formData.subCategory,
        businessDetails: {
          timing: formData.timing,
          address: formData.address,
          googleMapsUrl: formData.googleMapsUrl,
          whatsappNumber: formData.whatsappNumber,
          bookingUrl: formData.bookingUrl,
        },
        theme: formData.theme,
        contactDetails: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          showEmail: formData.showEmail,
          showPhone: formData.showPhone,
        },
      });

      if (res.data?.success) {
        updateProfileState(res.data.data);
        setSuccessMsg('Profile details saved successfully!');
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (themeId) => {
    setFormData((prev) => ({ ...prev, theme: themeId }));
    try {
      const res = await api.put('/profiles/me', { theme: themeId });
      if (res.data?.success) {
        updateProfileState(res.data.data);
        toast.success(`Theme updated to ${themeId}`);
      }
    } catch (err) {
      toast.error('Failed to change theme');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('photo', file);

    try {
      const res = await api.post('/profiles/me/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        updateProfileState({ ...profile, photoUrl: res.data.data.photoUrl });
        toast.success('Profile photo uploaded!');
      }
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  const handleDiscoveryToggle = async (e) => {
    const nextVal = e.target.checked;
    setAllowDiscovery(nextVal);
    try {
      await api.put('/discovery/settings', { allowDiscovery: nextVal });
      toast.success(nextVal ? 'Phone discovery enabled' : 'Phone discovery disabled');
    } catch (err) {
      setAllowDiscovery(!nextVal);
      toast.error('Failed to update discovery settings');
    }
  };

  const handlePublishToggle = async () => {
    try {
      if (profile?.status === 'published') {
        const res = await api.put('/profiles/me', { status: 'draft' });
        if (res.data?.success) {
          updateProfileState({ ...profile, status: 'draft' });
          toast.info('Profile unpublished (Draft mode)');
        }
      } else {
        const res = await api.post('/profiles/me/publish');
        if (res.data?.success) {
          updateProfileState(res.data.data);
          toast.success('🎉 Your profile is now published and live!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle publish status');
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

      if (res.data?.success) {
        setSections([...sections, res.data.data]);
        setNewSectionModal(false);
        setSectionForm({ type: 'about', title: 'About Me', text: '', itemsString: '' });
        toast.success('Section added successfully!');
        fetchProfileData();
      }
    } catch (err) {
      toast.error('Failed to add section');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await api.delete(`/profiles/me/sections/${id}`);
      setSections(sections.filter((s) => s._id !== id));
      toast.success('Section deleted');
      fetchProfileData();
    } catch (err) {
      toast.error('Failed to delete section');
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
        visibility: reelForm.visibility,
      });

      if (res.data?.success) {
        toast.success('Reel published successfully!');
        setReelModal(false);
        setReelForm({ videoUrl: '', caption: '', durationSeconds: 15, visibility: 'public' });
        // Refresh my reels
        const reelsRes = await api.get('/reels/my-reels');
        if (reelsRes.data?.success) {
          setMyReels(reelsRes.data.data.reels || []);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reel');
    }
  };

  const handleUpdateReelVisibility = async (reelId, visibility) => {
    try {
      const res = await api.put(`/reels/${reelId}/visibility`, { visibility });
      if (res.data?.success) {
        setMyReels((prev) =>
          prev.map((r) => (r._id === reelId ? { ...r, visibility } : r))
        );
        toast.success(`Reel visibility updated to ${visibility}`);
      }
    } catch (err) {
      toast.error('Failed to update reel visibility');
    }
  };

  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Delete this reel permanently?')) return;
    try {
      const res = await api.delete(`/reels/${reelId}`);
      if (res.data?.success) {
        setMyReels((prev) => prev.filter((r) => r._id !== reelId));
        toast.success('Reel deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete reel');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        '⚠️ DANGER ZONE: Are you sure you want to delete your profile and deactivate your account? All sections, reels, and inquiries will be permanently removed.'
      )
    ) {
      return;
    }

    try {
      const res = await api.delete('/profiles/me/account');
      if (res.data?.success) {
        toast.success('Account deactivated and data deleted');
        if (logout) logout();
        window.location.href = '/login';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate account');
    }
  };

  // AI Helpers
  const handleGenerateAiBio = async () => {
    setAiBioLoading(true);
    try {
      const res = await api.post('/ai/generate-bio', {
        profession: formData.profileType || 'Creator',
        tone: aiBioTone,
        keywords: aiBioKeywords.split(',').map((s) => s.trim()).filter(Boolean),
        currentBio: formData.bio,
      });

      if (res.data?.success) {
        setAiBioSuggestions(res.data.data.suggestions || []);
        toast.success('AI Bios generated!');
      }
    } catch (err) {
      toast.error('Failed to generate AI bio suggestions');
    } finally {
      setAiBioLoading(false);
    }
  };

  const handleGenerateAiCaption = async () => {
    setAiCaptionLoading(true);
    try {
      const res = await api.post('/ai/generate-caption', {
        topic: aiCaptionTopic || `${formData.name || 'Creator'} showcase`,
        tone: aiCaptionTone,
      });

      if (res.data?.success) {
        setAiCaptionSuggestions(res.data.data.suggestions || []);
        toast.success('AI Captions generated!');
      }
    } catch (err) {
      toast.error('Failed to generate AI captions');
    } finally {
      setAiCaptionLoading(false);
    }
  };

  const profileUrl = `${window.location.origin}/${profile?.username || ''}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    toast.success('Profile URL copied!');
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 border border-slate-800">
        <div className="flex items-center space-x-4 sm:space-x-5">
          <div className="relative group shrink-0">
            <img
              src={
                profile?.photoUrl ||
                'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256'
              }
              alt="Profile"
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30"
            />
            <label className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-2xl font-bold text-white">{profile?.name || 'Creator'}</h1>
              <span
                className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  profile?.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {profile?.status || 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">@{profile?.username}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          <button
            onClick={copyProfileLink}
            className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1.5 transition-colors text-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </a>

          <button
            onClick={handlePublishToggle}
            className={`col-span-2 sm:col-span-1 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center ${
              profile?.status === 'published'
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
            }`}
          >
            {profile?.status === 'published' ? 'Unpublish' : 'Publish Profile'}
          </button>
        </div>
      </div>

      {/* Completion Gauge Strip */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Profile Strength & Completion</span>
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            {profile?.completionPercentage || 0}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${profile?.completionPercentage || 0}%` }}
          />
        </div>
      </div>

      {/* MODULAR DASHBOARD STUDIO TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4">
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none scroll-smooth">
          {/* Tab 1: Profile & Bio */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('profile')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeStudioTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Bio</span>
          </button>

          {/* Tab 2: Section Builder */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('sections')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeStudioTab === 'sections'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sections ({sections.length})</span>
          </button>

          {/* Tab 3: Reels Studio */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('reels')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeStudioTab === 'reels'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Reels ({myReels.length})</span>
          </button>

          {/* Tab 4: Privacy Hub */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('privacy')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeStudioTab === 'privacy'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>

          {/* Tab 5: Leads / Inquiries */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('inquiries')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 relative ${
              activeStudioTab === 'inquiries'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Leads</span>
            {unreadInquiries > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
                {unreadInquiries}
              </span>
            )}
          </button>

          {/* Tab 6: Analytics */}
          <button
            type="button"
            onClick={() => setActiveStudioTab('analytics')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeStudioTab === 'analytics'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Mobile Preview Trigger Button (visible on screens < xl) */}
        <button
          type="button"
          onClick={() => setMobilePreviewOpen(true)}
          className="xl:hidden inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold hover:bg-slate-800 transition-colors shadow shrink-0 w-full sm:w-auto"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Live Mobile Preview</span>
        </button>
      </div>

      {/* Main Studio Dual-Pane Layout */}
      <div className="xl:grid xl:grid-cols-12 xl:gap-8 items-start">
        {/* Left Column: Active Modular Tab Content */}
        <div className="xl:col-span-7 space-y-6">
          {/* TAB 1: Profile & Bio Studio */}
          {activeStudioTab === 'profile' && (
            <div className="space-y-6">
              <form onSubmit={handleProfileSubmit} className="glass-card p-6 sm:p-8 rounded-2xl space-y-5 border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>Identity & Bio Details</span>
                  </h2>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Username (Vanity Slug)</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Role / Profession</label>
                    <select
                      value={formData.profileType}
                      onChange={(e) => setFormData({ ...formData, profileType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai, India"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {/* Universal Business Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Business & Industry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-semibold text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="IT & Software">💻 IT & Software / Freelancer</option>
                      <option value="Salon & Beauty">💇 Salon, Spa & Beauty Lounge</option>
                      <option value="Fitness & Health">🏋️ Gym, Fitness & Personal Trainer</option>
                      <option value="Doctor & Clinic">🩺 Doctor, Clinic & Healthcare</option>
                      <option value="Restaurant & Food">🍕 Restaurant, Cafe & Bakery</option>
                      <option value="Professional Services">⚖️ Lawyer, CA & Consultant</option>
                      <option value="Education & Coaching">🎓 Teacher & Coaching Academy</option>
                      <option value="Retail & Commerce">🛍️ Retail Store & Boutique</option>
                      <option value="Content Creator & Artist">🎨 Content Creator & Digital Artist</option>
                      <option value="Other Business">🏢 Other Business / Enterprise</option>
                    </select>
                  </div>

                  {/* Sub-Category / Specialization Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Sub-Category / Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      placeholder={
                        formData.category === 'Salon & Beauty'
                          ? 'e.g. Bridal Hair & Spa Lounge'
                          : formData.category === 'IT & Software'
                          ? 'e.g. Cloud Solutions & Full Stack Engineer'
                          : formData.category === 'Doctor & Clinic'
                          ? 'e.g. Consultant Dermatologist'
                          : 'e.g. Main specialty or service'
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Business Storefront & Location Details Strip */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                      <span>🏪</span>
                      <span>Storefront, Timings & Quick Contact</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Visible on public profile & QR stand</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        ⏰ Working Hours / Timings
                      </label>
                      <input
                        type="text"
                        value={formData.timing}
                        onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                        placeholder="e.g. Mon - Sat: 10:00 AM - 8:30 PM"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        💬 WhatsApp Business Direct Chat
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        📍 Store / Office Physical Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g. Linking Road, Bandra West, Mumbai"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        📅 Direct Booking / Appointment URL
                      </label>
                      <input
                        type="url"
                        value={formData.bookingUrl}
                        onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                        placeholder="e.g. https://calendly.com/... or Google Form"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                </div>


                {/* Social Media & Portfolio Links Section */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>🔗</span>
                      <span>Social Media & Portfolio Links</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Displayed on your public profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        💼 LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        💻 GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        📸 Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="https://instagram.com/username"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        🎥 YouTube Channel URL
                      </label>
                      <input
                        type="url"
                        value={formData.youtube}
                        onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                        placeholder="https://youtube.com/@channel"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        🐦 X / Twitter URL
                      </label>
                      <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="https://x.com/username"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        🌐 Personal Website / Portfolio
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yourbrand.com"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio Section with Prominent AI Helper */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-400">Bio / Summary</label>
                    <button
                      type="button"
                      onClick={() => setAiBioModal(true)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold transition-all shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>✨ AI Bio Helper</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short punchy intro about your expertise, craft, or business..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>
              </form>

              {/* Aesthetic Visual Theme Picker */}
              <div className="glass-card p-6 rounded-2xl space-y-4 border-slate-800">
                <div className="flex items-center space-x-2 text-fuchsia-400 border-b border-slate-800 pb-2">
                  <Palette className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-white">Visual Aesthetic Themes</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'default', label: 'Dark Slate', desc: 'Emerald Neon', colors: 'from-slate-900 to-emerald-950' },
                    { id: 'dark-neon', label: 'Dark Neon', desc: 'Fuchsia Glow', colors: 'from-purple-950 to-fuchsia-950' },
                    { id: 'minimalist-luxe', label: 'Luxe Gold', desc: 'Amber Accent', colors: 'from-zinc-950 to-amber-950' },
                    { id: 'cyberpunk-emerald', label: 'Cyberpunk', desc: 'Cyan / Teal', colors: 'from-teal-950 to-cyan-950' },
                    { id: 'sunset-gradient', label: 'Sunset', desc: 'Rose Crimson', colors: 'from-rose-950 to-orange-950' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => handleThemeChange(th.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                        formData.theme === th.id
                          ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-white/10 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${th.colors} mb-1.5`} />
                      <div>
                        <span className="block text-[11px] font-bold text-white">{th.label}</span>
                        <span className="block text-[9px] text-slate-400">{th.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Section Builder */}
          {activeStudioTab === 'sections' && (
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-5 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Modular Profile Sections</span>
                  </h2>
                  <p className="text-xs text-slate-400">Add customizable sections displayed on your public identity page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewSectionModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
                  <Layers className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-300">No Custom Sections Yet</p>
                  <p className="text-[11px] text-slate-500">
                    Add Skills & Stacks, Work Experience, Education, or Services to stand out!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((sec, idx) => (
                    <div
                      key={sec._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{sec.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                            {sec.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {sec.content?.text || (sec.content?.items && Array.isArray(sec.content.items) && sec.content.items.map(it => typeof it === 'string' ? it : (it?.title || it?.role || it?.name || 'Item')).join(', ')) || 'Custom content'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 1)}
                          disabled={idx === sections.length - 1}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec._id)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reels Studio */}
          {activeStudioTab === 'reels' && (
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>My Reels Studio</span>
                  </h2>
                  <p className="text-xs text-slate-400">Manage short-form video showcases and visibility controls</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReelModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Reel</span>
                </button>
              </div>

              {myReels.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
                  <Video className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-300">No Reels Uploaded Yet</p>
                  <p className="text-[11px] text-slate-500">
                    Upload short clips (under 60s) showcasing your projects, speech, or portfolio!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myReels.map((reel) => (
                    <div
                      key={reel._id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-24 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                          <img
                            src={reel.thumbnailUrl || reel.videoUrl}
                            alt={reel.caption}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white line-clamp-2">{reel.caption || 'Untitled Reel'}</p>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-2 font-mono">
                            <span>{reel.viewsCount || 0} views</span>
                            <span>•</span>
                            <span>{reel.likesCount || 0} likes</span>
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-bold text-slate-400">
                            ⏱️ {reel.durationSeconds || 15}s
                          </span>
                        </div>
                      </div>

                      {/* Granular Visibility & Delete controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="flex items-center space-x-1.5">
                          <label className="text-[10px] text-slate-400 font-semibold">Visibility:</label>
                          <select
                            value={reel.visibility || 'public'}
                            onChange={(e) => handleUpdateReelVisibility(reel._id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-[10px] font-bold"
                          >
                            <option value="public">Public (Feed & Profile)</option>
                            <option value="profile-only">Profile Only</option>
                            <option value="private">Private (Owner Only)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReel(reel._id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors"
                          title="Delete Reel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Privacy Hub */}
          {activeStudioTab === 'privacy' && (
            <div className="space-y-6">
              {/* Phone Discovery & Privacy Settings */}
              <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800 pb-2">
                  <Shield className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-white">Discovery & Search Privacy</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When enabled, visitors who already possess your exact mobile number can look up your minimal profile preview. Unlisted phone numbers never disclose registration status.
                </p>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">Allow Mobile Discovery</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Indexed via salted HMAC-SHA256 cryptographic hashes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowDiscovery}
                    onChange={handleDiscoveryToggle}
                    className="rounded text-emerald-500 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Contact Information Visibility Hub */}
              <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 border-slate-800">
                <div className="flex items-center space-x-2 text-cyan-400 border-b border-slate-800 pb-2">
                  <Lock className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-white">Contact Visibility Toggles</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-white">Show Mobile Number on Profile</p>
                      <p className="text-[10px] text-slate-400">Allows visitors to trigger direct phone calls</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-white">Show Email Address</p>
                      <p className="text-[10px] text-slate-400">Renders mailto button on public card</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showEmail}
                      onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProfileSubmit}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  Save Privacy Preferences
                </button>
              </div>

              {/* Danger Zone: Account Deactivation */}
              <div className="glass-card p-6 rounded-2xl border-rose-900/40 bg-rose-950/10 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h3 className="text-sm font-bold text-rose-300">Danger Zone: Account Deactivation</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deactivating your account will immediately remove your public profile, delete all associated modular sections, and wipe published video reels.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Deactivate & Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Leads & Inquiries */}
          {activeStudioTab === 'inquiries' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Inbox className="w-4 h-4 text-emerald-400" />
                    <span>Direct Inquiries Inbox</span>
                  </h2>
                  <p className="text-xs text-slate-400">Visitor messages and project leads submitted from your profile</p>
                </div>

                <div className="flex items-center space-x-2 flex-wrap gap-2">
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                          inquiryFilter === f.id
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className="text-[10px] font-mono">({f.count})</span>
                      </button>
                    ))}
                  </div>

                  {inquiries.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportInquiriesCSV}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                      title="Download Leads as CSV / Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>
              </div>

              {inquiries.filter((inq) => (inquiryFilter === 'all' ? inq.status !== 'archived' : inq.status === inquiryFilter)).length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-300">No {inquiryFilter} inquiries found</p>
                  <p className="text-[11px] text-slate-500">
                    Visitors can contact you directly by clicking "Get in Touch" on your public profile.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries
                    .filter((inq) => (inquiryFilter === 'all' ? inq.status !== 'archived' : inq.status === inquiryFilter))
                    .map((inq) => (
                      <div
                        key={inq._id}
                        className={`p-4 rounded-xl border transition-all ${
                          inq.status === 'unread'
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-white">{inq.senderName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{inq.senderEmail} {inq.senderPhone && `• ${inq.senderPhone}`}</p>
                        <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                          {inq.message}
                        </p>
                        <div className="flex items-center justify-end space-x-2 mt-3 pt-1">
                          <a
                            href={`mailto:${inq.senderEmail}?subject=Re: Inquiry from MyProfile`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold"
                          >
                            Reply via Email
                          </a>
                          <button
                            type="button"
                            onClick={() => handleUpdateInquiryStatus(inq._id, inq.status === 'read' ? 'unread' : 'read')}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold"
                          >
                            {inq.status === 'read' ? 'Mark Unread' : 'Mark Read'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Visitor Analytics */}
          {activeStudioTab === 'analytics' && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Profile Analytics</span>
                </h2>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">👁️ {analytics.totalViews || 0} views</span>
                  <span className="text-cyan-400 font-bold">🖱️ {analytics.totalClicks || 0} clicks</span>
                </div>
              </div>

              {/* 7-Day Trend */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>7-Day View Trend</span>
                </span>
                <div className="flex items-end space-x-2.5 h-32 pt-4 pb-2 px-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  {analytics.recentViews?.map((item, idx) => {
                    const maxViews = Math.max(...(analytics.recentViews.map((v) => v.views) || [1]), 1);
                    const barHeight = Math.max((item.views / maxViews) * 100, 8);
                    const dayLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                        <span className="text-[9px] font-mono text-emerald-400 mb-1">{item.views}</span>
                        <div
                          className="w-full max-w-[24px] rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400"
                          style={{ height: `${barHeight}%` }}
                        />
                        <span className="text-[9px] text-slate-400 mt-1">{dayLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Links */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300">Top Clicked Links</span>
                <div className="space-y-2">
                  {!analytics.topLinks || analytics.topLinks.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No link clicks recorded yet.</p>
                  ) : (
                    analytics.topLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-200 font-medium">{link.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold">
                          {link.count} clicks
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Smartphone Mockup (Desktop) */}
        <div className="hidden xl:block xl:col-span-5 sticky top-24">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Live Mobile Chassis</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Instant Preview
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

      {/* MODAL 1: AI Bio Helper Modal */}
      {aiBioModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-base font-bold text-white">✨ AI Bio Generator Helper</h3>
              </div>
              <button onClick={() => setAiBioModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tone of Voice</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['professional', 'creative', 'minimalist', 'punchy'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiBioTone(t)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      aiBioTone === t
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'bg-slate-900 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Keywords & Specializations (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Fullstack, Open Source, Scalable UI"
                value={aiBioKeywords}
                onChange={(e) => setAiBioKeywords(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="button"
              disabled={aiBioLoading}
              onClick={handleGenerateAiBio}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {aiBioLoading ? 'Generating AI Suggestions...' : '✨ Generate Smart Bios'}
            </button>

            {aiBioSuggestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-300">Click a suggestion to apply:</p>
                {aiBioSuggestions.map((sug, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setFormData({ ...formData, bio: sug });
                      setAiBioModal(false);
                      toast.success('Bio applied! Click "Save Changes" to persist.');
                    }}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 cursor-pointer text-xs text-slate-200 transition-all leading-relaxed"
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: AI Caption Helper Modal */}
      {aiCaptionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-base font-bold text-white">✨ AI Reel Caption Generator</h3>
              </div>
              <button onClick={() => setAiCaptionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reel Topic / Highlight</label>
              <input
                type="text"
                placeholder="e.g. Behind the scenes building our new mobile app"
                value={aiCaptionTopic}
                onChange={(e) => setAiCaptionTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['engaging', 'punchy', 'creative'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiCaptionTone(t)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      aiCaptionTone === t
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'bg-slate-900 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={aiCaptionLoading}
              onClick={handleGenerateAiCaption}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {aiCaptionLoading ? 'Generating Captions...' : '✨ Generate Captions & Hashtags'}
            </button>

            {aiCaptionSuggestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-300">Click a caption to apply to your reel:</p>
                {aiCaptionSuggestions.map((sug, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setReelForm({ ...reelForm, caption: sug });
                      setAiCaptionModal(false);
                      toast.success('Caption applied to reel!');
                    }}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 cursor-pointer text-xs text-slate-200 transition-all leading-relaxed"
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Add Section Modal */}
      {newSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Add Modular Section</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Section Type</label>
              <select
                value={sectionForm.type}
                onChange={(e) => setSectionForm({ ...sectionForm, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
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
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setNewSectionModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Post Reel Modal */}
      {reelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Post Short-Form Reel</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Video URL (MP4 / WebM)</label>
              <input
                type="url"
                placeholder="https://... or video CDN URL"
                value={reelForm.videoUrl}
                onChange={(e) => setReelForm({ ...reelForm, videoUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-400">Caption</label>
                <button
                  type="button"
                  onClick={() => setAiCaptionModal(true)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>✨ AI Caption Helper</span>
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Tell viewers what this reel is about..."
                value={reelForm.caption}
                onChange={(e) => setReelForm({ ...reelForm, caption: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (1-60s)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={reelForm.durationSeconds}
                  onChange={(e) => setReelForm({ ...reelForm, durationSeconds: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Visibility</label>
                <select
                  value={reelForm.visibility}
                  onChange={(e) => setReelForm({ ...reelForm, visibility: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="public">Public</option>
                  <option value="profile-only">Profile Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReelModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateReel}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Post Reel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: QR Fullscreen Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-5">
            <h3 className="text-lg font-bold text-white">{profile?.name}</h3>
            <p className="text-xs text-slate-400">Scan to open digital identity</p>
            {profile?.qrCodeUrl && (
              <img
                src={profile.qrCodeUrl}
                alt="Profile QR Code"
                className="w-60 h-60 mx-auto rounded-2xl p-3 bg-white shadow-2xl"
              />
            )}
            <p className="text-xs font-mono text-emerald-400">{profileUrl}</p>
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: Mobile Live Frame Modal (Screens < xl) */}
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
