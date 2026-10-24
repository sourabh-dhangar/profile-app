import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS, THEME_ACCENTS } from '../theme';
import { getVCardUrl, fetchProfileQR, getQRCodeUrl } from '../services/api';

const { width } = Dimensions.get('window');

const SECTION_ICONS = {
  about: '📖',
  experience: '🏢',
  education: '🎓',
  skills: '⭐',
  services: '💇',
  products: '🛍️',
  rate_card: '📋',
  menu: '🍽️',
  portfolio: '🚀',
  achievements: '🏆',
  contact: '📞',
  social: '🌐',
  faq: '❓',
  business_info: 'ℹ️',
};

const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', icon: '🐙' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { key: 'twitter', label: 'Twitter / X', icon: '🐦' },
  { key: 'instagram', label: 'Instagram', icon: '📸' },
  { key: 'youtube', label: 'YouTube', icon: '▶️' },
  { key: 'website', label: 'Website', icon: '🌐' },
];

const THEME_OPTIONS = [
  { key: 'default', label: 'Emerald', color: '#10b981' },
  { key: 'dark-neon', label: 'Cyber Violet', color: '#d946ef' },
  { key: 'minimalist-luxe', label: 'Gold Luxe', color: '#f59e0b' },
  { key: 'cyberpunk-emerald', label: 'Cyan Matrix', color: '#06b6d4' },
  { key: 'sunset-gradient', label: 'Crimson', color: '#f43f5e' },
];

const PROFILE_TYPES = [
  'Creator',
  'SmallBusiness',
  'StoreOwner',
  'Businessman',
  'ServiceProvider',
  'Professional',
  'Freelancer',
  'Engineer',
  'Designer',
  'Student',
];

const BUSINESS_CATEGORIES = [
  { id: 'Salon & Beauty', label: '💇 Salon & Beauty' },
  { id: 'Retail & Commerce', label: '🏪 Retail & Store' },
  { id: 'Grocery & Supermarket', label: '🛒 Grocery & Mart' },
  { id: 'Restaurant & Food', label: '🍽️ Food & Dining' },
  { id: 'Doctor & Clinic', label: '🩺 Doctor & Clinic' },
  { id: 'Fitness & Health', label: '💪 Gym & Fitness' },
  { id: 'Fashion & Apparel', label: '👗 Fashion & Clothing' },
  { id: 'Electronics & Mobile', label: '📱 Mobile & Electronics' },
  { id: 'Automobile & Garage', label: '🚗 Auto & Garage' },
  { id: 'IT & Software', label: '💻 IT & Tech' },
  { id: 'Professional Services', label: '💼 Professional Services' },
  { id: 'Content Creator & Artist', label: '🎬 Creator & Artist' },
  { id: 'Other Business', label: '🏢 Other Business' },
];

const SECTION_TYPES = [
  { type: 'services', label: 'Services & Rates', icon: '💇' },
  { type: 'products', label: 'Products & Store Catalog', icon: '🛍️' },
  { type: 'rate_card', label: 'Rate Card / Packages', icon: '📋' },
  { type: 'menu', label: 'Food / Drink Menu', icon: '🍽️' },
  { type: 'skills', label: 'Highlights & Offerings', icon: '⭐' },
  { type: 'portfolio', label: 'Portfolio & Projects', icon: '🚀' },
  { type: 'experience', label: 'Milestones & History', icon: '🏢' },
  { type: 'education', label: 'Certifications & Licenses', icon: '📜' },
  { type: 'about', label: 'About Business / Story', icon: '📖' },
];

const REEL_PRESETS = [
  {
    label: '📱 Mobile UI Demo',
    caption: 'Building 60fps gesture animations & dark glassmorphism in React Native! 🚀 #mobile #ui',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    durationSeconds: 15,
  },
  {
    label: '⚡ Architecture',
    caption: 'Scalable distributed systems: Zero-knowledge phone discovery with HMAC-SHA256 🛡️ #privacy',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    durationSeconds: 30,
  },
  {
    label: '🎨 Design System',
    caption: 'Design token orchestration: Dark neon themes & smooth haptic micro-interactions ✨ #design',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    durationSeconds: 20,
  },
  {
    label: '🚀 Project Launch',
    caption: 'Full-stack creator ID platform with video feeds & instant contact vCard export! 🎬 #launch',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    durationSeconds: 25,
  },
];

const AVATAR_PRESETS = [
  {
    id: 'dev-1',
    label: 'Full-Stack Dev',
    icon: '👨‍💻',
    url: 'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
  },
  {
    id: 'des-1',
    label: 'Product Designer',
    icon: '🎨',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: 'eng-1',
    label: 'Cloud Architect',
    icon: '⚡',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'lead-1',
    label: 'Tech Lead / AI',
    icon: '🚀',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
  },
  {
    id: 'cre-1',
    label: 'Creative Director',
    icon: '✨',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  },
  {
    id: 'cyb-1',
    label: 'Cyber Hacker',
    icon: '🕶️',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
];

const INQUIRY_SUBJECT_PRESETS = [
  '💼 Full-Time Role',
  '⚡ Freelance / Contract',
  '🛠️ Consulting / Advisory',
  '🤝 Partnership / Sponsorship',
  '💬 General Project Inquiry',
];

export default function ProfileScreen({
  profileData,
  loading,
  onRefresh,
  onShowToast,
  onSelectReelsTab,
  currentUser,
  isOwner,
  onNavigateToAuth,
  onUpdateProfile,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onCreateReel,
  onLikeReel,
  onDeleteReel,
  analyticsData,
  loadingAnalytics,
  onRefreshAnalytics,
  inquiries = [],
  unreadInquiriesCount = 0,
  loadingInquiries = false,
  onRefreshInquiries,
  onSendInquiry,
  onUpdateInquiryStatus,
  onReplyInquiry,
  onOpenSavedVault,
  onLogout,
  onBackToMyProfile,
  isFollowing = false,
  onToggleFollow,
  notifications = [],
  unreadNotificationsCount = 0,
  loadingNotifications = false,
  onRefreshNotifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onTogglePinReel,
  onVouchSkill,
}) {
  const profile = profileData?.profile || {};
  const sections = profileData?.sections || [];
  const reels = profileData?.reels || [];

  const [selectedTheme, setSelectedTheme] = useState('default');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [fetchedQrCode, setFetchedQrCode] = useState(null);
  const [loadingQrCode, setLoadingQrCode] = useState(false);

  // Load official backend QR or fallback
  React.useEffect(() => {
    if (profile?.username) {
      if (profile?.qrCodeDataUrl || profile?.qrCodeUrl) {
        setFetchedQrCode(profile.qrCodeDataUrl || profile.qrCodeUrl);
      } else {
        setLoadingQrCode(true);
        fetchProfileQR(profile.username)
          .then((res) => {
            if (res?.success && (res.data?.qrCodeDataUrl || res.data?.qrCode)) {
              setFetchedQrCode(res.data.qrCodeDataUrl || res.data.qrCode);
            }
          })
          .catch((err) => console.log('QR code fetch note:', err.message))
          .finally(() => setLoadingQrCode(false));
      }
    }
  }, [profile?.username, profile?.qrCodeDataUrl, profile?.qrCodeUrl]);

  const profileDirectUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/p/${profile?.username || 'user'}`
      : `http://localhost:8081/p/${profile?.username || 'user'}`;

  const resilientQrUrl =
    fetchedQrCode ||
    profile?.qrCodeDataUrl ||
    profile?.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
      profileDirectUrl
    )}&bgcolor=ffffff&color=020617&margin=8`;
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'likes' | 'inquiries' | 'vouches'

  // Follow State
  const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
  const [localFollowersDelta, setLocalFollowersDelta] = useState(0);

  React.useEffect(() => {
    setLocalIsFollowing(isFollowing);
  }, [isFollowing]);

  const handleFollowPress = async () => {
    if (!currentUser) {
      onShowToast('Please create or sign into your ID to follow creators', 'info');
      if (onNavigateToAuth) onNavigateToAuth();
      return;
    }
    const nextFollowing = !localIsFollowing;
    setLocalIsFollowing(nextFollowing);
    setLocalFollowersDelta((prev) => (nextFollowing ? prev + 1 : Math.max(prev - 1, -1)));
    if (onToggleFollow) {
      await onToggleFollow(profileData?.profile?.username);
    }
  };

  // Reel Upload & Player State
  const [isCreateReelModalVisible, setIsCreateReelModalVisible] = useState(false);
  const [savingReel, setSavingReel] = useState(false);
  const [activeViewingReel, setActiveViewingReel] = useState(null);
  const [viewingReelPlaying, setViewingReelPlaying] = useState(true);
  const [reelForm, setReelForm] = useState({
    caption: '',
    videoUrl: REEL_PRESETS[0].videoUrl,
    thumbnailUrl: REEL_PRESETS[0].thumbnailUrl,
    durationSeconds: 15,
  });

  // Inquiry Proposal Modal State (Visitor)
  const [isInquiryModalVisible, setIsInquiryModalVisible] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    subject: INQUIRY_SUBJECT_PRESETS[0],
    message: '',
  });

  // Inquiries Inbox Modal State (Owner)
  const [isInboxModalVisible, setIsInboxModalVisible] = useState(false);
  const [inboxFilter, setInboxFilter] = useState('all'); // 'all' | 'unread' | 'read' | 'replied'
  const [expandedInquiryId, setExpandedInquiryId] = useState(null);

  // 2-Way In-App Reply State
  const [activeReplyInquiryId, setActiveReplyInquiryId] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Section Modal State
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [savingSection, setSavingSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    type: 'skills',
    title: '',
    itemsText: '',
    text: '',
  });

  // Inline Quick Add Skill State
  const [inlineSkillInput, setInlineSkillInput] = useState('');
  const [activeSkillSecId, setActiveSkillSecId] = useState(null);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    photoUrl: '',
    name: '',
    username: '',
    profileType: 'Creator',
    category: 'IT & Software',
    subCategory: '',
    verifiedBadge: 'verified_pro',
    city: '',
    bio: '',
    theme: 'default',
    whatsapp: '',
    phone: '',
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
    businessName: '',
    tagline: '',
    timing: '',
    address: '',
    googleMapsUrl: '',
    whatsappNumber: '',
    bookingUrl: '',
    upiId: '',
    gstNumber: '',
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching Verified Profile...</Text>
      </View>
    );
  }

  if (!profileData || !profileData.profile) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconBox}>
          <Text style={styles.emptyIcon}>🔍</Text>
        </View>
        <Text style={styles.emptyTitle}>No Profile Selected</Text>
        <Text style={styles.emptySubtitle}>
          Search for a creator in Discover or log in to view your dashboard.
        </Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={onRefresh}>
          <Text style={styles.emptyBtnText}>Load Demo Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // profile, sections, and reels safely extracted at top
  const currentThemeKey = profile?.theme || selectedTheme || 'default';
  const theme = THEME_ACCENTS[currentThemeKey] || THEME_ACCENTS['default'] || {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.2)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    name: 'Emerald Classic',
  };

  // Handlers
  const handleSaveContact = () => {
    const url = getVCardUrl(profile.username);
    Linking.openURL(url).catch(() => {
      onShowToast('Could not open vCard download link', 'error');
    });
    onShowToast('Downloading vCard Contact (.vcf)...', 'success');
  };

  const handleShare = () => {
    onShowToast(`Copied @${profile.username} profile link!`, 'success');
  };

  const openEditModal = () => {
    setEditForm({
      photoUrl: profile.photoUrl || '',
      name: profile.name || '',
      username: profile.username || '',
      profileType: profile.profileType || 'Creator',
      category: profile.category || 'IT & Software',
      subCategory: profile.subCategory || '',
      verifiedBadge: profile.verifiedBadge || 'verified_pro',
      city: profile.city || '',
      bio: profile.bio || '',
      theme: profile.theme || 'default',
      whatsapp: profile.contactDetails?.whatsapp || '',
      phone: profile.contactDetails?.phone || '',
      email: profile.contactDetails?.email || '',
      github: profile.socialLinks?.find((s) => s.platform === 'github')?.url || '',
      linkedin: profile.socialLinks?.find((s) => s.platform === 'linkedin')?.url || '',
      twitter: profile.socialLinks?.find((s) => s.platform === 'twitter')?.url || '',
      website: profile.socialLinks?.find((s) => s.platform === 'website')?.url || '',
      businessName: profile.businessDetails?.businessName || '',
      tagline: profile.businessDetails?.tagline || '',
      timing: profile.businessDetails?.timing || '',
      address: profile.businessDetails?.address || '',
      googleMapsUrl: profile.businessDetails?.googleMapsUrl || '',
      whatsappNumber: profile.businessDetails?.whatsappNumber || '',
      bookingUrl: profile.businessDetails?.bookingUrl || '',
      upiId: profile.businessDetails?.upiId || '',
      gstNumber: profile.businessDetails?.gstNumber || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfileUpdates = async () => {
    if (!editForm.name.trim()) {
      onShowToast('Please provide your name', 'error');
      return;
    }
    setSavingEdit(true);
    try {
      const socialLinks = [
        editForm.github ? { platform: 'github', url: editForm.github } : null,
        editForm.linkedin ? { platform: 'linkedin', url: editForm.linkedin } : null,
        editForm.twitter ? { platform: 'twitter', url: editForm.twitter } : null,
        editForm.website ? { platform: 'website', url: editForm.website } : null,
      ].filter(Boolean);

      const payload = {
        name: editForm.name,
        username: editForm.username,
        photoUrl: editForm.photoUrl ? editForm.photoUrl.trim() : undefined,
        profileType: editForm.profileType,
        category: editForm.category,
        subCategory: editForm.subCategory,
        verifiedBadge: editForm.verifiedBadge || 'verified_pro',
        isVerifiedBadge: editForm.verifiedBadge !== 'none',
        city: editForm.city,
        bio: editForm.bio,
        theme: editForm.theme,
        socialLinks,
        contactDetails: {
          whatsapp: editForm.whatsapp,
          phone: editForm.phone,
          email: editForm.email,
          showWhatsapp: Boolean(editForm.whatsapp),
          showPhone: Boolean(editForm.phone),
          showEmail: Boolean(editForm.email),
        },
        businessDetails: {
          businessName: editForm.businessName,
          tagline: editForm.tagline,
          timing: editForm.timing,
          address: editForm.address,
          googleMapsUrl: editForm.googleMapsUrl,
          whatsappNumber: editForm.whatsappNumber || editForm.whatsapp,
          bookingUrl: editForm.bookingUrl,
          upiId: editForm.upiId,
          gstNumber: editForm.gstNumber,
        },
      };

      const success = await onUpdateProfile(payload);
      if (success) {
        setIsEditingProfile(false);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const openSendInquiryModal = () => {
    setInquiryForm({
      senderName: currentUser?.profile?.name || '',
      senderEmail: currentUser?.profile?.contactDetails?.email || '',
      senderPhone: currentUser?.profile?.contactDetails?.phone || currentUser?.user?.mobile || '',
      subject: INQUIRY_SUBJECT_PRESETS[0],
      message: '',
    });
    setIsInquiryModalVisible(true);
  };

  const handleSendInquirySubmit = async () => {
    if (!inquiryForm.senderName.trim()) {
      onShowToast('Please provide your name', 'error');
      return;
    }
    if (!inquiryForm.senderEmail.trim() || !inquiryForm.senderEmail.includes('@')) {
      onShowToast('Valid contact email is required', 'error');
      return;
    }
    if (!inquiryForm.message.trim()) {
      onShowToast('Please outline your proposal details', 'error');
      return;
    }
    setSendingInquiry(true);
    try {
      if (onSendInquiry) {
        const res = await onSendInquiry(profile.username, {
          senderName: inquiryForm.senderName.trim(),
          senderEmail: inquiryForm.senderEmail.trim(),
          senderPhone: inquiryForm.senderPhone.trim(),
          subject: inquiryForm.subject,
          message: inquiryForm.message.trim(),
        });
        if (res && res.success) {
          setIsInquiryModalVisible(false);
        }
      }
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleSendReply = async (inquiryId) => {
    if (!replyInputText.trim()) {
      onShowToast('Please type a reply message', 'error');
      return;
    }
    setSendingReply(true);
    try {
      if (onReplyInquiry) {
        const res = await onReplyInquiry(inquiryId, replyInputText.trim());
        if (res && res.success) {
          setReplyInputText('');
          setActiveReplyInquiryId(null);
          onShowToast('Reply sent & recorded! 💬', 'success');
        }
      }
    } finally {
      setSendingReply(false);
    }
  };

  // Section Modal Handlers
  const openAddSectionModal = () => {
    setEditingSectionId(null);
    setSectionForm({
      type: 'skills',
      title: 'Skills & Tech Stack',
      itemsText: 'React Native, TypeScript, Node.js, UI/UX Design',
      text: '',
    });
    setIsSectionModalVisible(true);
  };

  const openEditSectionModal = (sec) => {
    setEditingSectionId(sec._id);
    let itemsStr = '';
    if (Array.isArray(sec.content?.items)) {
      itemsStr = sec.content.items
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            if (item.price || item.cost || item.rate) {
              return [item.title || item.name, item.price || item.cost || item.rate, item.description || item.desc]
                .filter(Boolean)
                .join(' | ');
            }
            if (item.company || item.period) {
              return [item.title || item.role, item.company, item.period, item.description]
                .filter(Boolean)
                .join(' | ');
            }
            return item.title || item.role || item.name || JSON.stringify(item);
          }
          return item;
        })
        .join(sec.type === 'skills' ? ', ' : '\n');
    }
    setSectionForm({
      type: sec.type || 'skills',
      title: sec.title || '',
      itemsText: itemsStr,
      text: sec.content?.text || '',
    });
    setIsSectionModalVisible(true);
  };

  const handleSaveSection = async () => {
    if (!sectionForm.title.trim()) {
      onShowToast('Please provide a section title', 'error');
      return;
    }
    setSavingSection(true);
    try {
      let content = {};
      if (['services', 'products', 'rate_card', 'menu'].includes(sectionForm.type)) {
        let items = [];
        if (sectionForm.itemsText.includes('\n') || sectionForm.itemsText.includes('|')) {
          items = sectionForm.itemsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const parts = line.split('|').map((p) => p.trim());
              return {
                title: parts[0] || line,
                price: parts[1] || '',
                description: parts[2] || '',
              };
            });
        } else {
          items = sectionForm.itemsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => ({ title: s }));
        }
        content = { items };
      } else if (['skills'].includes(sectionForm.type)) {
        const items = sectionForm.itemsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        content = { items };
      } else if (['experience', 'portfolio', 'education'].includes(sectionForm.type)) {
        const items = sectionForm.itemsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const parts = line.split('|').map((p) => p.trim());
            return {
              title: parts[0] || line,
              company: parts[1] || '',
              period: parts[2] || '',
              description: parts[3] || '',
            };
          });
        content = {
          items: items.length > 0 ? items : [{ title: sectionForm.itemsText }],
        };
      } else {
        content = { text: sectionForm.text || sectionForm.itemsText };
      }

      if (editingSectionId) {
        if (onUpdateSection) {
          await onUpdateSection(editingSectionId, {
            type: sectionForm.type,
            title: sectionForm.title,
            content,
          });
        }
      } else {
        if (onCreateSection) {
          await onCreateSection({
            type: sectionForm.type,
            title: sectionForm.title,
            content,
          });
        }
      }
      setIsSectionModalVisible(false);
    } finally {
      setSavingSection(false);
    }
  };

  const handleQuickAddSkill = async (sec) => {
    if (!inlineSkillInput.trim()) return;
    const currentItems = Array.isArray(sec.content?.items) ? sec.content.items : [];
    const updatedItems = [...currentItems, inlineSkillInput.trim()];
    setInlineSkillInput('');
    if (onUpdateSection) {
      await onUpdateSection(sec._id, {
        type: sec.type,
        title: sec.title,
        content: { items: updatedItems },
      });
    }
  };

  const handleRemoveSkill = async (sec, skillIndex) => {
    if (!isOwner) return;
    const currentItems = Array.isArray(sec.content?.items) ? sec.content.items : [];
    const updatedItems = currentItems.filter((_, idx) => idx !== skillIndex);
    if (onUpdateSection) {
      await onUpdateSection(sec._id, {
        type: sec.type,
        title: sec.title,
        content: { items: updatedItems },
      });
      onShowToast('Skill removed', 'info');
    }
  };

  // Reel Handlers
  const openCreateReelModal = () => {
    setReelForm({
      caption: '',
      videoUrl: REEL_PRESETS[0].videoUrl,
      thumbnailUrl: REEL_PRESETS[0].thumbnailUrl,
      durationSeconds: 15,
    });
    setIsCreateReelModalVisible(true);
  };

  const applyReelPreset = (preset) => {
    setReelForm({
      caption: preset.caption,
      videoUrl: preset.videoUrl,
      thumbnailUrl: preset.thumbnailUrl,
      durationSeconds: preset.durationSeconds,
    });
    onShowToast(`Applied template: ${preset.label}`, 'info');
  };

  const handleSaveReel = async () => {
    const enteredCaption = (reelForm.caption || '').trim();
    if (!enteredCaption) {
      onShowToast('Please enter a caption for your reel', 'error');
      return;
    }
    const finalVideoUrl = (reelForm.videoUrl || '').trim() || REEL_PRESETS[0].videoUrl;
    let finalThumbnail = (reelForm.thumbnailUrl || '').trim();
    if (
      !finalThumbnail ||
      finalThumbnail.toLowerCase().endsWith('.mp4') ||
      finalThumbnail.toLowerCase().endsWith('.mov') ||
      finalThumbnail.toLowerCase().endsWith('.webm')
    ) {
      finalThumbnail = REEL_PRESETS[0].thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
    }

    setSavingReel(true);
    try {
      if (onCreateReel) {
        const ok = await onCreateReel({
          caption: enteredCaption,
          videoUrl: finalVideoUrl,
          thumbnailUrl: finalThumbnail,
          durationSeconds: parseInt(reelForm.durationSeconds, 10) || 15,
          visibility: 'public',
        });
        if (ok !== false) {
          setIsCreateReelModalVisible(false);
          setReelForm({
            caption: '',
            videoUrl: REEL_PRESETS[0].videoUrl,
            thumbnailUrl: REEL_PRESETS[0].thumbnailUrl,
            durationSeconds: 15,
          });
        }
      }
    } finally {
      setSavingReel(false);
    }
  };

  const handleReelLike = async (reel) => {
    if (onLikeReel) {
      await onLikeReel(reel._id);
    }
    if (activeViewingReel && activeViewingReel._id === reel._id) {
      setActiveViewingReel((prev) => ({
        ...prev,
        likesCount: (prev.likesCount || 0) + 1,
      }));
    }
  };

  const handleReelShare = (reel) => {
    const reelShareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/p/${profile.username}#reel-${reel._id}`
        : `http://localhost:8081/p/${profile.username}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${profile.name} on MyProfile`,
          text: reel.caption || `Check out this reel by @${profile.username}`,
          url: reelShareUrl,
        })
        .catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reelShareUrl);
    }
    onShowToast('Reel link copied! 📋 Share anywhere', 'success');
  };

  const handleReelDelete = async (reelId) => {
    if (onDeleteReel) {
      await onDeleteReel(reelId);
    }
    setActiveViewingReel(null);
  };

  // Contacts
  const rawPhone = profile.contactDetails?.phone || profile.contactDetails?.whatsapp || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const contactEmail = profile.contactDetails?.email || '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Guest Mode Banner: Option to Create Own Isolated ID */}
      {!currentUser && (
        <View style={styles.guestBanner}>
          <View style={styles.guestBannerLeft}>
            <View style={styles.guestTagBadge}>
              <Text style={styles.guestTagText}>DEMO PROFILE PREVIEW</Text>
            </View>
            <Text style={styles.guestTitle}>Viewing @{profile.username}</Text>
            <Text style={styles.guestSub}>
              Want your own isolated profile? Create a new ID in 30 seconds.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.guestActionBtn}
            onPress={onNavigateToAuth}
            activeOpacity={0.8}
          >
            <Text style={styles.guestActionBtnText}>+ Create My ID</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Visiting Another User Banner (when signed in) */}
      {currentUser && !isOwner && (
        <View style={styles.visitingBanner}>
          <View>
            <Text style={styles.visitingTag}>VISITING CREATOR</Text>
            <Text style={styles.visitingTitle}>@{profile.username}'s Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.backToMineBtn}
            onPress={onBackToMyProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.backToMineBtnText}>↩ Return to My ID</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Owner Status & Management Strip */}
      {isOwner && (
        <View style={styles.ownerControlStrip}>
          {/* Top Row: Verification Badge & Edit ID */}
          <View style={styles.ownerHeaderRow}>
            <View style={styles.ownerStatusRow}>
              <View style={styles.ownerDot} />
              <Text style={styles.ownerStatusText} numberOfLines={1}>
                MY VERIFIED ID ({currentUser?.user?.mobile || 'Active'})
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.ownerEditBtn,
                { borderColor: theme.badgeBorder, backgroundColor: theme.badgeBg },
              ]}
              onPress={openEditModal}
              activeOpacity={0.8}
            >
              <Text style={[styles.ownerEditBtnText, { color: theme.primary }]}>
                ✏️ Edit ID
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row: Quick Action Hubs */}
          <View style={styles.ownerActionButtonsRow}>
            {/* Activity & Notifications Hub Button */}
            <TouchableOpacity
              style={[
                styles.ownerInquiriesBtn,
                unreadNotificationsCount > 0 && styles.ownerNotificationsBtnActive,
              ]}
              onPress={() => {
                setIsNotificationsModalVisible(true);
                if (onRefreshNotifications) onRefreshNotifications();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.ownerInquiriesEmoji}>🔔</Text>
              <Text
                style={[
                  styles.ownerInquiriesText,
                  unreadNotificationsCount > 0 && { color: '#38bdf8', fontWeight: '800' },
                ]}
                numberOfLines={1}
              >
                Activity {unreadNotificationsCount > 0 ? `(${unreadNotificationsCount})` : ''}
              </Text>
              {unreadNotificationsCount > 0 && (
                <View style={[styles.unreadDotBadge, { backgroundColor: '#38bdf8' }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ownerInquiriesBtn,
                unreadInquiriesCount > 0 && styles.ownerInquiriesBtnActive,
              ]}
              onPress={() => setIsInboxModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.ownerInquiriesEmoji}>📬</Text>
              <Text
                style={[
                  styles.ownerInquiriesText,
                  unreadInquiriesCount > 0 && { color: '#fbbf24', fontWeight: '800' },
                ]}
                numberOfLines={1}
              >
                Inquiries {unreadInquiriesCount > 0 ? `(${unreadInquiriesCount})` : ''}
              </Text>
              {unreadInquiriesCount > 0 && <View style={styles.unreadDotBadge} />}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Hero Ambient Backdrop */}
      <View style={styles.heroBanner}>
        <View style={[styles.glowOrb, { backgroundColor: theme.glow }]} />
      </View>

      {/* Main Profile Identity Card */}
      <View style={styles.profileCard}>
        {/* Avatar with Theme Accent Ring */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                profile.photoUrl ||
                'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
            }}
            style={[styles.avatar, { borderColor: theme.primary }]}
          />
          <View style={[styles.verifiedSparkle, { backgroundColor: theme.primary }]}>
            <Text style={styles.sparkleIcon}>✓</Text>
          </View>
        </View>

        {/* Name & Handle */}
        <View style={styles.profileNameRow}>
          <Text style={styles.profileName}>{profile.name}</Text>
          {profile.verifiedBadge && profile.verifiedBadge !== 'none' && (
            <View
              style={[
                styles.verifiedBadgePill,
                { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder },
              ]}
            >
              <Text style={[styles.verifiedBadgeText, { color: theme.text }]}>
                {profile.verifiedBadge === 'top_creator'
                  ? '⭐ Top Creator'
                  : profile.verifiedBadge === 'verified_engineer'
                  ? '⚡ Verified Dev'
                  : profile.verifiedBadge === 'featured_artist'
                  ? '🎨 Featured Artist'
                  : '🛡️ Verified Pro'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.badgesRow}>
          <View
            style={[
              styles.handleBadge,
              { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder },
            ]}
          >
            <Text style={[styles.handleText, { color: theme.text }]}>
              @{profile.username}
            </Text>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile.profileType || 'Creator'}</Text>
          </View>

          {profile.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>🏷️ {profile.category}</Text>
            </View>
          )}

          {profile.subCategory ? (
            <View style={styles.subCategoryBadge}>
              <Text style={styles.subCategoryBadgeText}>✨ {profile.subCategory}</Text>
            </View>
          ) : null}

          {profile.city && (
            <View style={styles.cityBadge}>
              <Text style={styles.cityText}>📍 {profile.city}</Text>
            </View>
          )}
        </View>

        {/* Storefront & Business Details Strip */}
        {profile.businessDetails &&
          (profile.businessDetails.businessName ||
            profile.businessDetails.timing ||
            profile.businessDetails.address ||
            profile.businessDetails.whatsappNumber ||
            profile.businessDetails.bookingUrl ||
            profile.businessDetails.upiId ||
            profile.businessDetails.gstNumber) && (
            <View style={styles.storefrontCard}>
              <View style={styles.storefrontHeader}>
                <View style={styles.storefrontTitleCol}>
                  <View style={styles.storefrontTitleRow}>
                    <Text style={styles.storefrontHeaderIcon}>🏪</Text>
                    <Text style={styles.storefrontHeaderTitle}>
                      {profile.businessDetails.businessName || 'Business & Storefront'}
                    </Text>
                  </View>
                  {profile.businessDetails.tagline ? (
                    <Text style={styles.storefrontTagline}>{profile.businessDetails.tagline}</Text>
                  ) : null}
                </View>

                {profile.category && (
                  <View style={[styles.storefrontCategoryBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
                    <Text style={[styles.storefrontCategoryText, { color: theme.primary }]}>
                      {profile.category}
                    </Text>
                  </View>
                )}
              </View>

              {/* Sub-Category or Specialization */}
              {profile.subCategory ? (
                <View style={styles.storefrontSubCatRow}>
                  <Text style={styles.storefrontSubCatText}>🏷️ {profile.subCategory}</Text>
                </View>
              ) : null}

              {/* Business Timings */}
              {profile.businessDetails.timing ? (
                <View style={styles.storefrontRow}>
                  <Text style={styles.storefrontIcon}>⏰</Text>
                  <Text style={styles.storefrontText}>{profile.businessDetails.timing}</Text>
                </View>
              ) : null}

              {/* Physical Address + Maps */}
              {profile.businessDetails.address ? (
                <TouchableOpacity
                  style={styles.storefrontRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (profile.businessDetails.googleMapsUrl) {
                      Linking.openURL(profile.businessDetails.googleMapsUrl);
                    }
                  }}
                >
                  <Text style={styles.storefrontIcon}>📍</Text>
                  <Text style={[styles.storefrontText, profile.businessDetails.googleMapsUrl && styles.storefrontLinkText]}>
                    {profile.businessDetails.address}
                    {profile.businessDetails.googleMapsUrl ? ' (Open Map ↗)' : ''}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {/* UPI Instant Payment & GST Trust Badges */}
              {(profile.businessDetails.upiId || profile.businessDetails.gstNumber) && (
                <View style={styles.storefrontTrustRow}>
                  {profile.businessDetails.upiId ? (
                    <TouchableOpacity
                      style={styles.upiBadge}
                      onPress={() => onShowToast(`UPI ID: ${profile.businessDetails.upiId} copied!`, 'success')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.upiBadgeText}>⚡ UPI: {profile.businessDetails.upiId}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {profile.businessDetails.gstNumber ? (
                    <View style={styles.gstBadge}>
                      <Text style={styles.gstBadgeText}>🛡️ GST: {profile.businessDetails.gstNumber}</Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Action Buttons: WhatsApp Chat, Book / Catalog, Call Store */}
              <View style={styles.storefrontActionsRow}>
                {profile.businessDetails.whatsappNumber ? (
                  <TouchableOpacity
                    style={styles.whatsappActionBtn}
                    onPress={() => {
                      const cleanPhone = profile.businessDetails.whatsappNumber.replace(/[^0-9]/g, '');
                      Linking.openURL('https://wa.me/' + cleanPhone + '?text=Hi%20' + encodeURIComponent(profile.businessDetails.businessName || profile.name) + ',%20I%20found%20your%20business%20on%20MyProfile!');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.whatsappActionText}>💬 WhatsApp Chat</Text>
                  </TouchableOpacity>
                ) : null}

                {profile.businessDetails.bookingUrl ? (
                  <TouchableOpacity
                    style={[styles.bookingActionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => Linking.openURL(profile.businessDetails.bookingUrl)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bookingActionText}>📅 Book / Catalog</Text>
                  </TouchableOpacity>
                ) : null}

                {(profile.contactDetails?.phone || profile.businessDetails?.whatsappNumber) ? (
                  <TouchableOpacity
                    style={styles.callStoreActionBtn}
                    onPress={() => {
                      const tel = profile.contactDetails?.phone || profile.businessDetails?.whatsappNumber;
                      Linking.openURL(`tel:${tel}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.callStoreActionText}>📞 Call Store</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}

        {/* Bio */}
        {profile.bio ? (
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* Quick Identity Metrics */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: theme.text }]}>
              {Math.max(0, (profile.followersCount || 0) + localFollowersDelta)}
            </Text>
            <Text style={styles.metricLabel}>FOLLOWERS</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {profile.followingCount !== undefined ? profile.followingCount : 0}
            </Text>
            <Text style={styles.metricLabel}>FOLLOWING</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{reels.length || 0}</Text>
            <Text style={styles.metricLabel}>REELS</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {typeof analyticsData?.totalProfileViews === 'number'
                ? analyticsData.totalProfileViews.toLocaleString()
                : typeof profileData?.stats?.viewsCount === 'number'
                ? profileData.stats.viewsCount.toLocaleString()
                : typeof profile?.stats?.viewsCount === 'number'
                ? profile.stats.viewsCount.toLocaleString()
                : '0'}
            </Text>
            <Text style={styles.metricLabel}>VIEWS</Text>
          </View>
        </View>

        {/* Visitor Actions: Follow/Unfollow & Hire Me Inquiry */}
        {!isOwner && (
          <View style={styles.visitorActionsRow}>
            <TouchableOpacity
              style={[
                styles.profileFollowBtn,
                localIsFollowing
                  ? styles.profileFollowingBtn
                  : { backgroundColor: theme.primary },
              ]}
              onPress={handleFollowPress}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.profileFollowBtnText,
                  localIsFollowing && styles.profileFollowingBtnText,
                ]}
              >
                {localIsFollowing ? '✓ Following' : '+ Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hireMeButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}
              onPress={openSendInquiryModal}
              activeOpacity={0.85}
            >
              <Text style={styles.hireMeButtonEmoji}>💼</Text>
              <View style={styles.hireMeButtonTextCol}>
                <Text style={styles.hireMeButtonTitle}>Hire Me</Text>
                <Text style={styles.hireMeButtonSub} numberOfLines={1}>
                  Direct message / project inquiry
                </Text>
              </View>
              <Text style={styles.hireMeButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button Strip */}
        <View style={styles.actionStrip}>
          {isOwner ? (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
              onPress={openEditModal}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionIcon}>✏️</Text>
              <Text style={styles.primaryActionText}>Customize ID</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
              onPress={handleSaveContact}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionIcon}>📥</Text>
              <Text style={styles.primaryActionText}>Save Contact</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionIcon}>🔗</Text>
            <Text style={styles.secondaryActionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => setShowQrModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionIcon}>📱</Text>
            <Text style={styles.secondaryActionText}>QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Instant Digital Identity & Storefront QR Stand */}
        <View style={styles.profileQrStandCard}>
          <View style={styles.profileQrStandLeft}>
            <View style={[styles.qrStandBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
              <Text style={[styles.qrStandBadgeText, { color: theme.primary }]}>
                ⚡ INSTANT PROFILE & STORE QR
              </Text>
            </View>
            <Text style={styles.qrStandTitle}>Scan to View Profile & Catalog</Text>
            <Text style={styles.qrStandSub}>
              Point any smartphone camera to view services, products & contact directly
            </Text>
            <View style={styles.qrStandActionRow}>
              <TouchableOpacity
                style={[styles.qrStandBtn, { backgroundColor: theme.primary }]}
                onPress={() => setShowQrModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.qrStandBtnText}>🔍 Enlarge QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qrStandShareBtn}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Text style={styles.qrStandShareText}>🔗 Copy Link</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileQrStandThumbWrapper}
            onPress={() => setShowQrModal(true)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: resilientQrUrl }}
              style={styles.profileQrStandThumb}
              resizeMode="contain"
            />
            <View style={styles.qrThumbTapBadge}>
              <Text style={styles.qrThumbTapText}>Tap ↗</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Direct Connect Quick Actions */}
        <View style={styles.quickConnectRow}>
          {cleanPhone ? (
            <TouchableOpacity
              style={styles.connectChip}
              onPress={() => Linking.openURL(`https://wa.me/${cleanPhone}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.connectChipIcon}>💬</Text>
              <Text style={styles.connectChipText}>WhatsApp</Text>
            </TouchableOpacity>
          ) : null}

          {cleanPhone ? (
            <TouchableOpacity
              style={styles.connectChip}
              onPress={() => Linking.openURL(`tel:${cleanPhone}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.connectChipIcon}>📞</Text>
              <Text style={styles.connectChipText}>Call</Text>
            </TouchableOpacity>
          ) : null}

          {contactEmail ? (
            <TouchableOpacity
              style={styles.connectChip}
              onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.connectChipIcon}>✉️</Text>
              <Text style={styles.connectChipText}>Email</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.connectChip}
            onPress={handleSaveContact}
            activeOpacity={0.7}
          >
            <Text style={styles.connectChipIcon}>📥</Text>
            <Text style={styles.connectChipText}>.vcf vCard</Text>
          </TouchableOpacity>
        </View>

        {/* Social Links Cluster */}
        {profile.socialLinks && profile.socialLinks.length > 0 ? (
          <View style={styles.socialCluster}>
            <Text style={styles.socialHeader}>VERIFIED CHANNELS & PROFILES</Text>
            <View style={styles.socialChipsRow}>
              {profile.socialLinks.map((item, idx) => {
                const conf = SOCIAL_PLATFORMS.find((p) => p.key === item.platform) || {
                  label: item.platform,
                  icon: '🌐',
                };
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.socialChip}
                    onPress={() => {
                      if (item.url) {
                        Linking.openURL(item.url).catch(() =>
                          onShowToast('Could not open external link', 'error')
                        );
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.socialChipIcon}>{conf.icon}</Text>
                    <Text style={styles.socialChipText}>{conf.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>

      {/* 4. Creator Performance Analytics Dashboard (Owner View) */}
      {isOwner && (
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeaderRow}>
            <View style={styles.analyticsHeaderLeft}>
              <View style={styles.analyticsTitleRow}>
                <Text style={styles.analyticsIcon}>📊</Text>
                <Text style={styles.analyticsTitle}>Creator Analytics</Text>
                <View style={styles.livePulseBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.livePulseText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.analyticsSubtitle}>
                Real-time engagement, visitor trends, & content reach
              </Text>
            </View>

            <TouchableOpacity
              style={styles.analyticsRefreshBtn}
              onPress={onRefreshAnalytics}
              disabled={loadingAnalytics}
              activeOpacity={0.7}
            >
              {loadingAnalytics ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <Text style={[styles.analyticsRefreshText, { color: theme.text }]}>
                  🔄 Refresh
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 4 Stat Tiles Grid */}
          <View style={styles.analyticsGrid}>
            {/* Tile 1: Total Views */}
            <View style={styles.analyticsTile}>
              <View style={styles.analyticsTileTop}>
                <Text style={styles.analyticsTileEmoji}>👁️</Text>
                <Text style={styles.analyticsTileLabel}>PROFILE VIEWS</Text>
              </View>
              <Text style={[styles.analyticsTileValue, { color: theme.text }]}>
                {(analyticsData?.totalViews ?? profileData?.stats?.viewsCount ?? profile?.stats?.viewsCount ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.analyticsTileSub}>All-time visits</Text>
            </View>

            {/* Tile 2: Social Link Clicks */}
            <View style={styles.analyticsTile}>
              <View style={styles.analyticsTileTop}>
                <Text style={styles.analyticsTileEmoji}>🔗</Text>
                <Text style={styles.analyticsTileLabel}>LINK CLICKS</Text>
              </View>
              <Text style={[styles.analyticsTileValue, { color: '#60a5fa' }]}>
                {(analyticsData?.totalClicks ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.analyticsTileSub}>Outbound leads</Text>
            </View>

            {/* Tile 3: Reel Impressions */}
            <View style={styles.analyticsTile}>
              <View style={styles.analyticsTileTop}>
                <Text style={styles.analyticsTileEmoji}>🎬</Text>
                <Text style={styles.analyticsTileLabel}>REEL VIEWS</Text>
              </View>
              <Text style={[styles.analyticsTileValue, { color: '#f59e0b' }]}>
                {reels.reduce((sum, r) => sum + (r.viewsCount || 0), 0).toLocaleString()}
              </Text>
              <Text style={styles.analyticsTileSub}>Video impressions</Text>
            </View>

            {/* Tile 4: Reel Likes */}
            <View style={styles.analyticsTile}>
              <View style={styles.analyticsTileTop}>
                <Text style={styles.analyticsTileEmoji}>❤️</Text>
                <Text style={styles.analyticsTileLabel}>REEL LIKES</Text>
              </View>
              <Text style={[styles.analyticsTileValue, { color: '#f43f5e' }]}>
                {reels.reduce((sum, r) => sum + (r.likesCount || 0), 0).toLocaleString()}
              </Text>
              <Text style={styles.analyticsTileSub}>Audience reactions</Text>
            </View>
          </View>

          {/* 7-Day Visitor Trend Chart */}
          <View style={styles.trendChartSection}>
            <View style={styles.trendHeaderRow}>
              <Text style={styles.trendTitle}>📈 7-Day Visitor Trend</Text>
              <Text style={styles.trendTotalBadge}>
                {analyticsData?.dailyViews && analyticsData.dailyViews.length > 0
                  ? `${analyticsData.dailyViews.reduce((acc, d) => acc + (d.views || d.count || 0), 0)} views this week`
                  : 'Weekly Activity'}
              </Text>
            </View>

            <View style={styles.chartBarsContainer}>
              {(() => {
                const days = analyticsData?.dailyViews && analyticsData.dailyViews.length > 0
                  ? analyticsData.dailyViews
                  : Array.from({ length: 7 }, (_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      return {
                        date: d.toISOString().split('T')[0],
                        views: 0,
                        count: 0,
                      };
                    });
                const maxVal = Math.max(...days.map((d) => d.views || d.count || 0), 10);
                return days.map((day, idx) => {
                  const val = day.views || day.count || 0;
                  const barHeight = Math.max(14, Math.round((val / maxVal) * 70));
                  const isPeak = val === maxVal && val > 0;
                  const dayLabel = day.date ? day.date.slice(-2) : `D${idx + 1}`;
                  return (
                    <View key={idx} style={styles.chartCol}>
                      <Text style={[styles.chartValText, isPeak && { color: theme.text, fontWeight: '800' }]}>
                        {val}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: barHeight },
                            isPeak
                              ? { backgroundColor: theme.primary }
                              : { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                          ]}
                        />
                      </View>
                      <Text style={[styles.chartDayText, isPeak && { color: '#ffffff', fontWeight: '800' }]}>
                        {idx === days.length - 1 ? 'Today' : dayLabel}
                      </Text>
                    </View>
                  );
                });
              })()}
            </View>
          </View>

          {/* Quick Inbox CTA Banner in Analytics */}
          <TouchableOpacity
            style={[styles.inboxBannerBtn, { borderColor: theme.badgeBorder, backgroundColor: theme.badgeBg }]}
            onPress={() => setIsInboxModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.inboxBannerLeft}>
              <Text style={styles.inboxBannerEmoji}>📬</Text>
              <View>
                <Text style={[styles.inboxBannerTitle, { color: theme.text }]}>
                  Client Inquiries & Proposals
                </Text>
                <Text style={styles.inboxBannerSub}>
                  {inquiries.length > 0
                    ? `${inquiries.length} total proposal${inquiries.length > 1 ? 's' : ''} received`
                    : 'Direct leads submitted through your profile'}
                </Text>
              </View>
            </View>

            <View style={styles.inboxBadgeRow}>
              {unreadInquiriesCount > 0 ? (
                <View style={styles.unreadCountPill}>
                  <Text style={styles.unreadCountPillText}>
                    {unreadInquiriesCount} New
                  </Text>
                </View>
              ) : (
                <View style={styles.allReadPill}>
                  <Text style={styles.allReadPillText}>View Inbox →</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Featured Reels & Video Posts Showcase */}
      <View style={styles.reelsShowcaseContainer}>
        <View style={styles.reelsHeaderRow}>
          <View style={styles.reelsHeaderTitleCol}>
            <View style={styles.reelsTitleBadgeRow}>
              <Text style={styles.reelsSectionEmoji}>🎬</Text>
              <Text style={styles.reelsSectionTitle}>Creator Reels & Posts</Text>
              <View style={[styles.reelsCountPill, { backgroundColor: theme.badgeBg }]}>
                <Text style={[styles.reelsCountPillText, { color: theme.text }]}>
                  {reels.length} {reels.length === 1 ? 'Reel' : 'Reels'}
                </Text>
              </View>
            </View>
            <Text style={styles.reelsSectionSubtitle}>
              Short video highlights, demos, and project showcases
            </Text>
          </View>

          <View style={styles.reelsHeaderActions}>
            {onOpenSavedVault && (
              <TouchableOpacity
                style={styles.savedVaultBtn}
                onPress={onOpenSavedVault}
                activeOpacity={0.8}
              >
                <Text style={styles.savedVaultBtnText}>🔖 Saved</Text>
              </TouchableOpacity>
            )}
            {(isOwner || (currentUser?.profile?.username && profileData?.profile?.username === currentUser.profile.username)) && (
              <TouchableOpacity
                style={[styles.postReelBtn, { backgroundColor: theme.primary }]}
                onPress={openCreateReelModal}
                activeOpacity={0.8}
              >
                <Text style={styles.postReelBtnText}>+ Post Reel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.reelsFeedBtn}
              onPress={onSelectReelsTab}
              activeOpacity={0.8}
            >
              <Text style={styles.reelsFeedBtnText}>Feed →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {reels.length === 0 ? (
          <View style={styles.emptyReelsCard}>
            <Text style={styles.emptyReelsIcon}>🎥</Text>
            <Text style={styles.emptyReelsTitle}>No Video Reels Posted Yet</Text>
            <Text style={styles.emptyReelsSub}>
              {isOwner
                ? 'Share 15s–60s videos to show your craft, walk through your code, or present your ideas!'
                : 'This creator has not uploaded any video reels yet. Check back soon!'}
            </Text>
            {(isOwner || (currentUser?.profile?.username && profileData?.profile?.username === currentUser.profile.username)) && (
              <TouchableOpacity
                style={[styles.postFirstReelBtn, { borderColor: theme.primary }]}
                onPress={openCreateReelModal}
                activeOpacity={0.8}
              >
                <Text style={[styles.postFirstReelText, { color: theme.text }]}>
                  + Upload Your First Reel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reelsHorizontalScroll}
          >
            {reels.map((reel, rIdx) => {
              const rId = reel._id || `profile-reel-${rIdx}`;
              const thumb =
                reel.thumbnailUrl ||
                reel.videoUrl ||
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';

              return (
                <TouchableOpacity
                  key={rId}
                  style={[
                    styles.reelPreviewCard,
                    reel.isPinned && styles.reelPreviewCardPinned,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => {
                    setActiveViewingReel(reel);
                    setViewingReelPlaying(true);
                  }}
                >
                  <Image source={{ uri: thumb }} style={styles.reelPreviewImg} resizeMode="cover" />
                  <View style={styles.reelPreviewGradient} />

                  {/* Pinned Master Pitch Glow Badge */}
                  {reel.isPinned && (
                    <View style={styles.masterPitchBadge}>
                      <Text style={styles.masterPitchBadgeText}>📌 MASTER PITCH</Text>
                    </View>
                  )}

                  {/* Top Badges */}
                  <View style={styles.reelCardTopRow}>
                    <View style={styles.durationPill}>
                      <Text style={styles.durationPillText}>
                        {reel.durationSeconds ? `${reel.durationSeconds}s` : '15s'}
                      </Text>
                    </View>
                    <View style={styles.reelNumberBadge}>
                      <Text style={styles.reelNumberText}>#{rIdx + 1}</Text>
                    </View>
                  </View>

                  {/* Centered Play Button Ring */}
                  <View style={styles.reelPlayRing}>
                    <Text style={styles.reelPlayIcon}>▶</Text>
                  </View>

                  {/* Bottom Stats, Audio & Caption */}
                  <View style={styles.reelCardBottom}>
                    {/* Audio track tag if available */}
                    {reel.audioTrack?.title ? (
                      <View style={styles.reelCardAudioTag}>
                        <Text style={styles.reelCardAudioText} numberOfLines={1}>
                          🎵 {reel.audioTrack.title}
                        </Text>
                      </View>
                    ) : null}

                    <Text style={styles.reelCardCaption} numberOfLines={2}>
                      {reel.caption || 'Video Demonstration'}
                    </Text>

                    <View style={styles.reelEngagementRow}>
                      <TouchableOpacity
                        style={styles.reelEngagementPill}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleReelLike(reel);
                        }}
                      >
                        <Text style={styles.reelEngagementEmoji}>❤️</Text>
                        <Text style={styles.reelEngagementCount}>{reel.likesCount || 0}</Text>
                      </TouchableOpacity>

                      <View style={styles.reelEngagementPill}>
                        <Text style={styles.reelEngagementEmoji}>👁️</Text>
                        <Text style={styles.reelEngagementCount}>{reel.viewsCount || 0}</Text>
                      </View>

                      {/* Owner Pin/Unpin Master Reel Button */}
                      {isOwner && onTogglePinReel && (
                        <TouchableOpacity
                          style={[
                            styles.pinMiniBtn,
                            reel.isPinned && styles.pinMiniBtnActive,
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            onTogglePinReel(reel._id);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.pinMiniBtnText}>
                            {reel.isPinned ? '📌' : '📍'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.reelShareMiniBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleReelShare(reel);
                        }}
                      >
                        <Text style={styles.reelShareMiniText}>↗️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Modular Profile Sections */}
      <View style={styles.sectionsContainer}>
        <View style={styles.sectionsTitleRow}>
          <View>
            <Text style={styles.sectionsMainTitle}>Curated Portfolio & Details</Text>
            <Text style={styles.sectionsCount}>
              {sections.length} Active Modules
            </Text>
          </View>
          {isOwner && (
            <TouchableOpacity
              style={[styles.addSectionBtn, { backgroundColor: theme.primary }]}
              onPress={openAddSectionModal}
              activeOpacity={0.8}
            >
              <Text style={styles.addSectionBtnText}>+ Add Section</Text>
            </TouchableOpacity>
          )}
        </View>

        {sections.length === 0 ? (
          <View style={styles.noSectionsBox}>
            <Text style={styles.noSectionsText}>
              No extra sections added yet. Check back soon!
            </Text>
            {isOwner && (
              <TouchableOpacity
                style={[styles.addFirstSecBtn, { borderColor: theme.primary }]}
                onPress={openAddSectionModal}
              >
                <Text style={[styles.addFirstSecText, { color: theme.text }]}>
                  + Add Your First Section
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          sections.map((section, idx) => {
            const secIcon = SECTION_ICONS[section.type] || '📁';
            return (
              <View key={section._id || idx} style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <View style={styles.sectionIconBadge}>
                    <Text style={styles.sectionCardIcon}>{secIcon}</Text>
                  </View>
                  <View style={styles.sectionHeaderTexts}>
                    <Text style={styles.sectionTitleText}>{section.title}</Text>
                    <Text style={styles.sectionTypeTag}>
                      {section.type?.toUpperCase()}
                    </Text>
                  </View>

                  {/* Header Right Actions */}
                  <View style={styles.sectionHeaderRight}>
                    {isOwner && (
                      <View style={styles.sectionActionBtns}>
                        <TouchableOpacity
                          style={styles.secEditBtn}
                          onPress={() => openEditSectionModal(section)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.secEditBtnText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.secDeleteBtn}
                          onPress={() => onDeleteSection && onDeleteSection(section._id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.secDeleteBtnText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={styles.sectionIndexBadge}>
                      <Text style={styles.sectionIndexText}>#{idx + 1}</Text>
                    </View>
                  </View>
                </View>

                {/* Section Content Rendering */}
                {/* 1. Business Catalog, Rate Card, Products & Menu Grid */}
                {['services', 'products', 'rate_card', 'menu'].includes(section.type) &&
                section.content?.items &&
                Array.isArray(section.content.items) ? (
                  <View style={styles.businessCatalogGrid}>
                    {section.content.items.map((prod, pIdx) => {
                      const itemTitle =
                        typeof prod === 'object' && prod !== null
                          ? prod.title || prod.name || 'Offering'
                          : String(prod).split('|')[0]?.trim();
                      const itemPrice =
                        typeof prod === 'object' && prod !== null
                          ? prod.price || prod.cost || prod.rate || ''
                          : String(prod).split('|')[1]?.trim();
                      const itemDesc =
                        typeof prod === 'object' && prod !== null
                          ? prod.description || prod.desc || prod.details || ''
                          : String(prod).split('|')[2]?.trim();

                      return (
                        <View
                          key={pIdx}
                          style={[styles.catalogItemCard, { borderLeftColor: theme.primary }]}
                        >
                          <View style={styles.catalogItemTopRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={styles.catalogItemTitle}>{itemTitle}</Text>
                              {itemDesc ? (
                                <Text style={styles.catalogItemDesc}>{itemDesc}</Text>
                              ) : null}
                            </View>
                            {itemPrice ? (
                              <View style={[styles.catalogPriceBadge, { backgroundColor: theme.badgeBg, borderColor: theme.badgeBorder }]}>
                                <Text style={[styles.catalogPriceText, { color: theme.primary }]}>
                                  {itemPrice.startsWith('₹') || itemPrice.startsWith('$') ? itemPrice : `₹${itemPrice}`}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <View style={styles.catalogActionRow}>
                            <TouchableOpacity
                              style={styles.catalogInquireBtn}
                              onPress={() => {
                                const wa = profile.businessDetails?.whatsappNumber || profile.contactDetails?.whatsapp;
                                if (wa) {
                                  const clean = wa.replace(/[^0-9]/g, '');
                                  Linking.openURL(
                                    `https://wa.me/${clean}?text=${encodeURIComponent(
                                      `Hi ${profile.businessDetails?.businessName || profile.name}, I am interested in "${itemTitle}" (${itemPrice || 'Inquiry'})`
                                    )}`
                                  );
                                } else {
                                  openSendInquiryModal();
                                }
                              }}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.catalogInquireText}>💬 Inquire / Order</Text>
                            </TouchableOpacity>

                            {profile.businessDetails?.bookingUrl ? (
                              <TouchableOpacity
                                style={[styles.catalogBookBtn, { backgroundColor: theme.primary }]}
                                onPress={() => Linking.openURL(profile.businessDetails.bookingUrl)}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.catalogBookText}>📅 Book Now</Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : /* 2. Portfolio / Projects Grid */
                section.type === 'portfolio' &&
                section.content?.items &&
                Array.isArray(section.content.items) ? (
                  <View style={styles.portfolioGrid}>
                    {section.content.items.map((proj, pIdx) => {
                      const projTitle =
                        typeof proj === 'object' && proj !== null
                          ? proj.title || proj.name || 'Featured Project'
                          : String(proj);
                      const projDesc =
                        typeof proj === 'object' && proj !== null
                          ? proj.description || proj.desc || ''
                          : '';
                      const projLink =
                        typeof proj === 'object' && proj !== null
                          ? proj.link || proj.url || ''
                          : '';

                      return (
                        <View
                          key={pIdx}
                          style={[
                            styles.portfolioCard,
                            { borderLeftColor: theme.primary },
                          ]}
                        >
                          <Text style={styles.portfolioTitle}>{projTitle}</Text>
                          {projDesc ? (
                            <Text style={styles.portfolioDesc}>{projDesc}</Text>
                          ) : null}
                          {projLink ? (
                            <TouchableOpacity
                              style={styles.projectLinkBtn}
                              onPress={() => Linking.openURL(projLink)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[styles.projectLinkText, { color: theme.text }]}
                              >
                                View Live Demo ↗
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ) : /* 2. Structured Items (Experience / Education) */
                section.content?.items &&
                  Array.isArray(section.content.items) &&
                  section.content.items.length > 0 &&
                  typeof section.content.items[0] === 'object' &&
                  section.content.items[0] !== null ? (
                  <View style={styles.structuredItemsContainer}>
                    {section.content.items.map((item, itemIdx) => {
                      const title =
                        item.role || item.title || item.degree || item.name || '';
                      const subtitle = [
                        item.company || item.institution || item.school,
                        item.period || item.year,
                      ]
                        .filter(Boolean)
                        .join(' • ');
                      const desc = item.description || item.details || item.desc || '';
                      return (
                        <View
                          key={itemIdx}
                          style={[
                            styles.structuredItemCard,
                            { borderLeftColor: theme.primary },
                          ]}
                        >
                          {title ? (
                            <Text style={styles.structuredItemTitle}>{title}</Text>
                          ) : null}
                          {subtitle ? (
                            <Text style={styles.structuredItemSubtitle}>
                              {subtitle}
                            </Text>
                          ) : null}
                          {desc ? (
                            <Text style={styles.structuredItemDesc}>{desc}</Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ) : /* 3. Skills Cloud / Simple Pills */
                section.content?.items && Array.isArray(section.content.items) ? (
                  <View>
                    <View style={styles.pillsContainer}>
                      {section.content.items.map((item, itemIdx) => {
                        const skillName =
                          typeof item === 'object' && item !== null
                            ? item.name || item.title || JSON.stringify(item)
                            : String(item);
                        const skillVouches =
                          typeof item === 'object' && item !== null ? item.vouches || 0 : 0;

                        return (
                          <View
                            key={itemIdx}
                            style={[
                              styles.skillPill,
                              {
                                borderColor:
                                  skillVouches > 0
                                    ? '#fbbf24'
                                    : itemIdx === 0
                                    ? theme.badgeBorder
                                    : 'rgba(255,255,255,0.1)',
                              },
                            ]}
                          >
                            <Text style={styles.skillPillText}>{skillName}</Text>
                            {skillVouches > 0 && (
                              <View style={styles.skillVouchPill}>
                                <Text style={styles.skillVouchPillText}>⭐ {skillVouches}</Text>
                              </View>
                            )}
                            {!isOwner && onVouchSkill && (
                              <TouchableOpacity
                                style={styles.vouchActionBtn}
                                onPress={() => onVouchSkill(profile.username, skillName)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.vouchActionBtnText}>+1 Vouch</Text>
                              </TouchableOpacity>
                            )}
                            {isOwner && (
                              <TouchableOpacity
                                onPress={() => handleRemoveSkill(section, itemIdx)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.removeSkillBadge}> ✕</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Quick Inline Skill Adder for Owner */}
                    {isOwner && section.type === 'skills' && (
                      <View style={styles.inlineSkillAddRow}>
                        <TextInput
                          style={styles.inlineSkillInput}
                          placeholder="+ Add another skill..."
                          placeholderTextColor="#64748b"
                          value={
                            activeSkillSecId === section._id ? inlineSkillInput : ''
                          }
                          onFocus={() => setActiveSkillSecId(section._id)}
                          onChangeText={setInlineSkillInput}
                          onSubmitEditing={() => handleQuickAddSkill(section)}
                        />
                        <TouchableOpacity
                          style={[
                            styles.inlineSkillBtn,
                            { backgroundColor: theme.primary },
                          ]}
                          onPress={() => handleQuickAddSkill(section)}
                        >
                          <Text style={styles.inlineSkillBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  /* 4. Text / About */
                  <Text style={styles.sectionBodyText}>
                    {section.content?.text || 'No description provided.'}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Interactive QR Code Modal */}
      <Modal
        visible={showQrModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrHeaderRow}>
              <Text style={styles.qrModalTitle}>Verified Identity QR</Text>
              <TouchableOpacity
                onPress={() => setShowQrModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeBox}>
              {loadingQrCode && !resilientQrUrl ? (
                <ActivityIndicator size="large" color={theme.primary} />
              ) : (
                <Image
                  source={{ uri: resilientQrUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              )}
            </View>

            <Text style={styles.qrName}>{profile.name}</Text>
            <Text style={[styles.qrUsername, { color: theme.text }]}>
              @{profile.username}
            </Text>
            <Text style={styles.qrSub}>
              Point any camera at this code to view and save this digital profile instantly.
            </Text>

            <View style={styles.qrActionsRow}>
              <TouchableOpacity
                style={[styles.qrActionPrimary, { backgroundColor: theme.primary }]}
                onPress={handleShare}
              >
                <Text style={styles.qrActionPrimaryText}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qrActionSecondary}
                onPress={handleSaveContact}
              >
                <Text style={styles.qrActionSecondaryText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Section Creation & Editing Modal */}
      <Modal
        visible={isSectionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSectionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingSectionId ? 'Edit Section' : 'Add New Section'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Curate your public skills, experience, or projects
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSectionModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Section Type Selection */}
              <Text style={styles.modalInputLabel}>SECTION MODULE TYPE</Text>
              <View style={styles.typeOptionsRow}>
                {SECTION_TYPES.map((st) => {
                  const isSelected = sectionForm.type === st.type;
                  return (
                    <TouchableOpacity
                      key={st.type}
                      style={[
                        styles.typeChip,
                        isSelected && {
                          borderColor: theme.primary,
                          backgroundColor: theme.badgeBg,
                        },
                      ]}
                      onPress={() =>
                        setSectionForm((prev) => ({
                          ...prev,
                          type: st.type,
                          title: prev.title || st.label,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && { color: theme.text, fontWeight: '800' },
                        ]}
                      >
                        {st.icon} {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Title */}
              <Text style={styles.modalInputLabel}>SECTION TITLE</Text>
              <TextInput
                style={styles.modalInput}
                value={sectionForm.title}
                onChangeText={(text) =>
                  setSectionForm((prev) => ({ ...prev, title: text }))
                }
                placeholder="e.g. Featured Projects / Technical Expertise"
                placeholderTextColor="#64748b"
              />

              {/* Content Items */}
              {['services', 'products', 'rate_card', 'menu'].includes(sectionForm.type) ? (
                <View>
                  <Text style={styles.modalInputLabel}>
                    ITEMS / RATE CARD (Title | Price | Description)
                  </Text>
                  
                  {/* 1-Tap Quick Fill Presets */}
                  <View style={styles.templatePresetsContainer}>
                    <Text style={styles.templatePresetHintText}>⚡ 1-Tap Business Presets:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatePresetPillsRow}>
                      <TouchableOpacity
                        style={styles.templatePresetBtn}
                        onPress={() => {
                          setSectionForm((prev) => ({
                            ...prev,
                            title: prev.title || 'Salon & Spa Services',
                            itemsText: 'Haircut & Styling | ₹350 | Wash, cut and professional styling\nFacial & Glow Care | ₹799 | Herbal organic facial & head massage\nKeratin Hair Treatment | ₹1,499 | Deep hair repair and shine therapy\nBeard Grooming | ₹200 | Hot towel shape & beard oil massage',
                          }));
                          onShowToast('Loaded Salon Services template! ✨', 'info');
                        }}
                      >
                        <Text style={styles.templatePresetText}>💈 Salon Services</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.templatePresetBtn}
                        onPress={() => {
                          setSectionForm((prev) => ({
                            ...prev,
                            title: prev.title || 'Store Products & Catalog',
                            itemsText: 'Cotton Casual Shirt | ₹899 | 100% pure breathable cotton (Sizes M-XXL)\nStretch Denim Jeans | ₹1,299 | Slim fit durable premium wash\nLeather Formal Wallet | ₹499 | Genuine leather with RFID protection\nCasual Sneakers | ₹1,799 | Lightweight memory foam cushion',
                          }));
                          onShowToast('Loaded Store Catalog template! 🛍️', 'info');
                        }}
                      >
                        <Text style={styles.templatePresetText}>🛍️ Store Products</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.templatePresetBtn}
                        onPress={() => {
                          setSectionForm((prev) => ({
                            ...prev,
                            title: prev.title || 'Cafe & Food Menu',
                            itemsText: 'Artisan Cold Brew | ₹180 | Single origin arabica with vanilla foam\nGrilled Paneer Sandwich | ₹220 | Multi-grain sourdough with herb cheese\nBelgian Dark Chocolate Cake | ₹240 | 70% dark cocoa rich truffle slice\nFresh Fruit Smoothie | ₹190 | Banana, strawberry & almond milk',
                          }));
                          onShowToast('Loaded Cafe / Menu template! ☕', 'info');
                        }}
                      >
                        <Text style={styles.templatePresetText}>☕ Cafe / Food Menu</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.templatePresetBtn}
                        onPress={() => {
                          setSectionForm((prev) => ({
                            ...prev,
                            title: prev.title || 'Business Services & Rates',
                            itemsText: 'Business Consultation | ₹2,500/hr | Strategy, financial planning & audit\nGST & Company Registration | ₹4,999 | Complete startup documentation package\nMonthly Accounting & Tax | ₹3,000/mo | Bookkeeping and compliance filing',
                          }));
                          onShowToast('Loaded Business Consultation template! 💼', 'info');
                        }}
                      >
                        <Text style={styles.templatePresetText}>💼 Business Services</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>

                  <TextInput
                    style={[styles.modalInput, styles.modalBioInput, { height: 130 }]}
                    value={sectionForm.itemsText}
                    onChangeText={(text) =>
                      setSectionForm((prev) => ({ ...prev, itemsText: text }))
                    }
                    placeholder={'Haircut & Wash | ₹350 | Wash + Styling\nSkin Facial | ₹799 | Herbal facial\nBeard Trim | ₹150 | Sharp edge cut'}
                    placeholderTextColor="#64748b"
                    multiline
                  />
                  <Text style={styles.catalogSyntaxHint}>
                    💡 Format: Item Name | Price | Description (one per line)
                  </Text>
                </View>
              ) : ['skills'].includes(sectionForm.type) ? (
                <View>
                  <Text style={styles.modalInputLabel}>
                    ITEMS (COMMA SEPARATED)
                  </Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalBioInput]}
                    value={sectionForm.itemsText}
                    onChangeText={(text) =>
                      setSectionForm((prev) => ({ ...prev, itemsText: text }))
                    }
                    placeholder="React, TypeScript, GraphQL, System Design"
                    placeholderTextColor="#64748b"
                    multiline
                  />
                </View>
              ) : ['experience', 'portfolio', 'education'].includes(
                  sectionForm.type
                ) ? (
                <View>
                  <Text style={styles.modalInputLabel}>
                    ITEMS (ONE PER LINE: Title | Subtitle | Dates | Details)
                  </Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalBioInput]}
                    value={sectionForm.itemsText}
                    onChangeText={(text) =>
                      setSectionForm((prev) => ({ ...prev, itemsText: text }))
                    }
                    placeholder="MyProject | Web Demo | 2024 | Built responsive mobile UI"
                    placeholderTextColor="#64748b"
                    multiline
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.modalInputLabel}>SECTION TEXT CONTENT</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalBioInput]}
                    value={sectionForm.text}
                    onChangeText={(text) =>
                      setSectionForm((prev) => ({ ...prev, text }))
                    }
                    placeholder="Write detailed paragraphs or story..."
                    placeholderTextColor="#64748b"
                    multiline
                  />
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsSectionModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: theme.primary },
                  savingSection && styles.modalSaveBtnDisabled,
                ]}
                onPress={handleSaveSection}
                disabled={savingSection}
                activeOpacity={0.8}
              >
                {savingSection ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.modalSaveText}>
                    {editingSectionId ? 'Update Section' : 'Create Section'} ✓
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Identity Modal */}
      <Modal
        visible={isEditingProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditingProfile(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Customize Digital Profile</Text>
                <Text style={styles.modalSubtitle}>
                  Update personal identity, contact, & themes
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingProfile(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Profile Avatar Selection & Presets */}
              <Text style={styles.modalInputLabel}>PROFILE PHOTO / AVATAR</Text>
              <View style={styles.avatarPickerCard}>
                {/* Current Avatar Preview */}
                <View style={styles.avatarPreviewCenter}>
                  <View style={[styles.avatarPreviewWrapper, { borderColor: theme.primary }]}>
                    <Image
                      source={{
                        uri:
                          editForm.photoUrl ||
                          'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
                      }}
                      style={styles.avatarPreviewImage}
                    />
                    <View style={[styles.avatarActiveBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.avatarActiveBadgeText}>Live</Text>
                    </View>
                  </View>
                  <Text style={styles.avatarPreviewHint}>
                    Instant 1-Tap Avatar Presets or enter custom image URL below
                  </Text>
                </View>

                {/* 6 Curated Designer/Developer Avatar Presets */}
                <Text style={styles.presetsHeaderLabel}>6 CURATED DESIGNER & DEVELOPER PRESETS</Text>
                <View style={styles.presetsGrid}>
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = editForm.photoUrl === preset.url;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetChip,
                          isSelected && {
                            borderColor: theme.primary,
                            backgroundColor: theme.badgeBg,
                          },
                        ]}
                        onPress={() => {
                          setEditForm((prev) => ({ ...prev, photoUrl: preset.url }));
                          onShowToast(`Selected ${preset.label} avatar preset ✨`, 'info');
                        }}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                        <View style={styles.presetMeta}>
                          <Text style={styles.presetLabel} numberOfLines={1}>
                            {preset.icon} {preset.label}
                          </Text>
                          {isSelected && (
                            <Text style={[styles.presetSelectedTag, { color: theme.text }]}>
                              ✓ Selected
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Image URL Input */}
                <Text style={styles.customUrlLabel}>OR ENTER CUSTOM PHOTO URL</Text>
                <View style={styles.customUrlRow}>
                  <TextInput
                    style={styles.customUrlInput}
                    value={editForm.photoUrl}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, photoUrl: text }))
                    }
                    placeholder="https://images.unsplash.com/... or CDN link"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {editForm.photoUrl ? (
                    <TouchableOpacity
                      style={styles.clearUrlBtn}
                      onPress={() => setEditForm((prev) => ({ ...prev, photoUrl: '' }))}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearUrlText}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Full Name */}
              <Text style={styles.modalInputLabel}>FULL DISPLAY NAME</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.name}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, name: text }))
                }
                placeholder="e.g. Vikram Sharma"
                placeholderTextColor="#64748b"
              />

              {/* Username Handle */}
              <Text style={styles.modalInputLabel}>UNIQUE USERNAME / SLUG</Text>
              <View style={styles.modalHandleWrap}>
                <Text style={styles.modalHandlePrefix}>@</Text>
                <TextInput
                  style={styles.modalHandleInput}
                  value={editForm.username}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: text.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                    }))
                  }
                  placeholder="unique_username"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
              </View>

              {/* Role / Profile Type */}
              <Text style={styles.modalInputLabel}>PROFILE TYPE / PROFESSION</Text>
              <View style={styles.typeOptionsRow}>
                {PROFILE_TYPES.map((type) => {
                  const isSelected = editForm.profileType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        isSelected && {
                          borderColor: theme.primary,
                          backgroundColor: theme.badgeBg,
                        },
                      ]}
                      onPress={() =>
                        setEditForm((prev) => ({ ...prev, profileType: type }))
                      }
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && { color: theme.text, fontWeight: '800' },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Creator Verified Badge Selection */}
              <Text style={styles.modalInputLabel}>VERIFIED CREATOR BADGE</Text>
              <View style={styles.badgeSelectorGrid}>
                {[
                  { id: 'verified_pro', label: 'Verified Pro', icon: '🛡️' },
                  { id: 'top_creator', label: 'Top Creator', icon: '⭐' },
                  { id: 'verified_engineer', label: 'Verified Dev', icon: '⚡' },
                  { id: 'featured_artist', label: 'Featured Artist', icon: '🎨' },
                  { id: 'none', label: 'None', icon: '⚪' },
                ].map((b) => {
                  const isSelected = (editForm.verifiedBadge || 'verified_pro') === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.badgeOptionChip,
                        isSelected && {
                          borderColor: theme.primary,
                          backgroundColor: theme.badgeBg,
                        },
                      ]}
                      onPress={() => setEditForm((prev) => ({ ...prev, verifiedBadge: b.id }))}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.badgeOptionIcon}>{b.icon}</Text>
                      <Text
                        style={[
                          styles.badgeOptionText,
                          isSelected && { color: theme.text, fontWeight: '800' },
                        ]}
                      >
                        {b.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Location */}
              <Text style={styles.modalInputLabel}>LOCATION / CITY</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.city}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, city: text }))
                }
                placeholder="e.g. Mumbai, India"
                placeholderTextColor="#64748b"
              />

              {/* Bio */}
              <Text style={styles.modalInputLabel}>BIO / SUMMARY</Text>
              <TextInput
                style={[styles.modalInput, styles.modalBioInput]}
                value={editForm.bio}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, bio: text }))
                }
                placeholder="Short description of your skills, passion, or background..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />

              {/* Business & Store Details Section */}
              <View style={styles.modalSectionDividerHeader}>
                <Text style={styles.modalSectionDividerTitle}>🏪 STOREFRONT & BUSINESS SETUP</Text>
                <Text style={styles.modalSectionDividerSub}>
                  For Salons, Retail Stores, Supermarkets, Restaurants, Clinics & Businessmen
                </Text>
              </View>

              {/* Business Category Selection */}
              <Text style={styles.modalInputLabel}>BUSINESS / INDUSTRY CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryChipsScrollRow}>
                {BUSINESS_CATEGORIES.map((cat) => {
                  const isSelected = editForm.category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryChipOption,
                        isSelected && {
                          borderColor: theme.primary,
                          backgroundColor: theme.badgeBg,
                        },
                      ]}
                      onPress={() => setEditForm((prev) => ({ ...prev, category: cat.name }))}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryChipOptionText,
                          isSelected && { color: theme.text, fontWeight: '800' },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Sub-Category / Niche */}
              <Text style={styles.modalInputLabel}>SUB-CATEGORY / SPECIALTY</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.subCategory}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, subCategory: text }))
                }
                placeholder="e.g. Unisex Hair Salon, Organic Grocery, Fine Dining, Luxury Apparel"
                placeholderTextColor="#64748b"
              />

              {/* Business / Shop Name */}
              <Text style={styles.modalInputLabel}>SHOP / FIRM / BRAND NAME</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.businessName}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, businessName: text }))
                }
                placeholder="e.g. Royal Unisex Salon & Spa / Metro Mart"
                placeholderTextColor="#64748b"
              />

              {/* Business Tagline */}
              <Text style={styles.modalInputLabel}>BUSINESS TAGLINE / SLOGAN</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.tagline}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, tagline: text }))
                }
                placeholder="e.g. Premium Hair Styling & Skin Treatments at Best Prices"
                placeholderTextColor="#64748b"
              />

              {/* Operating Hours / Timing */}
              <Text style={styles.modalInputLabel}>OPERATING HOURS / TIMING</Text>
              <View style={styles.quickTimingRow}>
                {[
                  '9:00 AM - 9:00 PM (Daily)',
                  '10:00 AM - 8:30 PM (Mon-Sat)',
                  '11:00 AM - 11:00 PM',
                  '24/7 Open',
                ].map((presetTime) => (
                  <TouchableOpacity
                    key={presetTime}
                    style={styles.timingPresetBtn}
                    onPress={() => setEditForm((prev) => ({ ...prev, timing: presetTime }))}
                  >
                    <Text style={styles.timingPresetText}>{presetTime}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.modalInput}
                value={editForm.timing}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, timing: text }))
                }
                placeholder="e.g. 9:00 AM - 9:30 PM (Mon to Sun)"
                placeholderTextColor="#64748b"
              />

              {/* Physical Address */}
              <Text style={styles.modalInputLabel}>STORE / OFFICE PHYSICAL ADDRESS</Text>
              <TextInput
                style={[styles.modalInput, styles.modalBioInput, { height: 75 }]}
                value={editForm.address}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, address: text }))
                }
                placeholder="Shop No. 12, Ground Floor, Linking Road, Bandra West, Mumbai 400050"
                placeholderTextColor="#64748b"
                multiline
              />

              {/* Google Maps Location Link */}
              <Text style={styles.modalInputLabel}>GOOGLE MAPS LOCATION LINK</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.googleMapsUrl}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, googleMapsUrl: text }))
                }
                placeholder="https://maps.app.goo.gl/... or Google Maps place link"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              {/* WhatsApp Ordering / Support Number */}
              <Text style={styles.modalInputLabel}>WHATSAPP BUSINESS / ORDER NUMBER</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.whatsappNumber}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, whatsappNumber: text }))
                }
                placeholder="+919876543210 (Direct customer WhatsApp chat)"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />

              {/* Online Booking / Catalog / Menu Link */}
              <Text style={styles.modalInputLabel}>BOOKING / DIGITAL CATALOG LINK</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.bookingUrl}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, bookingUrl: text }))
                }
                placeholder="https://calendly.com/... or https://wa.me/catalog/..."
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              {/* UPI ID for Direct Customer Payment */}
              <Text style={styles.modalInputLabel}>UPI PAYMENT ID (GPay / PhonePe / Paytm)</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.upiId}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, upiId: text }))
                }
                placeholder="e.g. salonname@okhdfcbank or 9876543210@paytm"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              {/* GSTIN / Business Reg No */}
              <Text style={styles.modalInputLabel}>GSTIN / BUSINESS REGISTRATION NUMBER</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.gstNumber}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, gstNumber: text.toUpperCase() }))
                }
                placeholder="e.g. 27AAAAA0000A1Z5"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
              />

              {/* Personal / Account Contact Information */}
              <View style={styles.modalSectionDividerHeader}>
                <Text style={styles.modalSectionDividerTitle}>📱 PERSONAL & SOCIAL CONNECT</Text>
                <Text style={styles.modalSectionDividerSub}>Direct phone, email, and social profiles</Text>
              </View>

              {/* Contact Information */}
              <Text style={styles.modalInputLabel}>WHATSAPP NUMBER</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.whatsapp}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, whatsapp: text }))
                }
                placeholder="+919876543210"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />

              <Text style={styles.modalInputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.email}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, email: text }))
                }
                placeholder="your.email@example.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Social Channels */}
              <Text style={styles.modalInputLabel}>GITHUB URL</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.github}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, github: text }))
                }
                placeholder="https://github.com/yourhandle"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              <Text style={styles.modalInputLabel}>LINKEDIN URL</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.linkedin}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, linkedin: text }))
                }
                placeholder="https://linkedin.com/in/yourhandle"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              <Text style={styles.modalInputLabel}>TWITTER / X URL</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.twitter}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, twitter: text }))
                }
                placeholder="https://twitter.com/yourhandle"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              {/* Theme Selector */}
              <Text style={styles.modalInputLabel}>VISUAL THEME</Text>
              <View style={styles.themeOptionsRow}>
                {THEME_OPTIONS.map((t) => {
                  const isSelected = editForm.theme === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.themeChip,
                        isSelected && {
                          borderColor: t.color,
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        },
                      ]}
                      onPress={() =>
                        setEditForm((prev) => ({ ...prev, theme: t.key }))
                      }
                    >
                      <View
                        style={[styles.themeChipDot, { backgroundColor: t.color }]}
                      />
                      <Text
                        style={[
                          styles.themeChipText,
                          isSelected && { color: '#ffffff', fontWeight: '800' },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditingProfile(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: theme.primary },
                  savingEdit && styles.modalSaveBtnDisabled,
                ]}
                onPress={handleSaveProfileUpdates}
                disabled={savingEdit}
                activeOpacity={0.8}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Profile ✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. Create / Post Reel Modal */}
      <Modal
        visible={isCreateReelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateReelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🎬 Create & Publish Reel</Text>
                <Text style={styles.modalSubtitle}>
                  Publish a video post visible to everyone on your profile & the global feed
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCreateReelModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Quick Template Presets */}
              <Text style={styles.modalInputLabel}>QUICK DEMO TEMPLATES (1-TAP AUTO-FILL)</Text>
              <View style={styles.presetPillsScroll}>
                {REEL_PRESETS.map((preset, pIdx) => (
                  <TouchableOpacity
                    key={pIdx}
                    style={styles.presetPill}
                    onPress={() => applyReelPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetPillText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Caption */}
              <Text style={styles.modalInputLabel}>CAPTION & HASHTAGS</Text>
              <TextInput
                style={[styles.modalInput, styles.modalBioInput]}
                value={reelForm.caption}
                onChangeText={(text) =>
                  setReelForm((prev) => ({ ...prev, caption: text }))
                }
                placeholder="What are you showcasing? (e.g. Building next-gen mobile experience with dark neon UI #tech #dev)"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
              />

              {/* Video URL */}
              <Text style={styles.modalInputLabel}>VIDEO STREAM / MEDIA URL (MP4 / HTTPS)</Text>
              <TextInput
                style={styles.modalInput}
                value={reelForm.videoUrl}
                onChangeText={(text) =>
                  setReelForm((prev) => ({ ...prev, videoUrl: text }))
                }
                placeholder="https://example.com/video.mp4"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              {/* Thumbnail URL */}
              <Text style={styles.modalInputLabel}>COVER / POSTER IMAGE URL (OPTIONAL)</Text>
              <TextInput
                style={styles.modalInput}
                value={reelForm.thumbnailUrl}
                onChangeText={(text) =>
                  setReelForm((prev) => ({ ...prev, thumbnailUrl: text }))
                }
                placeholder="https://images.unsplash.com/photo-..."
                placeholderTextColor="#64748b"
                autoCapitalize="none"
              />

              {/* Duration Pills */}
              <Text style={styles.modalInputLabel}>DURATION</Text>
              <View style={styles.durationOptionsRow}>
                {[15, 30, 45, 60].map((dur) => {
                  const isSel = reelForm.durationSeconds === dur;
                  return (
                    <TouchableOpacity
                      key={dur}
                      style={[
                        styles.durationPillOption,
                        isSel && {
                          borderColor: theme.primary,
                          backgroundColor: theme.badgeBg,
                        },
                      ]}
                      onPress={() =>
                        setReelForm((prev) => ({ ...prev, durationSeconds: dur }))
                      }
                    >
                      <Text
                        style={[
                          styles.durationPillOptionText,
                          isSel && { color: theme.text, fontWeight: '800' },
                        ]}
                      >
                        ⏱️ {dur} Seconds
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Visibility note */}
              <View style={styles.visibilityNoteBox}>
                <Text style={styles.visibilityNoteEmoji}>🌐</Text>
                <Text style={styles.visibilityNoteText}>
                  This post will be Public and visible on your profile page and in the Community Reels Feed.
                </Text>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsCreateReelModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: theme.primary },
                  savingReel && styles.modalSaveBtnDisabled,
                ]}
                onPress={handleSaveReel}
                disabled={savingReel}
                activeOpacity={0.8}
              >
                {savingReel ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.modalSaveText}>Publish Reel 🚀</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Interactive Reel Viewer / Player Modal */}
      <Modal
        visible={!!activeViewingReel}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveViewingReel(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.reelPlayerModalContainer}>
            {/* Header */}
            <View style={styles.reelPlayerHeader}>
              <View style={styles.reelPlayerCreatorInfo}>
                <Image
                  source={{
                    uri:
                      profile.photoUrl ||
                      'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
                  }}
                  style={[styles.reelPlayerAvatar, { borderColor: theme.primary }]}
                />
                <View>
                  <Text style={styles.reelPlayerName}>{profile.name}</Text>
                  <Text style={[styles.reelPlayerUsername, { color: theme.text }]}>
                    @{profile.username}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setActiveViewingReel(null)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Video / Cover Media Canvas */}
            <TouchableOpacity
              style={styles.reelPlayerMediaWrapper}
              activeOpacity={0.9}
              onPress={() => setViewingReelPlaying((prev) => !prev)}
            >
              <Image
                source={{
                  uri:
                    activeViewingReel?.thumbnailUrl ||
                    activeViewingReel?.videoUrl ||
                    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
                }}
                style={styles.reelPlayerMediaImg}
                resizeMode="cover"
              />
              <View style={styles.reelPlayerMediaVignette} />

              {/* Play / Pause Toggle Badge */}
              <View style={styles.reelPlayerPlayPauseOverlay}>
                <View style={styles.reelPlayerPlayCircle}>
                  <Text style={styles.reelPlayerPlayIcon}>
                    {viewingReelPlaying ? '▶ Playing' : '⏸ Paused'}
                  </Text>
                </View>
              </View>

              {/* Duration Tag */}
              <View style={styles.reelPlayerDurationBadge}>
                <Text style={styles.reelPlayerDurationText}>
                  ⏱️ {activeViewingReel?.durationSeconds ? `${activeViewingReel.durationSeconds}s` : '15s'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Caption & Metadata */}
            <View style={styles.reelPlayerBottomContent}>
              <Text style={styles.reelPlayerCaption}>
                {activeViewingReel?.caption || 'Video demonstration and showcase.'}
              </Text>

              <View style={styles.reelPlayerStatsRow}>
                <View style={styles.reelPlayerStatBadge}>
                  <Text style={styles.reelPlayerStatEmoji}>❤️</Text>
                  <Text style={styles.reelPlayerStatText}>
                    {activeViewingReel?.likesCount || 0} Likes
                  </Text>
                </View>
                <View style={styles.reelPlayerStatBadge}>
                  <Text style={styles.reelPlayerStatEmoji}>👁️</Text>
                  <Text style={styles.reelPlayerStatText}>
                    {activeViewingReel?.viewsCount || 0} Views
                  </Text>
                </View>
              </View>

              {/* Audio Track Tag in Player */}
              {activeViewingReel?.audioTrack?.title ? (
                <View style={styles.reelPlayerAudioBadge}>
                  <Text style={styles.reelPlayerAudioText} numberOfLines={1}>
                    🎵 {activeViewingReel.audioTrack.title} • {activeViewingReel.audioTrack.artist || profile.name}
                  </Text>
                </View>
              ) : null}

              {/* Engagement & Action Buttons */}
              <View style={styles.reelPlayerActionsRow}>
                {/* Like Button */}
                <TouchableOpacity
                  style={[styles.reelPlayerActionBtn, styles.reelPlayerLikeBtn]}
                  onPress={() => activeViewingReel && handleReelLike(activeViewingReel)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reelPlayerActionEmoji}>❤️</Text>
                  <Text style={styles.reelPlayerLikeText}>Like</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity
                  style={[styles.reelPlayerActionBtn, styles.reelPlayerShareBtn]}
                  onPress={() => activeViewingReel && handleReelShare(activeViewingReel)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reelPlayerActionEmoji}>↗️</Text>
                  <Text style={styles.reelPlayerShareText}>Share</Text>
                </TouchableOpacity>

                {/* Pin / Unpin Master Pitch (Owner only) */}
                {isOwner && onTogglePinReel && activeViewingReel && (
                  <TouchableOpacity
                    style={[
                      styles.reelPlayerActionBtn,
                      styles.reelPlayerPinBtn,
                      activeViewingReel.isPinned && styles.reelPlayerPinBtnActive,
                    ]}
                    onPress={() => {
                      onTogglePinReel(activeViewingReel._id);
                      setActiveViewingReel((prev) =>
                        prev ? { ...prev, isPinned: !prev.isPinned } : null
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reelPlayerActionEmoji}>
                      {activeViewingReel.isPinned ? '📌' : '📍'}
                    </Text>
                    <Text
                      style={[
                        styles.reelPlayerPinText,
                        activeViewingReel.isPinned && { color: '#fbbf24', fontWeight: '800' },
                      ]}
                    >
                      {activeViewingReel.isPinned ? 'Pinned' : 'Pin Master'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Open in Full Feed */}
                <TouchableOpacity
                  style={[styles.reelPlayerActionBtn, styles.reelPlayerFeedBtn]}
                  onPress={() => {
                    setActiveViewingReel(null);
                    onSelectReelsTab();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reelPlayerActionEmoji}>🎬</Text>
                  <Text style={styles.reelPlayerFeedText}>Feed</Text>
                </TouchableOpacity>

                {/* Delete (Owner only) */}
                {isOwner && (
                  <TouchableOpacity
                    style={[styles.reelPlayerActionBtn, styles.reelPlayerDeleteBtn]}
                    onPress={() => activeViewingReel && handleReelDelete(activeViewingReel._id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reelPlayerActionEmoji}>🗑️</Text>
                    <Text style={styles.reelPlayerDeleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Visitor Send Proposal / Inquiry Modal */}
      <Modal
        visible={isInquiryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsInquiryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>💼 Hire & Collaborate</Text>
                <Text style={styles.modalSubtitle}>
                  Send a direct proposal or inquiry to @{profile.username}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsInquiryModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Sender Name */}
              <Text style={styles.modalInputLabel}>YOUR FULL NAME *</Text>
              <TextInput
                style={styles.modalInput}
                value={inquiryForm.senderName}
                onChangeText={(text) =>
                  setInquiryForm((prev) => ({ ...prev, senderName: text }))
                }
                placeholder="e.g. Priya Patel"
                placeholderTextColor="#64748b"
              />

              {/* Sender Email */}
              <Text style={styles.modalInputLabel}>YOUR EMAIL ADDRESS *</Text>
              <TextInput
                style={styles.modalInput}
                value={inquiryForm.senderEmail}
                onChangeText={(text) =>
                  setInquiryForm((prev) => ({ ...prev, senderEmail: text }))
                }
                placeholder="priya@company.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Sender Phone */}
              <Text style={styles.modalInputLabel}>PHONE / WHATSAPP (OPTIONAL)</Text>
              <TextInput
                style={styles.modalInput}
                value={inquiryForm.senderPhone}
                onChangeText={(text) =>
                  setInquiryForm((prev) => ({ ...prev, senderPhone: text }))
                }
                placeholder="+919876543210"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />

              {/* Subject / Project Category */}
              <Text style={styles.modalInputLabel}>PROJECT CATEGORY / INQUIRY TYPE</Text>
              <View style={styles.inquirySubjectGrid}>
                {INQUIRY_SUBJECT_PRESETS.map((subj) => {
                  const isSelected = inquiryForm.subject === subj;
                  return (
                    <TouchableOpacity
                      key={subj}
                      style={[
                        styles.inquirySubjectChip,
                        isSelected && {
                          borderColor: theme.primary,
                          backgroundColor: theme.badgeBg,
                        },
                      ]}
                      onPress={() =>
                        setInquiryForm((prev) => ({ ...prev, subject: subj }))
                      }
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.inquirySubjectText,
                          isSelected && { color: theme.text, fontWeight: '800' },
                        ]}
                      >
                        {subj}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Project Scope / Message */}
              <Text style={styles.modalInputLabel}>PROJECT DETAILS / MESSAGE *</Text>
              <TextInput
                style={[styles.modalInput, styles.inquiryMsgInput]}
                value={inquiryForm.message}
                onChangeText={(text) =>
                  setInquiryForm((prev) => ({ ...prev, message: text }))
                }
                placeholder="Describe your project, timeline, deliverables, or proposed compensation..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
              />

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsInquiryModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: theme.primary },
                  sendingInquiry && styles.modalSaveBtnDisabled,
                ]}
                onPress={handleSendInquirySubmit}
                disabled={sendingInquiry}
                activeOpacity={0.8}
              >
                {sendingInquiry ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.modalSaveText}>Send Proposal 🚀</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. Creator Inquiries Inbox Modal */}
      <Modal
        visible={isInboxModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsInboxModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <View style={styles.inboxModalTitleRow}>
                  <Text style={styles.modalTitle}>📬 Inquiries Inbox</Text>
                  {unreadInquiriesCount > 0 && (
                    <View style={styles.inboxModalBadge}>
                      <Text style={styles.inboxModalBadgeText}>
                        {unreadInquiriesCount} Unread
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalSubtitle}>
                  Direct proposals and job requests from profile visitors
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsInboxModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Inbox Filter Tabs */}
            <View style={styles.inboxFilterRow}>
              {[
                { key: 'all', label: `All (${inquiries.length})` },
                { key: 'unread', label: `Unread (${unreadInquiriesCount})` },
                {
                  key: 'read',
                  label: `Read (${inquiries.filter((i) => i.status === 'read').length})`,
                },
                {
                  key: 'replied',
                  label: `Replied (${inquiries.filter((i) => i.status === 'replied').length})`,
                },
              ].map((tab) => {
                const isActive = inboxFilter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.inboxFilterTab,
                      isActive && {
                        borderColor: theme.primary,
                        backgroundColor: theme.badgeBg,
                      },
                    ]}
                    onPress={() => setInboxFilter(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.inboxFilterTabText,
                        isActive && { color: theme.text, fontWeight: '800' },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Inquiries List */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {(() => {
                const filtered = inquiries.filter((inq) => {
                  if (inboxFilter === 'unread') return inq.status === 'unread';
                  if (inboxFilter === 'read') return inq.status === 'read';
                  if (inboxFilter === 'replied') return inq.status === 'replied';
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <View style={styles.emptyInboxContainer}>
                      <Text style={styles.emptyInboxEmoji}>📭</Text>
                      <Text style={styles.emptyInboxTitle}>
                        {inboxFilter === 'unread'
                          ? 'No Unread Inquiries'
                          : inboxFilter === 'replied'
                          ? 'No Replied Inquiries Yet'
                          : 'No Proposals Received Yet'}
                      </Text>
                      <Text style={styles.emptyInboxSub}>
                        {inboxFilter === 'unread'
                          ? 'All incoming inquiries have been reviewed and marked as read!'
                          : inboxFilter === 'replied'
                          ? 'Inquiries you respond to using the in-app reply composer will appear here.'
                          : 'When visitors tap "Hire Me / Send Inquiry" on your profile, their messages will appear here.'}
                      </Text>
                    </View>
                  );
                }

                return filtered.map((inq) => {
                  const isReplied = inq.status === 'replied';
                  const isUnread = inq.status === 'unread';
                  const dateStr = inq.createdAt
                    ? new Date(inq.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  return (
                    <View
                      key={inq._id}
                      style={[
                        styles.inquiryCard,
                        isUnread && styles.inquiryCardUnread,
                      ]}
                    >
                      {/* Inquiry Top Row */}
                      <View style={styles.inquiryCardTop}>
                        <View style={styles.inquirySenderCol}>
                          <View style={styles.inquirySenderHeader}>
                            <View style={styles.inquiryAvatarCircle}>
                              <Text style={styles.inquiryAvatarInitial}>
                                {(inq.senderName || 'C')[0].toUpperCase()}
                              </Text>
                            </View>
                            <View>
                              <Text style={styles.inquirySenderName}>
                                {inq.senderName}
                              </Text>
                              <Text style={styles.inquirySenderMeta}>
                                {inq.senderEmail}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.inquiryMetaCol}>
                          <View
                            style={[
                              styles.inquiryStatusPill,
                              isReplied
                                ? styles.pillReplied
                                : isUnread
                                ? styles.pillUnread
                                : styles.pillRead,
                            ]}
                          >
                            <Text
                              style={[
                                styles.inquiryStatusText,
                                isReplied
                                  ? styles.pillTextReplied
                                  : isUnread
                                  ? styles.pillTextUnread
                                  : styles.pillTextRead,
                              ]}
                            >
                              {isReplied ? '✓ REPLIED' : isUnread ? '● NEW' : '✓ READ'}
                            </Text>
                          </View>
                          <Text style={styles.inquiryDateText}>{dateStr}</Text>
                        </View>
                      </View>

                      {/* Subject Badge */}
                      <View style={styles.inquirySubjectRow}>
                        <View style={styles.inquirySubjectPill}>
                          <Text style={styles.inquirySubjectPillText}>
                            {inq.subject || '💼 Job Inquiry'}
                          </Text>
                        </View>
                        {inq.senderPhone ? (
                          <Text style={styles.inquiryPhoneText}>
                            📞 {inq.senderPhone}
                          </Text>
                        ) : null}
                      </View>

                      {/* Message Content */}
                      <Text style={styles.inquiryMessageBody}>
                        {inq.message}
                      </Text>

                      {/* Conversation History / Replies Thread */}
                      {inq.replies && inq.replies.length > 0 && (
                        <View style={styles.repliesThreadContainer}>
                          <Text style={styles.repliesThreadHeader}>
                            CONVERSATION HISTORY ({inq.replies.length})
                          </Text>
                          {inq.replies.map((rep, rIdx) => (
                            <View key={rep._id || rIdx} style={styles.replyBubble}>
                              <View style={styles.replyBubbleMetaRow}>
                                <Text style={styles.replySenderTag}>
                                  {rep.senderRole === 'creator'
                                    ? '👤 You (Creator)'
                                    : 'Visitor'}
                                </Text>
                                <Text style={styles.replyTimeText}>
                                  {rep.createdAt
                                    ? new Date(rep.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : ''}
                                </Text>
                              </View>
                              <Text style={styles.replyMessageText}>{rep.message}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Action Bar */}
                      <View style={styles.inquiryActionsRow}>
                        {onReplyInquiry && (
                          <TouchableOpacity
                            style={[
                              styles.inquiryActionReplyBtn,
                              activeReplyInquiryId === inq._id &&
                                styles.inquiryActionReplyBtnActive,
                            ]}
                            onPress={() => {
                              setActiveReplyInquiryId(
                                activeReplyInquiryId === inq._id ? null : inq._id
                              );
                              setReplyInputText('');
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.inquiryActionReplyText}>
                              {activeReplyInquiryId === inq._id
                                ? '✕ Cancel'
                                : '💬 In-App Reply'}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {inq.senderEmail ? (
                          <TouchableOpacity
                            style={styles.inquiryActionEmailBtn}
                            onPress={() =>
                              Linking.openURL(
                                `mailto:${inq.senderEmail}?subject=Re: ${encodeURIComponent(
                                  inq.subject || 'Proposal'
                                )}`
                              )
                            }
                            activeOpacity={0.7}
                          >
                            <Text style={styles.inquiryActionEmailText}>
                              ✉️ Email
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {inq.senderPhone ? (
                          <TouchableOpacity
                            style={styles.inquiryActionWaBtn}
                            onPress={() => {
                              const clean = inq.senderPhone.replace(/[^0-9]/g, '');
                              Linking.openURL(`https://wa.me/${clean}`);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.inquiryActionWaText}>
                              💬 WhatsApp
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                          style={styles.inquiryToggleStatusBtn}
                          onPress={() => {
                            if (onUpdateInquiryStatus) {
                              onUpdateInquiryStatus(
                                inq._id,
                                isUnread ? 'read' : 'unread'
                              );
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.inquiryToggleStatusText}>
                            {isUnread ? 'Mark Read ✓' : 'Mark Unread'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* In-App Reply Composer Box */}
                      {activeReplyInquiryId === inq._id && (
                        <View style={styles.replyComposerBox}>
                          <TextInput
                            style={styles.replyComposerInput}
                            value={replyInputText}
                            onChangeText={setReplyInputText}
                            placeholder={`Reply directly to ${inq.senderName}...`}
                            placeholderTextColor="#64748b"
                            multiline
                            numberOfLines={3}
                          />
                          <TouchableOpacity
                            style={[
                              styles.sendReplySubmitBtn,
                              { backgroundColor: theme.primary },
                              sendingReply && { opacity: 0.6 },
                            ]}
                            onPress={() => handleSendReply(inq._id)}
                            disabled={sendingReply}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.sendReplySubmitText}>
                              {sendingReply ? 'Sending...' : 'Send Reply 🚀'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                });
              })()}

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsInboxModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Close Inbox</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Real-Time Activity & Notifications Hub Modal */}
      <Modal
        visible={isNotificationsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNotificationsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <View style={styles.inboxModalTitleRow}>
                  <Text style={styles.modalTitle}>🔔 Activity Hub</Text>
                  {unreadNotificationsCount > 0 && (
                    <View
                      style={[
                        styles.inboxModalBadge,
                        {
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          borderColor: 'rgba(56, 189, 248, 0.4)',
                        },
                      ]}
                    >
                      <Text style={[styles.inboxModalBadgeText, { color: '#38bdf8' }]}>
                        {unreadNotificationsCount} New
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalSubtitle}>
                  Real-time likes, saves, skill vouches, inquiries, and follows
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsNotificationsModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Top Action Bar: Refresh & Mark All as Read */}
            <View style={styles.notifTopActionsRow}>
              <TouchableOpacity
                style={styles.notifRefreshBtn}
                onPress={onRefreshNotifications}
                disabled={loadingNotifications}
                activeOpacity={0.7}
              >
                {loadingNotifications ? (
                  <ActivityIndicator size="small" color="#38bdf8" />
                ) : (
                  <Text style={styles.notifRefreshText}>🔄 Refresh</Text>
                )}
              </TouchableOpacity>

              {unreadNotificationsCount > 0 && onMarkAllNotificationsRead && (
                <TouchableOpacity
                  style={styles.markAllReadBtn}
                  onPress={onMarkAllNotificationsRead}
                  activeOpacity={0.8}
                >
                  <Text style={styles.markAllReadText}>✓ Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.inboxFilterRow}>
              {[
                { key: 'all', label: `All (${notifications.length})` },
                {
                  key: 'likes',
                  label: `❤️ Reactions (${notifications.filter((n) => n.type === 'like' || n.type === 'bookmark').length})`,
                },
                {
                  key: 'inquiries',
                  label: `💼 Inquiries (${notifications.filter((n) => n.type === 'inquiry' || n.type === 'reply').length})`,
                },
                {
                  key: 'vouches',
                  label: `⭐ Vouches (${notifications.filter((n) => n.type === 'vouch').length})`,
                },
              ].map((tab) => {
                const isActive = notifFilter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.inboxFilterTab,
                      isActive && {
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      },
                    ]}
                    onPress={() => setNotifFilter(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.inboxFilterTabText,
                        isActive && { color: '#38bdf8', fontWeight: '800' },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notifications List */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {(() => {
                const filtered = notifications.filter((item) => {
                  if (notifFilter === 'likes') return item.type === 'like' || item.type === 'bookmark';
                  if (notifFilter === 'inquiries') return item.type === 'inquiry' || item.type === 'reply';
                  if (notifFilter === 'vouches') return item.type === 'vouch';
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <View style={styles.emptyInboxBox}>
                      <Text style={styles.emptyInboxEmoji}>🔔</Text>
                      <Text style={styles.emptyInboxTitle}>No Activity Yet</Text>
                      <Text style={styles.emptyInboxSub}>
                        {notifFilter === 'all'
                          ? 'When people like your reels, vouch for your skills, or send inquiries, you will see notifications here in real time.'
                          : `No notifications found under the "${notifFilter}" filter.`}
                      </Text>
                    </View>
                  );
                }

                return filtered.map((notif) => {
                  const isUnread = !notif.read;
                  const actor = notif.actorProfileId;
                  const actorName = actor?.name || 'Someone';
                  const actorAvatar =
                    actor?.photoUrl ||
                    'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256';
                  const iconByType =
                    {
                      like: '❤️',
                      bookmark: '🔖',
                      vouch: '⭐',
                      inquiry: '💼',
                      reply: '💬',
                      follow: '👥',
                    }[notif.type] || '🔔';

                  const timeStr = notif.createdAt
                    ? new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  return (
                    <TouchableOpacity
                      key={notif._id}
                      style={[
                        styles.notifCard,
                        isUnread && styles.notifCardUnread,
                      ]}
                      onPress={() => {
                        if (isUnread && onMarkNotificationRead) {
                          onMarkNotificationRead(notif._id);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.notifAvatarBox}>
                        <Image source={{ uri: actorAvatar }} style={styles.notifAvatar} />
                        <View style={styles.notifTypeBadge}>
                          <Text style={styles.notifTypeBadgeEmoji}>{iconByType}</Text>
                        </View>
                      </View>

                      <View style={styles.notifContentCol}>
                        <View style={styles.notifHeaderRow}>
                          <Text style={styles.notifTitle} numberOfLines={1}>
                            {notif.title}
                          </Text>
                          <Text style={styles.notifTime}>{timeStr}</Text>
                        </View>

                        <Text style={styles.notifMessage} numberOfLines={2}>
                          {notif.message}
                        </Text>

                        {isUnread && (
                          <View style={styles.notifUnreadRow}>
                            <View style={styles.notifUnreadDot} />
                            <Text style={styles.notifUnreadTag}>New • Tap to mark read</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
              <View style={{ height: 24 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsNotificationsModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Close Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#020617',
    fontWeight: '800',
    fontSize: 13,
  },
  heroBanner: {
    height: 110,
    backgroundColor: '#090e1a',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    top: -40,
    left: width / 2 - 120,
    width: 240,
    height: 180,
    borderRadius: 120,
    opacity: 0.6,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: -55,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    backgroundColor: '#1e293b',
  },
  verifiedSparkle: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  sparkleIcon: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  handleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  handleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  cityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  bioCard: {
    width: '100%',
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  bioText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  /* Visitor Action Strip & Follow Button */
  visitorActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 14,
  },
  profileFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  profileFollowingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  profileFollowBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  profileFollowingBtnText: {
    color: '#f1f5f9',
  },
  hireMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  hireMeButtonEmoji: {
    fontSize: 16,
  },
  hireMeButtonTextCol: {
    flex: 1,
  },
  hireMeButtonTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  hireMeButtonSub: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 1,
  },
  hireMeButtonArrow: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  actionStrip: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  primaryActionBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryActionIcon: {
    fontSize: 14,
  },
  primaryActionText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 13,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
  },
  secondaryActionIcon: {
    fontSize: 13,
  },
  secondaryActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  /* Direct Connect Quick Actions */
  quickConnectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  connectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  connectChipIcon: {
    fontSize: 12,
  },
  connectChipText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  /* Social Links */
  socialCluster: {
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  socialHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  socialChipIcon: {
    fontSize: 12,
  },
  socialChipText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  /* Reels Teaser */
  reelsTeaserCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reelsTeaserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionEmoji: {
    fontSize: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reelsTeaserSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  /* Sections Container */
  sectionsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  sectionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionsMainTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  sectionsCount: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  addSectionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addSectionBtnText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '900',
  },
  noSectionsBox: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  noSectionsText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  addFirstSecBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  addFirstSecText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionCardIcon: {
    fontSize: 15,
  },
  sectionHeaderTexts: {
    flex: 1,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionTypeTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionActionBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  secEditBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  secEditBtnText: {
    fontSize: 11,
  },
  secDeleteBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  secDeleteBtnText: {
    fontSize: 11,
  },
  sectionIndexBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectionIndexText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  sectionBodyText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 19,
  },
  /* Portfolio Grid */
  portfolioGrid: {
    gap: 10,
  },
  portfolioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  portfolioTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  portfolioDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
    marginBottom: 6,
  },
  projectLinkBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  projectLinkText: {
    fontSize: 11,
    fontWeight: '800',
  },
  /* Structured Items */
  structuredItemsContainer: {
    gap: 10,
  },
  structuredItemCard: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
  },
  structuredItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  structuredItemSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 3,
  },
  structuredItemDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  /* Skills Pills */
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  removeSkillBadge: {
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: '900',
  },
  inlineSkillAddRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  inlineSkillInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#ffffff',
    fontSize: 12,
  },
  inlineSkillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
  },
  inlineSkillBtnText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '900',
  },
  /* Top Isolation Banners */
  guestBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  guestBannerLeft: {
    flex: 1,
  },
  guestTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  guestTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.6,
  },
  guestTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  guestSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 15,
  },
  guestActionBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  guestActionBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 12,
  },
  visitingBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visitingTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 0.6,
  },
  visitingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  backToMineBtn: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backToMineBtnText: {
    color: '#020617',
    fontWeight: '800',
    fontSize: 11,
  },
  ownerControlStrip: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'column',
    gap: 8,
  },
  ownerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ownerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  ownerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  ownerStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  ownerActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  ownerEditBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  ownerSignOutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  ownerSignOutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f43f5e',
  },
  /* QR Code Modal */
  qrModalCard: {
    backgroundColor: '#090d16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    width: width - 40,
    alignItems: 'center',
  },
  qrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  qrModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 14,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrPlaceholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrPlaceholderText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  qrUsername: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  qrSub: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 16,
  },
  qrActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  qrActionPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrActionPrimaryText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 13,
  },
  qrActionSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  qrActionSecondaryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  /* General Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#090d16',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '88%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  modalHandleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  modalHandlePrefix: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    marginRight: 4,
  },
  modalHandleInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  modalBioInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  typeOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  themeOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 6,
  },
  themeChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  modalSaveBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#020617',
  },
  /* Reels Showcase Section */
  reelsShowcaseContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  reelsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reelsHeaderTitleCol: {
    flex: 1,
  },
  reelsTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reelsSectionEmoji: {
    fontSize: 18,
  },
  reelsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  reelsCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reelsCountPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reelsSectionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  reelsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postReelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  postReelBtnText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '800',
  },
  reelsFeedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  reelsFeedBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyReelsCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyReelsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyReelsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  emptyReelsSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  postFirstReelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  postFirstReelText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reelsHorizontalScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  reelPreviewCard: {
    width: 170,
    height: 250,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reelPreviewImg: {
    width: '100%',
    height: '100%',
  },
  reelPreviewGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 7, 18, 0.45)',
  },
  reelCardTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  durationPillText: {
    color: '#f1f5f9',
    fontSize: 10,
    fontWeight: '700',
  },
  reelNumberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reelNumberText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '800',
  },
  reelPlayRing: {
    position: 'absolute',
    top: '38%',
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  reelPlayIcon: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 2,
  },
  reelCardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
  },
  reelCardCaption: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    marginBottom: 6,
  },
  reelEngagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reelEngagementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reelEngagementEmoji: {
    fontSize: 10,
  },
  reelEngagementCount: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '700',
  },
  reelShareMiniBtn: {
    padding: 2,
  },
  reelShareMiniText: {
    fontSize: 11,
  },
  presetPillsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  presetPillText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
  },
  durationOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  durationPillOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  durationPillOptionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  visibilityNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  visibilityNoteEmoji: {
    fontSize: 14,
  },
  visibilityNoteText: {
    flex: 1,
    color: '#6ee7b7',
    fontSize: 11,
    lineHeight: 15,
  },
  /* Reel Player Modal */
  reelPlayerModalContainer: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#090d16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 16,
  },
  reelPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  reelPlayerCreatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reelPlayerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
  },
  reelPlayerName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  reelPlayerUsername: {
    fontSize: 11,
    fontWeight: '600',
  },
  reelPlayerMediaWrapper: {
    width: '100%',
    height: 320,
    position: 'relative',
    backgroundColor: '#020617',
  },
  reelPlayerMediaImg: {
    width: '100%',
    height: '100%',
  },
  reelPlayerMediaVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 7, 18, 0.25)',
  },
  reelPlayerPlayPauseOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  reelPlayerPlayCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reelPlayerPlayIcon: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  reelPlayerDurationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reelPlayerDurationText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '700',
  },
  reelPlayerBottomContent: {
    padding: 16,
  },
  reelPlayerCaption: {
    color: '#f1f5f9',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 12,
  },
  reelPlayerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  reelPlayerStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reelPlayerStatEmoji: {
    fontSize: 12,
  },
  reelPlayerStatText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  reelPlayerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  reelPlayerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  reelPlayerActionEmoji: {
    fontSize: 13,
  },
  reelPlayerLikeBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  reelPlayerLikeText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '800',
  },
  reelPlayerShareBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  reelPlayerShareText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '800',
  },
  reelPlayerFeedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  reelPlayerFeedText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  reelPlayerDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  reelPlayerDeleteText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '800',
  },

  // Owner Inquiries Button in control strip
  ownerInquiriesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  ownerInquiriesBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  ownerNotificationsBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  ownerInquiriesEmoji: {
    fontSize: 13,
  },
  ownerInquiriesText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  unreadDotBadge: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },

  // Visitor Hire Me CTA Button
  hireMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    gap: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  hireMeButtonEmoji: {
    fontSize: 22,
  },
  hireMeButtonTextCol: {
    flex: 1,
  },
  hireMeButtonTitle: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  hireMeButtonSub: {
    color: '#064e3b',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  hireMeButtonArrow: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '900',
  },

  // Creator Performance Analytics Dashboard Card
  analyticsCard: {
    backgroundColor: '#0b1329',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsHeaderLeft: {
    flex: 1,
  },
  analyticsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyticsIcon: {
    fontSize: 18,
  },
  analyticsTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  livePulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  livePulseText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  analyticsSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  analyticsRefreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  analyticsRefreshText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // 4 Stat Tiles Grid
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  analyticsTile: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
  },
  analyticsTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  analyticsTileEmoji: {
    fontSize: 14,
  },
  analyticsTileLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  analyticsTileValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  analyticsTileSub: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },

  // 7-Day Trend Chart
  trendChartSection: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    marginBottom: 14,
  },
  trendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  trendTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
  },
  trendTotalBadge: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 105,
    paddingTop: 10,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartValText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  barTrack: {
    width: 22,
    height: 70,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  chartDayText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Inquiries CTA Banner inside Analytics
  inboxBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  inboxBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  inboxBannerEmoji: {
    fontSize: 20,
  },
  inboxBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  inboxBannerSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  inboxBadgeRow: {
    marginLeft: 10,
  },
  unreadCountPill: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unreadCountPillText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '900',
  },
  allReadPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allReadPillText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },

  // Avatar Picker in Edit Profile Modal
  avatarPickerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 16,
  },
  avatarPreviewCenter: {
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarPreviewWrapper: {
    position: 'relative',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    padding: 2,
    backgroundColor: '#0f172a',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarActiveBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#020617',
  },
  avatarActiveBadgeText: {
    color: '#020617',
    fontSize: 9,
    fontWeight: '900',
  },
  avatarPreviewHint: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  presetsHeaderLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
  },
  presetMeta: {
    flex: 1,
  },
  presetLabel: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  presetSelectedTag: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  customUrlLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  customUrlRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  customUrlInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    paddingRight: 34,
  },
  clearUrlBtn: {
    position: 'absolute',
    right: 10,
    padding: 4,
  },
  clearUrlText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },

  // Send Inquiry Modal Styles
  inquirySubjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  inquirySubjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inquirySubjectText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  inquiryMsgInput: {
    height: 90,
    textAlignVertical: 'top',
  },

  // Inquiries Inbox Modal Styles
  inboxModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inboxModalBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inboxModalBadgeText: {
    color: '#020617',
    fontSize: 10,
    fontWeight: '900',
  },
  inboxFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  inboxFilterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inboxFilterTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyInboxContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyInboxEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyInboxTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyInboxSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  inquiryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  inquiryCardUnread: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  inquiryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  inquirySenderCol: {
    flex: 1,
  },
  inquirySenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inquiryAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquiryAvatarInitial: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  inquirySenderName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
  },
  inquirySenderMeta: {
    color: '#94a3b8',
    fontSize: 11,
  },
  inquiryMetaCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  inquiryStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillUnread: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  pillRead: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inquiryStatusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  pillTextUnread: {
    color: '#fbbf24',
  },
  pillTextRead: {
    color: '#94a3b8',
  },
  inquiryDateText: {
    color: '#64748b',
    fontSize: 10,
  },
  inquirySubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inquirySubjectPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  inquirySubjectPillText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  inquiryPhoneText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  inquiryMessageBody: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  inquiryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inquiryActionEmailBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inquiryActionEmailText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },
  inquiryActionWaBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inquiryActionWaText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  inquiryToggleStatusBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  inquiryToggleStatusText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  verifiedBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  savedVaultBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  savedVaultBtnText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
  },
  badgeSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badgeOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeOptionIcon: {
    fontSize: 14,
  },
  badgeOptionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  pillReplied: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  pillTextReplied: {
    color: '#34d399',
  },
  repliesThreadContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  repliesThreadHeader: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  replyBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
  },
  replyBubbleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replySenderTag: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
  },
  replyTimeText: {
    color: '#64748b',
    fontSize: 9,
  },
  replyMessageText: {
    color: '#f1f5f9',
    fontSize: 12,
    lineHeight: 16,
  },
  inquiryActionReplyBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inquiryActionReplyBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  inquiryActionReplyText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
  },
  replyComposerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  replyComposerInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 12,
    minHeight: 50,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  sendReplySubmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  sendReplySubmitText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '800',
  },

  // Creator Expansion Styles
  ownerNotificationsBtnActive: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  reelPreviewCardPinned: {
    borderColor: '#fbbf24',
    borderWidth: 2,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  masterPitchBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  masterPitchBadgeText: {
    color: '#0f172a',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  reelCardAudioTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  reelCardAudioText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '600',
  },
  pinMiniBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinMiniBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    borderColor: '#fbbf24',
    borderWidth: 1,
  },
  pinMiniBtnText: {
    fontSize: 12,
  },
  skillVouchPill: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  skillVouchPillText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  },
  vouchActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  vouchActionBtnText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  reelPlayerAudioBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  reelPlayerAudioText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  reelPlayerPinBtn: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  reelPlayerPinBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderColor: '#fbbf24',
  },
  reelPlayerPinText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  notifTopActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  notifRefreshBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  notifRefreshText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  markAllReadBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  markAllReadText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  notifAvatarBox: {
    position: 'relative',
  },
  notifAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1e293b',
  },
  notifTypeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notifTypeBadgeEmoji: {
    fontSize: 10,
  },
  notifContentCol: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  notifTime: {
    color: '#64748b',
    fontSize: 10,
    marginLeft: 8,
  },
  notifMessage: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
  },
  notifUnreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  notifUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },
  notifUnreadTag: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
  },
  subCategoryBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  subCategoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c084fc',
  },
  storefrontCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  storefrontHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 8,
  },
  storefrontHeaderIcon: {
    fontSize: 16,
  },
  storefrontHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  storefrontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  storefrontIcon: {
    fontSize: 14,
  },
  storefrontText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '500',
    flex: 1,
  },
  storefrontLinkText: {
    color: '#38bdf8',
    textDecorationLine: 'underline',
  },
  storefrontActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  whatsappActionBtn: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  bookingActionBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  // Storefront & Commercial Business Extensions
  storefrontTitleCol: {
    flex: 1,
  },
  storefrontTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  storefrontTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  storefrontCategoryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  storefrontCategoryText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  storefrontSubCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storefrontSubCatText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  storefrontTagline: {
    fontSize: 12,
    color: '#cbd5e1',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  storefrontTrustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  upiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upiBadgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  gstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gstBadgeText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
  },
  callStoreActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callStoreActionText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },

  // Business Catalog & Rate Card Grid
  businessCatalogGrid: {
    gap: 10,
  },
  catalogItemCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
  },
  catalogItemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  catalogItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  catalogItemDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 8,
  },
  catalogPriceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catalogPriceText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
  },
  catalogActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  catalogInquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catalogInquireText: {
    color: '#25D366',
    fontSize: 11,
    fontWeight: '700',
  },
  catalogBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  catalogBookText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },

  // Modal Business Form Controls
  modalSectionDividerHeader: {
    marginTop: 18,
    marginBottom: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalSectionDividerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modalSectionDividerSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  categoryChipsScrollRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryChipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipOptionText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  quickTimingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  timingPresetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  timingPresetText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  templatePresetsContainer: {
    marginBottom: 8,
  },
  templatePresetHintText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  templatePresetPillsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  templatePresetBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  templatePresetText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '700',
  },
  catalogSyntaxHint: {
    color: '#64748b',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Instant Profile QR Stand Card
  profileQrStandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  profileQrStandLeft: {
    flex: 1,
  },
  qrStandBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  qrStandBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qrStandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  qrStandSub: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 10,
  },
  qrStandActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrStandBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qrStandBtnText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '800',
  },
  qrStandShareBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  qrStandShareText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  profileQrStandThumbWrapper: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileQrStandThumb: {
    width: 84,
    height: 84,
  },
  qrThumbTapBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#0284c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qrThumbTapText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});
