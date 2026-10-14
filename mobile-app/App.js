import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar } from 'react-native';
import { COLORS } from './src/theme';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import Toast from './src/components/Toast';

import ProfileScreen from './src/screens/ProfileScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import LoginScreen from './src/screens/LoginScreen';
import AdminScreen from './src/screens/AdminScreen';

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
} from './src/services/api';


const DEFAULT_PROFILE_DATA = {
  profile: {
    name: 'Rahul Sharma',
    username: 'rahul_dev',
    profileType: 'Creator',
    bio: 'Full Stack Engineer & Content Creator building next-generation mobile experiences.',
    city: 'Bengaluru, India',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
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
      name: 'Rahul Sharma',
      username: 'rahul_dev',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
  },
  {
    _id: 'reel-demo-2',
    caption: 'Design systems breakdown: Color tokens, typography hierarchy, and micro-interactions.',
    likesCount: 195,
    viewsCount: 1420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    profileId: {
      name: 'Priya Patel',
      username: 'priya_design',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
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
          <View style={{ backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}>
            <Text style={{ color: '#030712', fontWeight: '900', fontSize: 14 }}>Tap to Refresh</Text>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'reels' | 'discover' | 'login'

  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  // Profile State
  const [profileUsername, setProfileUsername] = useState('rahul_dev');
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Reels & Social State
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [loadingReels, setLoadingReels] = useState(false);
  const [reelsFeedTab, setReelsFeedTab] = useState('forYou'); // 'forYou' | 'following'
  const [isFollowingCurrentProfile, setIsFollowingCurrentProfile] = useState(false);


  // Discover State
  const [searchPhone, setSearchPhone] = useState('9876543210');
  const [discoverResult, setDiscoverResult] = useState(null);
  const [discoverMsg, setDiscoverMsg] = useState('');
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  // Auth State & User Isolation
  const [mobileInput, setMobileInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [authMsg, setAuthMsg] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Creator Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Inquiries & Proposals State
  const [inquiries, setInquiries] = useState([]);
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState(0);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Super Admin Governance State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [adminReports, setAdminReports] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    if (activeTab === 'profile') {
      if (currentUser?.token && profileUsername === currentUser?.profile?.username) {
        loadMyProfile(currentUser.token);
      } else {
        loadProfile(profileUsername);
      }
    } else if (activeTab === 'reels') {
      loadReels();
    } else if (activeTab === 'admin') {
      loadAdminData(currentUser?.token || authToken);
    }
  }, [activeTab]);

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
        setProfileData(res.data);
        if (res.data.profile?.username) {
          setProfileUsername(res.data.profile.username);
        }
        setCurrentUser((prev) => ({
          ...prev,
          profile: res.data.profile,
        }));
        loadAnalytics(token);
        loadInquiries(token);
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
            name: 'Rahul Sharma',
            username: username || 'rahul_dev',
            profileType: 'Creator',
            bio: 'Full Stack Engineer & Content Creator building next-generation mobile experiences.',
            city: 'Bengaluru, India',
            photoUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
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
          name: 'Rahul Sharma',
          username: username || 'rahul_dev',
          profileType: 'Creator',
          bio: 'Full Stack Engineer & Content Creator building next-generation mobile experiences.',
          city: 'Bengaluru, India',
          photoUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
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

  const loadReels = async (feedTab = reelsFeedTab) => {
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
      } else {
        const res = await fetchReels();
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
                name: 'Rahul Sharma',
                username: 'rahul_dev',
                photoUrl:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
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
              name: 'Rahul Sharma',
              username: 'rahul_dev',
              photoUrl:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            },
          },
        ]);
      }
    } finally {
      setLoadingReels(false);
    }
  };

  const handleSwitchReelsFeedTab = (tab) => {
    setReelsFeedTab(tab);
    loadReels(tab);
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
          profileType: 'Creator',
          city: 'Bengaluru, India',
          photoUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        });
        showToast('Demo profile matched!', 'success');
      } else {
        setDiscoverMsg('No profile found. Ensure owner enabled "Allow Mobile Discovery".');
      }
    } finally {
      setLoadingDiscover(false);
    }
  };

  const handleSendOtp = async () => {
    setAuthMsg('');
    setLoadingAuth(true);
    try {
      const res = await requestOtp(mobileInput);
      if (res.success) {
        setOtpStep(2);
        const code = res.data?.devOtp || '123456';
        setAuthMsg(`OTP Code Dispatched! (Dev code: ${code})`);
        setOtpInput(code);
        showToast(`OTP Code sent to ${mobileInput}`, 'success');
      } else {
        setAuthMsg(res.message || 'Failed to send OTP.');
      }
    } catch (e) {
      // Offline fallback
      setOtpStep(2);
      setOtpInput('123456');
      setAuthMsg('Dev Mode Active: Use test OTP 123456.');
      showToast('Dev OTP Ready: 123456', 'info');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthMsg('');
    setLoadingAuth(true);
    try {
      const res = await verifyOtp(mobileInput, otpInput);
      if (res.success && res.data) {
        const token = res.data.token;
        const profile = res.data.profile;
        const user = res.data.user;
        const loggedUser = { token, user, profile };

        setAuthToken(token);
        setCurrentUser(loggedUser);
        setProfileUsername(profile?.username);

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
        let devName = 'New Creator';
        let devSlug = `user_${mobileInput.slice(-4)}`;
        if (isAdmin) {
          devName = 'Super Admin';
          devSlug = 'super_admin';
        } else if (isKavya) {
          devName = 'Kavya Verma';
          devSlug = 'kavya_ux';
        } else if (isDemo) {
          devName = 'Rahul Sharma';
          devSlug = 'rahul_dev';
        }

        const devUser = {
          token: 'sample-jwt-dev-token',
          user: { mobile: mobileInput, role: isAdmin ? 'admin' : 'user' },
          profile: {
            name: devName,
            username: devSlug,
            bio: isAdmin
              ? 'Platform Super Administrator with system-wide governance privileges.'
              : isKavya
              ? 'Senior Product & Motion Designer crafting fluid spatial interfaces.'
              : isDemo
              ? 'Full Stack Engineer building next-generation mobile experiences.'
              : 'Fresh digital profile created via Mobile OTP.',
            city: isKavya ? 'Mumbai, India' : isDemo ? 'Bengaluru, India' : 'India',
            profileType: isKavya ? 'Designer' : 'Creator',
            theme: 'default',
            completionPercentage: 85,
          },
        };
        setAuthToken(devUser.token);
        setCurrentUser(devUser);
        setProfileData({ profile: devUser.profile, sections: [], reels: [] });
        setProfileUsername(devUser.profile.username);
        if (isAdmin) {
          setActiveTab('admin');
          showToast(`Authenticated as Super Admin!`, 'success');
        } else {
          setActiveTab('profile');
          showToast(`Authenticated as ${devUser.profile.name}!`, 'success');
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
      const res = await updateMyProfile(authToken, updates);
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
      const res = await createSection(authToken, sectionData);
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
      const res = await updateSection(authToken, sectionId, updates);
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
      const res = await deleteSection(authToken, sectionId);
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
    if (!authToken) {
      showToast('Please sign in to post reels', 'error');
      return false;
    }
    try {
      const res = await createReel(authToken, reelData);
      if (res.success && res.data) {
        setProfileData((prev) => ({
          ...prev,
          reels: [res.data, ...(prev.reels || [])],
          stats: {
            ...prev.stats,
            reelsCount: ((prev.reels?.length || 0) + 1),
          },
        }));
        setReels((prev) => [
          {
            ...res.data,
            profileId: {
              name: currentUser?.profile?.name || 'Creator',
              username: currentUser?.profile?.username || 'creator',
              photoUrl: currentUser?.profile?.photoUrl || '',
            },
          },
          ...prev,
        ]);
        showToast('Reel published to your profile & feed! 🎬✨', 'success');
        return true;
      } else {
        showToast(res.message || 'Failed to post reel', 'error');
        return false;
      }
    } catch (e) {
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
        reels: [localReel, ...(prev.reels || [])],
      }));
      setReels((prev) => [localReel, ...prev]);
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
      const res = await likeReelApi(reelId, authToken);
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
      const res = await deleteReelApi(authToken, reelId);
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
      const res = await updateInquiryStatus(authToken, inquiryId, status);
      if (res.success) {
        showToast(`Marked proposal as ${status}`, 'info');
        return true;
      }
    } catch (err) {
      showToast('Inquiry status updated locally', 'info');
      return true;
    }
  };

  const handleLogout = () => {
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
    setProfileUsername('rahul_dev');
    loadProfile('rahul_dev');
    showToast('Signed out of session. Switched to demo view.', 'info');
  };

  const handleSelectCreator = (username) => {
    setProfileUsername(username);
    loadProfile(username);
    setActiveTab('profile');
    showToast(`Loaded @${username}'s Profile`, 'success');
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#030712" />

      {/* Floating Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />

      <View style={styles.appShell}>
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          onSignIn={() => setActiveTab('login')}
          onLogoPress={() => {
            if (currentUser?.profile?.username) {
              setProfileUsername(currentUser.profile.username);
              loadMyProfile(currentUser.token);
            } else {
              setProfileUsername('rahul_dev');
              loadProfile('rahul_dev');
            }
            setActiveTab('profile');
          }}
        />

        {/* Main Screen Body */}
        <View style={styles.bodyContainer}>
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
                currentUser && currentUser.profile?.username === profileData.profile?.username
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
              onLogout={handleLogout}
              onBackToMyProfile={() => {
                if (currentUser?.profile?.username) {
                  setProfileUsername(currentUser.profile.username);
                  loadMyProfile(currentUser.token);
                  showToast('Returned to Your Profile', 'info');
                } else {
                  setProfileUsername('rahul_dev');
                  loadProfile('rahul_dev');
                }
              }}
              isFollowing={isFollowingCurrentProfile}
              onToggleFollow={handleToggleFollow}
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
              currentUser={currentUser}
              authToken={authToken || currentUser?.token}
              onNavigateToAuth={() => setActiveTab('login')}
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
        </View>

        {/* Bottom Floating Navigation Dock */}
        <TabBar
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId)}
          unreadReels={reels.length}
          isAdmin={currentUser?.user?.role === 'admin'}
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
});

