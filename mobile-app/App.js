import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, Text, TouchableOpacity, ActivityIndicator, BackHandler, Platform } from 'react-native';
import { COLORS } from './src/theme';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import Toast from './src/components/Toast';

import ProfileScreen from './src/screens/ProfileScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import LoginScreen from './src/screens/LoginScreen';
import AdminScreen from './src/screens/AdminScreen';

import { saveAuthSession, loadAuthSession, clearAuthSession } from './src/services/storage';
import {
  fetchPublicProfile,
  fetchMyProfile,
  updateMyProfile,
  createSection,
  updateSection,
  deleteSection,
  fetchReels,
  createReel,
  likeReelApi,
  recordReelView,
  deleteReelApi,
  fetchProfileAnalytics,
  sendInquiry,
  fetchMyInquiries,
  updateInquiryStatus,
  searchByPhone,
  requestOtp,
  verifyOtp,
  trackProfileView,
  fetchAdminUsers,
  fetchAdminAnalytics,
  updateAdminUserStatus,
  fetchAdminReports,
  resolveAdminReport,
  fetchFollowingReels,
  toggleFollowCreator,
  checkFollowStatus,
  toggleBookmarkReel,
  fetchSavedReels,
  replyToInquiry,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  togglePinReel,
  vouchSkill,
} from './src/services/api';


const DEFAULT_PROFILE_DATA = {
  profile: {
    name: 'Verified Creator',
    username: 'creator',
    profileType: 'Creator',
    bio: 'Digital Profile & Content Showcase building modern mobile experiences.',
    city: 'India',
    photoUrl: 'https://ui-avatars.com/api/?name=Creator&background=1e293b&color=10b981&size=256',
    theme: 'default',
    completionPercentage: 100,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2Flocalhost%3A8081%2Fp%2Fcreator&bgcolor=ffffff&color=020617&margin=8',
  },
  sections: [
    {
      _id: 'sec-1',
      title: 'Technical Skills & Stacks',
      type: 'skills',
      content: { items: ['React Native', 'Expo', 'Node.js', 'System Architecture', 'Tailwind'] },
    },
    {
      _id: 'sec-2',
      title: 'Work Experience',
      type: 'experience',
      content: { text: 'Staff Mobile Engineer @ Tech Innovators (2022-Present). Architected cross-platform video feed apps.' },
    },
    {
      _id: 'sec-3',
      title: 'Education',
      type: 'education',
      content: { text: 'B.Tech in Computer Science & Engineering • Honors' },
    },
  ],
  reels: [
    {
      _id: 'demo-reel-1',
      caption: 'Building smooth 60fps vertical swipe video reels in React Native!',
      likesCount: 142,
      viewsCount: 1240,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    },
  ],
};

const DEFAULT_REELS = [
  {
    _id: 'reel-demo-1',
    caption: 'Speedrunning mobile UI/UX engineering with dark glassmorphism & fluid animations 🚀',
    likesCount: 384,
    viewsCount: 2890,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    profileId: {
      name: 'Sourabh Kumar Dhangar',
      username: 'sourabh-dhangar',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    },
  },
  {
    _id: 'reel-demo-2',
    caption: 'Design systems breakdown: Color tokens, typography hierarchy, and micro-interactions.',
    likesCount: 195,
    viewsCount: 1420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    profileId: {
      name: 'Kavya Verma',
      username: 'kavya_ux',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
  },
  {
    _id: 'reel-demo-3',
    caption: 'Interventional cardiology: Preventive wellness and daily heart vitality tips 🩺',
    likesCount: 420,
    viewsCount: 3100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800',
    profileId: {
      name: 'Dr. Arjun Mehta',
      username: 'dr_arjun_mehta',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    },
  },
];

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.log('App ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(244,63,94,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#f43f5e' }} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#ffffff', marginBottom: 8, textAlign: 'center' }}>MyProfile App</Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 18 }}>
            {this.state.error?.message || 'Recovering session...'}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
            onPress={() => this.setState({ hasError: false, error: null })}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#030712', fontWeight: '900', fontSize: 14 }}>Tap to Refresh</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('reels'); // 'login' | 'profile' | 'reels' | 'discover' | 'admin'

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  // Profile State
  const [profileUsername, setProfileUsername] = useState('');
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Reels & Social State
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [loadingReels, setLoadingReels] = useState(false);
  const [reelsFeedTab, setReelsFeedTab] = useState('forYou'); // 'forYou' | 'following'
  const [isFollowingCurrentProfile, setIsFollowingCurrentProfile] = useState(false);


  // Discover State
  const [searchPhone, setSearchPhone] = useState('');
  const [discoverResult, setDiscoverResult] = useState(null);
  const [discoverMsg, setDiscoverMsg] = useState('');
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  // Auth State & User Isolation
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [authMsg, setAuthMsg] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // Creator Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Inquiries & Proposals State
  const [inquiries, setInquiries] = useState([]);
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Notifications Hub State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Super Admin Governance State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [adminReports, setAdminReports] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Restore persistent mobile session across app restarts & tab reloads
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = await loadAuthSession();
        if (savedSession && savedSession.token) {
          const { token, user } = savedSession;
          setAuthToken(token);
          if (user) {
            setCurrentUser(user);
            if (user.profile?.username) {
              setProfileUsername(user.profile.username);
            }
            if (user.profile) {
              setProfileData((prev) => ({
                ...prev,
                profile: user.profile,
                sections: user.sections || prev.sections || [],
                reels: user.reels || prev.reels || [],
              }));
            }
          }
          // Direct reel section opens immediately on app open for all users
          setActiveTab('reels');
          setIsRestoringSession(false);

          // Background sync fresh data from server without disrupting view
          loadMyProfile(token, user?.profile?.username);
          return;
        }
      } catch (err) {
        console.log('[Auth] Session restore error:', err.message);
      } finally {
        setIsRestoringSession(false);
      }
      // Direct reel section opens immediately on the app
      setActiveTab('reels');
    };
    restoreSession();
    // Pre-fetch reels immediately so the feed is instant
    loadReels('forYou');
  }, []);

  // Handle Android Hardware Back Button safely without resetting session (returns to Reels home)
  useEffect(() => {
    const onBackPress = () => {
      if (activeTab !== 'reels') {
        setActiveTab('reels');
        return true;
      }
      return false;
    };
    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [activeTab]);

  // Strict Authentication Guard when activeTab changes
  useEffect(() => {
    if (isRestoringSession) return;
    const isAuth = Boolean(authToken || currentUser?.token);
    if (!isAuth && ((activeTab === 'profile' && !profileUsername) || activeTab === 'admin')) {
      setActiveTab('login');
      return;
    }

    if (activeTab === 'profile' && isAuth) {
      const effectiveToken = authToken || currentUser?.token;
      if (effectiveToken && profileUsername === currentUser?.profile?.username) {
        loadMyProfile(effectiveToken);
      } else if (profileUsername) {
        loadProfile(profileUsername);
        if (effectiveToken) {
          loadNotifications(effectiveToken);
        }
      }
    } else if (activeTab === 'reels') {
      loadReels();
    } else if (activeTab === 'admin' && isAuth) {
      loadAdminData(currentUser?.token || authToken);
    }
  }, [activeTab, authToken, isRestoringSession]);

  const loadAdminData = async (token) => {
    const effectiveToken = token || authToken || currentUser?.token;
    if (!effectiveToken) return;
    setLoadingAdmin(true);
    try {
      const [usersRes, analyticsRes, reportsRes] = await Promise.all([
        fetchAdminUsers(effectiveToken),
        fetchAdminAnalytics(effectiveToken),
        fetchAdminReports(effectiveToken),
      ]);
      if (usersRes?.success && usersRes.data?.users) {
        setAdminUsers(usersRes.data.users);
      }
      if (analyticsRes?.success && analyticsRes.data) {
        setAdminAnalytics(analyticsRes.data);
      }
      if (reportsRes?.success && reportsRes.data?.reports) {
        setAdminReports(reportsRes.data.reports);
      }
    } catch (err) {
      console.log('Error loading admin data:', err.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const loadAnalytics = async (token) => {
    if (!token) return;
    setLoadingAnalytics(true);
    try {
      const res = await fetchProfileAnalytics(token);
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.log('Error fetching analytics:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadInquiries = async (token) => {
    if (!token) return;
    setLoadingInquiries(true);
    try {
      const res = await fetchMyInquiries(token);
      if (res.success && res.data) {
        setInquiries(res.data.inquiries || []);
        setUnreadInquiriesCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log('Error fetching inquiries:', err.message);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const loadMyProfile = async (token, fallbackUsername) => {
    setLoadingProfile(true);
    setIsFollowingCurrentProfile(false);
    try {
      const res = await fetchMyProfile(token);
      if (res.success && res.data) {
        const safeProfile = {
          ...res.data.profile,
          businessDetails: res.data.profile?.businessDetails || {
            businessName: '',
            tagline: '',
            timing: '',
            address: '',
            googleMapsUrl: '',
            whatsappNumber: '',
            bookingUrl: '',
            upiId: '',
            gstNumber: '',
          },
          verifiedBadge: res.data.profile?.verifiedBadge || 'verified_pro',
          followersCount: res.data.profile?.followersCount || 0,
          followingCount: res.data.profile?.followingCount || 0,
          testimonials: res.data.profile?.testimonials || [],
        };
        setProfileData({
          ...res.data,
          profile: safeProfile,
          sections: res.data.sections || [],
          reels: res.data.reels || [],
        });
        if (safeProfile?.username) {
          setProfileUsername(safeProfile.username);
        }
        setCurrentUser((prev) => ({
          ...prev,
          profile: safeProfile,
        }));
        loadAnalytics(token);
        loadInquiries(token);
        loadNotifications(token);
        return;
      }
    } catch (err) {
      console.log('Error loading my profile:', err.message);
    } finally {
      setLoadingProfile(false);
    }

    if (fallbackUsername) {
      await loadProfile(fallbackUsername);
    }
  };

  const loadProfile = async (username) => {
    setLoadingProfile(true);
    try {
      const res = await fetchPublicProfile(username);
      if (res.success) {
        setProfileData(res.data);
        trackProfileView(username);
        const token = authToken || currentUser?.token;
        if (token && currentUser?.profile?.username && currentUser.profile.username !== username) {
          checkFollowStatus(token, username).then((fRes) => {
            if (fRes?.success) {
              setIsFollowingCurrentProfile(Boolean(fRes.data?.isFollowing));
            }
          }).catch(() => {});
        } else {
          setIsFollowingCurrentProfile(false);
        }
      } else {
        // Fallback demo data if backend is offline
        setProfileData({
          profile: {
            name: username ? username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Verified Creator',
            username: username || 'creator',
            profileType: 'Creator',
            bio: 'Full Stack Engineer & Content Creator building next-generation mobile experiences.',
            city: 'Bengaluru, India',
            photoUrl:
              'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
            theme: 'default',
            completionPercentage: 100,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2Flocalhost%3A8081%2Fp%2F${encodeURIComponent(username || 'creator')}&bgcolor=ffffff&color=020617&margin=8`,
          },
          sections: [
            {
              _id: 'sec-1',
              title: 'Technical Skills & Stacks',
              type: 'skills',
              content: { items: ['React Native', 'Expo', 'Node.js', 'System Architecture', 'Tailwind'] },
            },
            {
              _id: 'sec-2',
              title: 'Work Experience',
              type: 'experience',
              content: { text: 'Staff Mobile Engineer @ Tech Innovators (2022-Present). Architected cross-platform video feed apps.' },
            },
            {
              _id: 'sec-3',
              title: 'Education',
              type: 'education',
              content: { text: 'B.Tech in Computer Science & Engineering • Honors' },
            },
          ],
          reels: [
            {
              _id: 'demo-reel-1',
              caption: 'Building smooth 60fps vertical swipe video reels in React Native!',
              likesCount: 142,
              viewsCount: 1240,
              thumbnailUrl:
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            },
          ],
        });
      }
    } catch (e) {
      console.log('Profile loading error:', e.message);
      // Resilient fallback
      setProfileData({
        profile: {
          name: username ? username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Verified Creator',
            username: username || 'creator',
          profileType: 'Creator',
          bio: 'Full Stack Engineer & Content Creator building next-generation mobile experiences.',
          city: 'Bengaluru, India',
          photoUrl:
            'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
          theme: 'default',
          completionPercentage: 100,
        },
        sections: [
          {
            _id: 'sec-1',
            title: 'Technical Skills & Stacks',
            type: 'skills',
            content: { items: ['React Native', 'Expo', 'Node.js', 'System Architecture', 'Tailwind'] },
          },
          {
            _id: 'sec-2',
            title: 'Work Experience',
            type: 'experience',
            content: { text: 'Staff Mobile Engineer @ Tech Innovators (2022-Present). Architected cross-platform video feed apps.' },
          },
        ],
        reels: [],
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadReels = async (feedTab = reelsFeedTab, tag = '', search = '') => {
    setLoadingReels(true);
    try {
      if (feedTab === 'following') {
        const token = authToken || currentUser?.token;
        if (!token) {
          setReels([]);
          return;
        }
        const res = await fetchFollowingReels(token);
        if (res.success && res.data?.reels) {
          setReels(res.data.reels);
        } else {
          setReels([]);
        }
      } else if (feedTab === 'saved') {
        const token = authToken || currentUser?.token;
        if (!token) {
          setReels([]);
          return;
        }
        const res = await fetchSavedReels(token);
        if (res.success && res.data?.reels) {
          setReels(res.data.reels);
        } else {
          setReels([]);
        }
      } else {
        const res = await fetchReels(1, 50, tag, search);
        if (res.success && res.data?.reels?.length > 0) {
          setReels(res.data.reels);
        } else {
          // Fallback high-aesthetic demo reels
          setReels([
            {
              _id: 'reel-demo-1',
              caption: 'Speedrunning mobile UI/UX engineering with dark glassmorphism & fluid animations 🚀',
              likesCount: 384,
              viewsCount: 2890,
              thumbnailUrl:
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
              profileId: {
                name: 'Sourabh Kumar Dhangar',
                username: 'sourabh-dhangar',
                photoUrl:
                  'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
              },
            },
            {
              _id: 'reel-demo-2',
              caption: 'Design systems breakdown: Color tokens, typography hierarchy, and micro-interactions.',
              likesCount: 195,
              viewsCount: 1420,
              thumbnailUrl:
                'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
              profileId: {
                name: 'Priya Patel',
                username: 'priya_design',
                photoUrl:
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
              },
            },
            {
              _id: 'reel-demo-3',
              caption: 'Next-gen privacy: Zero-knowledge phone discovery with salted HMAC-SHA256 indexing 🛡️',
              likesCount: 512,
              viewsCount: 4200,
              thumbnailUrl:
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
              profileId: {
                name: 'Alex Vance',
                username: 'alex_cyber',
                photoUrl:
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
              },
            },
          ]);
        }
      }
    } catch (e) {
      console.log('Reels error:', e.message);
      if (feedTab === 'following') {
        setReels([]);
      } else {
        // Fallback
        setReels([
          {
            _id: 'reel-demo-1',
            caption: 'Speedrunning mobile UI/UX engineering with dark glassmorphism 🚀',
            likesCount: 245,
            viewsCount: 1820,
            thumbnailUrl:
              'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
            profileId: {
                name: 'Sourabh Kumar Dhangar',
                username: 'sourabh-dhangar',
              photoUrl:
                'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
            },
          },
        ]);
      }
    } finally {
      setLoadingReels(false);
    }
  };

  const handleSwitchReelsFeedTab = (tab, tag = '', search = '') => {
    setReelsFeedTab(tab);
    loadReels(tab, tag, search);
  };

  const handleReplyInquiry = async (inquiryId, message) => {
    const token = authToken || currentUser?.token;
    if (!token) {
      showToast('Please sign in to reply to inquiries', 'error');
      return false;
    }
    try {
      const res = await replyToInquiry(token, inquiryId, message);
      if (res.success && res.data) {
        showToast('Reply sent to client! 🚀', 'success');
        setInquiries((prev) =>
          prev.map((inq) => (inq._id === inquiryId ? res.data : inq))
        );
        return true;
      }
      showToast(res.message || 'Failed to send reply', 'error');
      return false;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const handleToggleBookmark = async (reelId) => {
    const token = authToken || currentUser?.token;
    if (!token) {
      showToast('Please sign in to save reels to your vault', 'info');
      setActiveTab('login');
      return null;
    }
    try {
      const res = await toggleBookmarkReel(token, reelId);
      if (res.success && res.data) {
        showToast(res.message, 'success');
        return res.data;
      }
      return null;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  const handleToggleFollow = async (targetUsername) => {
    const token = authToken || currentUser?.token;
    if (!token) {
      showToast('Please sign in to follow creators', 'error');
      return false;
    }
    try {
      const res = await toggleFollowCreator(token, targetUsername);
      if (res.success && res.data) {
        const isNowFollowing = res.data.isFollowing;
        setIsFollowingCurrentProfile(isNowFollowing);
        setProfileData((prev) => {
          if (prev?.profile?.username === targetUsername) {
            return {
              ...prev,
              profile: {
                ...prev.profile,
                followersCount: res.data.followersCount,
              },
            };
          }
          return prev;
        });
        showToast(
          isNowFollowing ? `Now following @${targetUsername}! 🎉` : `Unfollowed @${targetUsername}`,
          'success'
        );
        return true;
      } else {
        showToast(res.message || 'Could not update follow status', 'error');
        return false;
      }
    } catch (err) {
      showToast('Could not complete follow request', 'error');
      return false;
    }
  };

  const handleSearchPhone = async () => {
    setLoadingDiscover(true);
    setDiscoverResult(null);
    setDiscoverMsg('');
    try {
      const res = await searchByPhone(searchPhone);
      if (res.success && res.data) {
        setDiscoverResult(res.data);
        showToast('Profile discovered!', 'success');
      } else {
        setDiscoverMsg(res.message || 'No discoverable profile found for this phone number.');
      }
    } catch (e) {
      // Fallback demo match for demo testing
      if (searchPhone === '9876543210') {
        setDiscoverResult({
          name: 'Rahul Sharma',
          username: 'rahul_dev',
          profileType: 'Engineer',
          category: 'IT & Software',
          city: 'Bengaluru, India',
          photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        });
        showToast('Demo profile matched!', 'success');
      } else if (searchPhone === '9820112233') {
        setDiscoverResult({
          name: 'Dr. Arjun Mehta',
          username: 'dr_arjun_mehta',
          profileType: 'Doctor & Clinic',
          category: 'Doctor & Clinic',
          city: 'Indiranagar, Bengaluru',
          photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
        });
        showToast('Dr. Arjun Mehta matched!', 'success');
      } else if (searchPhone === '9820223344') {
        setDiscoverResult({
          name: 'Pooja Hegde Studios',
          username: 'pooja_hegde',
          profileType: 'Content Creator & Artist',
          category: 'Content Creator & Artist',
          city: 'Colaba, Mumbai',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        });
        showToast('Pooja Hegde Studios matched!', 'success');
      } else {
        setDiscoverMsg('No profile found. Ensure owner enabled "Allow Mobile Discovery".');
      }
    } finally {
      setLoadingDiscover(false);
    }
  };

  const handleSendOtp = async (mode = 'signin') => {
    setAuthMsg('');
    setLoadingAuth(true);
    try {
      const res = await requestOtp(mobileInput, '+91', mode);
      if (res.success) {
        setOtpStep(2);
        const code = res.data?.devOtp || '123456';
        setAuthMsg(`OTP Code Dispatched! (Dev code: ${code})`);
        setOtpInput(code);
        showToast(`OTP Code sent to ${mobileInput}`, 'success');
        return { success: true, res };
      } else {
        const errorMsg = res.message || 'Failed to send OTP.';
        setAuthMsg(errorMsg);
        showToast(errorMsg, res.code === 'USER_NOT_FOUND' ? 'warning' : 'error');
        return { success: false, code: res.code, message: errorMsg };
      }
    } catch (e) {
      // Offline fallback
      setAuthMsg(e.message || 'Connection error. Please try again.');
      showToast('Server unreachable. Please check backend connection.', 'error');
      return { success: false, error: e };
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleVerifyOtp = async (signupData = null) => {
    setAuthMsg('');
    setLoadingAuth(true);
    try {
      const res = await verifyOtp(mobileInput, otpInput, '+91', signupData || {});
      if (res.success && res.data) {
        const token = res.data.token;
        const profile = res.data.profile;
        const user = res.data.user;
        const loggedUser = { token, user, profile };

        await saveAuthSession(token, loggedUser);

        setAuthToken(token);
        setCurrentUser(loggedUser);
        setProfileUsername(profile?.username);

        // Immediate fallback profile state with safe defaults so ProfileScreen never renders empty or null
        if (profile) {
          const safeProfile = {
            ...profile,
            businessDetails: profile.businessDetails || {
              businessName: '',
              tagline: '',
              timing: '',
              address: '',
              googleMapsUrl: '',
              whatsappNumber: '',
              bookingUrl: '',
              upiId: '',
              gstNumber: '',
            },
            verifiedBadge: profile.verifiedBadge || 'verified_pro',
            followersCount: profile.followersCount || 0,
            followingCount: profile.followingCount || 0,
            testimonials: profile.testimonials || [],
          };
          setProfileData({
            profile: safeProfile,
            sections: res.data.sections || [],
            reels: res.data.reels || [],
          });
        }

        // Fetch their full isolated profile & modular sections
        await loadMyProfile(token, profile?.username);

        if (user?.role === 'admin') {
          loadAdminData(token);
          setActiveTab('admin');
          showToast(`Welcome, Super Admin! Governance console ready.`, 'success');
        } else {
          setActiveTab('profile');
          showToast(`Welcome, ${profile?.name || 'User'}! Your ID is active.`, 'success');
        }
      } else {
        setAuthMsg(res.message || 'Invalid verification code.');
        showToast('Invalid verification code', 'error');
      }
    } catch (e) {
      console.log('Verify OTP error:', e);
      if (otpInput === '123456') {
        const isAdmin = mobileInput === '9999999999';
        const isKavya = mobileInput === '9811223344';
        const isDemo = mobileInput === '9876543210';
        let devName = signupData?.name?.trim() || 'New Creator';
        let devSlug = signupData?.name?.trim()
          ? `${signupData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 12)}_${mobileInput.slice(-4)}`
          : `user_${mobileInput.slice(-4)}`;
        if (isAdmin) {
          devName = 'Super Admin';
          devSlug = 'super_admin';
        } else if (isKavya) {
          devName = 'Kavya Verma';
          devSlug = 'kavya_ux';
        } else if (isDemo && !signupData?.name) {
          devName = 'Demo Creator';
          devSlug = `creator_${mobileInput.slice(-4)}`;
        }

        const devUser = {
          token: 'sample-jwt-dev-token',
          user: { mobile: mobileInput, email: signupData?.email, role: isAdmin ? 'admin' : 'user' },
          profile: {
            name: devName,
            username: devSlug,
            bio: signupData?.bio?.trim() || (isAdmin
              ? 'Platform Super Administrator with system-wide governance privileges.'
              : isKavya
              ? 'Senior Product & Motion Designer crafting fluid spatial interfaces.'
              : isDemo
              ? 'Full Stack Engineer building next-generation mobile experiences.'
              : 'Fresh digital profile created via Mobile OTP.'),
            city: isKavya ? 'Mumbai, India' : isDemo ? 'Bengaluru, India' : 'India',
            profileType: signupData?.profileType || (isKavya ? 'Designer' : 'Creator'),
            theme: 'default',
            completionPercentage: 85,
            contactDetails: {
              phone: mobileInput,
              whatsapp: mobileInput,
              email: signupData?.email?.trim() || '',
              showPhone: true,
              showWhatsapp: true,
              showEmail: Boolean(signupData?.email),
            },
          },
        };
        await saveAuthSession(devUser.token, devUser);
        setAuthToken(devUser.token);
        setCurrentUser(devUser);
        setProfileData({ profile: devUser.profile, sections: [], reels: [] });
        setProfileUsername(devUser.profile.username);
        if (isAdmin) {
          setActiveTab('admin');
          showToast(`Authenticated as Super Admin!`, 'success');
        } else {
          setActiveTab('profile');
          showToast(`Welcome, ${devUser.profile.name}! Your profile is live.`, 'success');
        }
      } else {
        setAuthMsg('Invalid OTP. Use test code 123456.');
        showToast('Invalid OTP code', 'error');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleUpdateProfile = async (updates) => {
    if (!authToken) {
      showToast('Please sign in to update your profile', 'error');
      return false;
    }
    try {
      const res = await updateMyProfile(effectiveToken, updates);
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            ...res.data,
          },
        }));
        if (res.data.username) {
          setProfileUsername(res.data.username);
        }
        setCurrentUser((prev) => ({
          ...prev,
          profile: {
            ...prev?.profile,
            ...res.data,
          },
        }));
        showToast('Profile updated & saved to database! ✨', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
        return false;
      }
    } catch (e) {
      // Local optimistic update
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...updates,
        },
      }));
      showToast('Profile updated locally!', 'success');
      return true;
    }
  };

  const handleCreateSection = async (sectionData) => {
    if (!authToken) {
      showToast('Please sign in to add sections', 'error');
      return false;
    }
    try {
      const res = await createSection(effectiveToken, sectionData);
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          sections: [...(prev.sections || []), res.data],
        }));
        showToast('New section added to your profile! 📁', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to add section', 'error');
        return false;
      }
    } catch (e) {
      // Optimistic local fallback
      const localSec = {
        _id: 'sec-' + Date.now(),
        ...sectionData,
      };
      setProfileData((prev) => ({
        ...prev,
        sections: [...(prev.sections || []), localSec],
      }));
      showToast('Section added to profile!', 'success');
      return true;
    }
  };

  const handleUpdateSection = async (sectionId, updates) => {
    if (!authToken) {
      showToast('Please sign in to update sections', 'error');
      return false;
    }
    try {
      const res = await updateSection(effectiveToken, sectionId, updates);
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          sections: (prev.sections || []).map((sec) => (sec._id === sectionId ? res.data : sec)),
        }));
        showToast('Section updated successfully! ✨', 'success');
        return true;
      }
    } catch (e) {
      setProfileData((prev) => ({
        ...prev,
        sections: (prev.sections || []).map((sec) =>
          sec._id === sectionId ? { ...sec, ...updates } : sec
        ),
      }));
      showToast('Section updated locally!', 'success');
      return true;
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!authToken) {
      showToast('Please sign in to delete sections', 'error');
      return false;
    }
    try {
      const res = await deleteSection(effectiveToken, sectionId);
      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          sections: (prev.sections || []).filter((sec) => sec._id !== sectionId),
        }));
        showToast('Section removed from profile 🗑️', 'info');
        return true;
      }
    } catch (e) {
      setProfileData((prev) => ({
        ...prev,
        sections: (prev.sections || []).filter((sec) => sec._id !== sectionId),
      }));
      showToast('Section removed locally 🗑️', 'info');
      return true;
    }
  };

  const handleCreateReel = async (reelData) => {
    const effectiveToken = authToken || currentUser?.token;
    if (!effectiveToken) {
      showToast('Please sign in to post reels', 'error');
      setActiveTab('login');
      return false;
    }
    try {
      const res = await createReel(effectiveToken, reelData);
      if (res.success && res.data) {
        const createdReel = {
          ...res.data,
          profileId: res.data.profileId || {
            name: currentUser?.profile?.name || 'Creator',
            username: currentUser?.profile?.username || 'creator',
            photoUrl: currentUser?.profile?.photoUrl || '',
          },
        };
        setProfileData((prev) => ({
          ...prev,
          reels: [createdReel, ...(prev?.reels || [])],
          stats: {
            ...prev?.stats,
            reelsCount: ((prev?.reels?.length || 0) + 1),
          },
        }));
        setReels((prev) => [createdReel, ...(prev || [])]);
        showToast('Reel published to everyone on feed! 🎬✨', 'success');
        loadReels(reelsFeedTab);
        return true;
      } else {
        showToast(res?.message || 'Failed to post reel', 'error');
        return false;
      }
    } catch (e) {
      console.log('Reel post fallback:', e.message);
      const localReel = {
        _id: 'reel-' + Date.now(),
        ...reelData,
        likesCount: 0,
        viewsCount: 1,
        profileId: {
          name: currentUser?.profile?.name || 'Creator',
          username: currentUser?.profile?.username || 'creator',
          photoUrl: currentUser?.profile?.photoUrl || '',
        },
      };
      setProfileData((prev) => ({
        ...prev,
        reels: [localReel, ...(prev?.reels || [])],
      }));
      setReels((prev) => [localReel, ...(prev || [])]);
      showToast('Reel posted locally! 🎬', 'success');
      return true;
    }
  };

  const handleLikeReel = async (reelId) => {
    try {
      setProfileData((prev) => ({
        ...prev,
        reels: (prev.reels || []).map((r) =>
          r._id === reelId ? { ...r, likesCount: (r.likesCount || 0) + 1 } : r
        ),
      }));
      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId ? { ...r, likesCount: (r.likesCount || 0) + 1 } : r
        )
      );
      const res = await likeReelApi(reelId, authToken || currentUser?.token);
      if (res.success && res.data?.likesCount !== undefined) {
        setProfileData((prev) => ({
          ...prev,
          reels: (prev.reels || []).map((r) =>
            r._id === reelId ? { ...r, likesCount: res.data.likesCount } : r
          ),
        }));
      }
      showToast('Liked Reel! ❤️', 'success');
      return true;
    } catch (e) {
      showToast('Liked Reel! ❤️', 'success');
      return true;
    }
  };

  const handleDeleteReel = async (reelId) => {
    if (!authToken) {
      showToast('Please sign in to delete reels', 'error');
      return false;
    }
    try {
      const res = await deleteReelApi(effectiveToken, reelId);
      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          reels: (prev.reels || []).filter((r) => r._id !== reelId),
        }));
        setReels((prev) => prev.filter((r) => r._id !== reelId));
        showToast('Reel removed from your profile 🗑️', 'info');
        return true;
      }
    } catch (e) {
      setProfileData((prev) => ({
        ...prev,
        reels: (prev.reels || []).filter((r) => r._id !== reelId),
      }));
      setReels((prev) => prev.filter((r) => r._id !== reelId));
      showToast('Reel removed locally 🗑️', 'info');
      return true;
    }
  };

  const handleSendInquiry = async (username, inquiryData) => {
    try {
      const res = await sendInquiry(username, inquiryData);
      if (res.success) {
        showToast('Proposal / Inquiry sent directly to creator! 💼✨', 'success');
        return { success: true, data: res.data };
      } else {
        showToast(res.message || 'Failed to send inquiry', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Could not deliver inquiry. Check network connection.', 'error');
      return { success: false, message: err.message };
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, status) => {
    if (!authToken) {
      showToast('Please sign in to update inquiry status', 'error');
      return false;
    }
    try {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === inquiryId ? { ...inq, status } : inq))
      );
      if (status === 'read') {
        setUnreadInquiriesCount((c) => Math.max(0, c - 1));
      } else if (status === 'unread') {
        setUnreadInquiriesCount((c) => c + 1);
      }
      const res = await updateInquiryStatus(effectiveToken, inquiryId, status);
      if (res.success) {
        showToast(`Marked proposal as ${status}`, 'info');
        return true;
      }
    } catch (err) {
      showToast('Inquiry status updated locally', 'info');
      return true;
    }
  };

  const handleLogout = async () => {
    await clearAuthSession();
    setAuthToken(null);
    setCurrentUser(null);
    setOtpStep(1);
    setOtpInput('');
    setAuthMsg('');
    setAnalyticsData(null);
    setInquiries([]);
    setUnreadInquiriesCount(0);
    setAdminUsers([]);
    setAdminAnalytics(null);
    setAdminReports([]);
    setProfileUsername('');
    setProfileData(DEFAULT_PROFILE_DATA);
    setActiveTab('login');
    showToast('Signed out of session. Please sign in to access your profile.', 'info');
  };

  const handleSelectCreator = (username) => {
    setProfileUsername(username);
    loadProfile(username);
    setActiveTab('profile');
    showToast(`Loaded @${username}'s Profile`, 'success');
  };

  const handleTabPress = (tabId) => {
    const isAuth = Boolean(authToken || currentUser?.token);
    if (!isAuth && (tabId === 'profile' || tabId === 'admin')) {
      showToast(`🔒 Sign in required to access ${tabId === 'admin' ? 'Admin' : 'Profile'}`, 'info');
      setActiveTab('login');
      return;
    }
    setActiveTab(tabId);
  };

  const handleAdminUpdateUserStatus = async (userId, accountStatus, role) => {
    const token = authToken || currentUser?.token;
    if (!token) {
      showToast('Admin authorization required', 'error');
      return false;
    }
    // Optimistic UI update
    setAdminUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, accountStatus, role } : u))
    );
    try {
      const res = await updateAdminUserStatus(token, userId, { accountStatus, role });
      if (res.success) {
        showToast(`User status updated to ${accountStatus}`, 'success');
        loadAdminData(token);
        return true;
      } else {
        showToast(res.message || 'Failed to update user', 'error');
        return false;
      }
    } catch (err) {
      showToast('Status updated locally (Dev mode)', 'info');
      return true;
    }
  };

  const handleAdminResolveReport = async (reportId, status, actionTaken) => {
    const token = authToken || currentUser?.token;
    if (!token) return;
    try {
      const res = await resolveAdminReport(token, reportId, { status, actionTaken });
      if (res.success) {
        showToast(`Report ${actionTaken || status}`, 'success');
        loadAdminData(token);
        return true;
      }
    } catch (err) {
      showToast('Error resolving report', 'error');
    }
  };

  const loadNotifications = async (token) => {
    const effectiveToken = token || authToken || currentUser?.token;
    if (!effectiveToken) return;
    setLoadingNotifications(true);
    try {
      const res = await fetchNotifications(effectiveToken);
      if (res?.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotificationsCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log('Error loading notifications:', err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    const effectiveToken = authToken || currentUser?.token;
    if (!effectiveToken) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      await markNotificationRead(effectiveToken, notifId);
    } catch (e) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    const effectiveToken = authToken || currentUser?.token;
    if (!effectiveToken) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
      await markAllNotificationsRead(effectiveToken);
      showToast('All notifications marked as read ✓', 'success');
    } catch (e) {}
  };

  const handleTogglePinReel = async (reelId) => {
    const effectiveToken = authToken || currentUser?.token;
    if (!effectiveToken) {
      showToast('Please sign in to pin reels', 'info');
      return;
    }
    try {
      const res = await togglePinReel(effectiveToken, reelId);
      if (res?.success) {
        showToast(res.message, 'success');
        if (currentUser?.profile?.username) {
          loadMyProfile(effectiveToken);
        }
        return res;
      } else {
        showToast(res?.message || 'Could not pin reel', 'error');
      }
    } catch (err) {
      showToast('Error updating pin status', 'error');
    }
  };

  const handleVouchSkill = async (username, skillName) => {
    const effectiveToken = authToken || currentUser?.token;
    try {
      const res = await vouchSkill(effectiveToken, username, skillName);
      if (res?.success) {
        showToast(res.message, 'success');
        setProfileData((prev) => {
          if (!prev || !prev.sections) return prev;
          const updatedSections = prev.sections.map((sec) => {
            if (sec.type === 'skills') {
              return {
                ...sec,
                content: {
                  ...sec.content,
                  items: res.data.items,
                },
              };
            }
            return sec;
          });
          return { ...prev, sections: updatedSections };
        });
        return res;
      }
    } catch (err) {
      showToast('Error vouching for skill', 'error');
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        Platform.OS === 'android' && activeTab !== 'reels' && {
          paddingTop: StatusBar.currentHeight || 24,
        },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={activeTab === 'reels' ? 'transparent' : '#030712'}
        translucent={activeTab === 'reels'}
      />

      {/* Floating Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />

      <View style={styles.appShell}>
        {/* Top Header - Hidden in Reels tab for immersive 100% full-screen playback */}
        {activeTab !== 'reels' && (
          <Header
            activeTab={activeTab}
            currentUser={currentUser}
            onSignIn={() => setActiveTab('login')}
            onLogoPress={() => {
              const isAuth = Boolean(authToken || currentUser?.token);
              if (isAuth && currentUser?.profile?.username) {
                setProfileUsername(currentUser.profile.username);
                loadMyProfile(currentUser.token);
                setActiveTab('profile');
              } else {
                setActiveTab('login');
                showToast('Please sign in or create an account to view profiles', 'info');
              }
            }}
          />
        )}

        {/* Main Screen Body */}
        <View style={styles.bodyContainer}>
          {isRestoringSession && activeTab !== 'reels' ? (
            <View style={styles.centerLoadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.restoringSessionText}>Syncing Digital Identity...</Text>
            </View>
          ) : (!authToken && !currentUser?.token && activeTab !== 'login' && activeTab !== 'discover' && activeTab !== 'reels') ? (
            <LoginScreen
              mobileInput={mobileInput}
              setMobileInput={setMobileInput}
              otpInput={otpInput}
              setOtpInput={setOtpInput}
              otpStep={otpStep}
              setOtpStep={setOtpStep}
              authMsg={authMsg}
              authToken={authToken}
              currentUser={currentUser}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              onLogout={handleLogout}
              onNavigateToProfile={() => setActiveTab('profile')}
              onNavigateToAdmin={() => {
                loadAdminData(authToken);
                setActiveTab('admin');
              }}
              loading={loadingAuth}
            />
          ) : (
            <>
              {activeTab === 'profile' && (
                <ProfileScreen
                  profileData={profileData}
                  loading={loadingProfile}
                  onRefresh={() => {
                    if (currentUser?.token && profileUsername === currentUser?.profile?.username) {
                      loadMyProfile(currentUser.token);
                    } else {
                      loadProfile(profileUsername);
                    }
                  }}
                  onShowToast={showToast}
                  onSelectReelsTab={() => setActiveTab('reels')}
                  currentUser={currentUser}
                  isOwner={Boolean(
                    currentUser && currentUser.profile?.username === profileData?.profile?.username
                  )}
                  onNavigateToAuth={() => setActiveTab('login')}
                  onUpdateProfile={handleUpdateProfile}
                  onCreateSection={handleCreateSection}
                  onUpdateSection={handleUpdateSection}
                  onDeleteSection={handleDeleteSection}
                  onCreateReel={handleCreateReel}
                  onLikeReel={handleLikeReel}
                  onDeleteReel={handleDeleteReel}
                  analyticsData={analyticsData}
                  loadingAnalytics={loadingAnalytics}
                  onRefreshAnalytics={() => loadAnalytics(authToken)}
                  inquiries={inquiries}
                  unreadInquiriesCount={unreadInquiriesCount}
                  loadingInquiries={loadingInquiries}
                  onRefreshInquiries={() => loadInquiries(authToken)}
                  onSendInquiry={handleSendInquiry}
                  onUpdateInquiryStatus={handleUpdateInquiryStatus}
                  onReplyInquiry={handleReplyInquiry}
                  onOpenSavedVault={() => {
                    setReelsFeedTab('saved');
                    setActiveTab('reels');
                    loadReels('saved');
                  }}
                  onLogout={handleLogout}
                  onBackToMyProfile={() => {
                    if (currentUser?.profile?.username) {
                      setProfileUsername(currentUser.profile.username);
                      loadMyProfile(currentUser.token);
                      showToast('Returned to Your Profile', 'info');
                    } else {
                      setProfileUsername('');
                      setActiveTab('login');
                    }
                  }}
                  isFollowing={isFollowingCurrentProfile}
                  onToggleFollow={handleToggleFollow}
                  notifications={notifications}
                  unreadNotificationsCount={unreadNotificationsCount}
                  loadingNotifications={loadingNotifications}
                  onRefreshNotifications={() => loadNotifications()}
                  onMarkNotificationRead={handleMarkNotificationRead}
                  onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                  onTogglePinReel={handleTogglePinReel}
                  onVouchSkill={handleVouchSkill}
                />
              )}

              {activeTab === 'reels' && (
                <ReelsScreen
                  reels={reels}
                  loading={loadingReels}
                  onShowToast={showToast}
                  onViewCreatorProfile={handleSelectCreator}
                  activeFeedTab={reelsFeedTab}
                  onSwitchFeedTab={handleSwitchReelsFeedTab}
                  onToggleBookmark={handleToggleBookmark}
                  currentUser={currentUser}
                  authToken={authToken || currentUser?.token}
                  onNavigateToAuth={() => setActiveTab('login')}
                  onCreateReel={handleCreateReel}
                  isAdmin={Boolean(currentUser?.user?.role === 'admin' || currentUser?.role === 'admin')}
                />
              )}

              {activeTab === 'discover' && (
                <DiscoverScreen
                  searchPhone={searchPhone}
                  setSearchPhone={setSearchPhone}
                  onSearch={handleSearchPhone}
                  loading={loadingDiscover}
                  discoverResult={discoverResult}
                  discoverMsg={discoverMsg}
                  onSelectProfile={handleSelectCreator}
                />
              )}

              {activeTab === 'admin' && (
                <AdminScreen
                  users={adminUsers}
                  analytics={adminAnalytics}
                  reports={adminReports}
                  loading={loadingAdmin}
                  onRefresh={() => loadAdminData(authToken)}
                  onViewProfile={handleSelectCreator}
                  onUpdateUserStatus={handleAdminUpdateUserStatus}
                  onResolveReport={handleAdminResolveReport}
                  onShowToast={showToast}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'login' && (
                <LoginScreen
                  mobileInput={mobileInput}
                  setMobileInput={setMobileInput}
                  otpInput={otpInput}
                  setOtpInput={setOtpInput}
                  otpStep={otpStep}
                  setOtpStep={setOtpStep}
                  authMsg={authMsg}
                  authToken={authToken}
                  currentUser={currentUser}
                  onSendOtp={handleSendOtp}
                  onVerifyOtp={handleVerifyOtp}
                  onLogout={handleLogout}
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onNavigateToAdmin={() => {
                    loadAdminData(authToken);
                    setActiveTab('admin');
                  }}
                  loading={loadingAuth}
                />
              )}
            </>
          )}
        </View>

        {/* Bottom Floating Navigation Dock */}
        <TabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          unreadReels={reels.length}
          isAdmin={currentUser?.user?.role === 'admin'}
          isAuthenticated={Boolean(authToken || currentUser?.token)}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.background,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  bodyContainer: {
    flex: 1,
  },
  centerLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  restoringSessionText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

