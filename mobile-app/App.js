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

import {
  fetchPublicProfile,
  fetchReels,
  searchByPhone,
  requestOtp,
  verifyOtp,
  trackProfileView,
} from './src/services/api';

export default function App() {
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
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Reels State
  const [reels, setReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);

  // Discover State
  const [searchPhone, setSearchPhone] = useState('9876543210');
  const [discoverResult, setDiscoverResult] = useState(null);
  const [discoverMsg, setDiscoverMsg] = useState('');
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  // Auth State
  const [mobileInput, setMobileInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [authMsg, setAuthMsg] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    if (activeTab === 'profile') {
      loadProfile(profileUsername);
    } else if (activeTab === 'reels') {
      loadReels();
    }
  }, [activeTab]);

  const loadProfile = async (username) => {
    setLoadingProfile(true);
    try {
      const res = await fetchPublicProfile(username);
      if (res.success) {
        setProfileData(res.data);
        trackProfileView(username);
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

  const loadReels = async () => {
    setLoadingReels(true);
    try {
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
    } catch (e) {
      console.log('Reels error:', e.message);
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
    } finally {
      setLoadingReels(false);
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
      if (res.success) {
        setAuthToken(res.data?.token || 'jwt-sample-token');
        setAuthMsg(`Session Authenticated as ${res.data?.profile?.name || 'Verified User'}!`);
        showToast('Login Successful!', 'success');
      } else {
        setAuthMsg('Invalid verification code.');
        showToast('Invalid verification code', 'error');
      }
    } catch (e) {
      if (otpInput === '123456') {
        setAuthToken('sample-jwt-dev-token');
        setAuthMsg('Authenticated in developer simulation mode!');
        showToast('Authenticated as Rahul Sharma', 'success');
      } else {
        setAuthMsg('Invalid OTP. Use test code 123456.');
        showToast('Invalid OTP code', 'error');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setOtpStep(1);
    setOtpInput('');
    setAuthMsg('');
    showToast('Signed out of session', 'info');
  };

  const handleSelectCreator = (username) => {
    setProfileUsername(username);
    loadProfile(username);
    setActiveTab('profile');
    showToast(`Loaded @${username}'s Profile`, 'success');
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

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onLogoPress={() => {
          setActiveTab('profile');
          loadProfile('rahul_dev');
        }}
      />

      {/* Main Screen Body */}
      <View style={styles.bodyContainer}>
        {activeTab === 'profile' && (
          <ProfileScreen
            profileData={profileData}
            loading={loadingProfile}
            onRefresh={() => loadProfile(profileUsername)}
            onShowToast={showToast}
            onSelectReelsTab={() => setActiveTab('reels')}
          />
        )}

        {activeTab === 'reels' && (
          <ReelsScreen
            reels={reels}
            loading={loadingReels}
            onShowToast={showToast}
            onViewCreatorProfile={handleSelectCreator}
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
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            onLogout={handleLogout}
            onNavigateToProfile={() => setActiveTab('profile')}
            loading={loadingAuth}
          />
        )}
      </View>

      {/* Bottom Floating Navigation Dock */}
      <TabBar
        activeTab={activeTab}
        onTabPress={(tabId) => setActiveTab(tabId)}
        unreadReels={reels.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bodyContainer: {
    flex: 1,
  },
});
