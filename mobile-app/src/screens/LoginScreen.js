import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { COLORS } from '../theme';
import {
  loginWithEmailApi,
  registerRequestOtpApi,
  registerVerifyApi,
  forgotPasswordRequestOtpApi,
  resetPasswordWithOtpApi,
} from '../services/api';

const CATEGORIES = [
  { id: 'Creator', label: '🎨 Content Creator & Artist' },
  { id: 'IT & Software', label: '💻 IT & Software' },
  { id: 'Professional', label: '⚖️ Professional Services' },
  { id: 'Freelancer', label: '⚡ Freelancer & Consultant' },
  { id: 'Engineer', label: '🛠️ Engineer & Builder' },
  { id: 'Designer', label: '📐 UI/UX & Graphic Designer' },
  { id: 'Student', label: '🎓 Student & Learner' },
  { id: 'SmallBusiness', label: '🏢 Small Business & Startup' },
  { id: 'ServiceProvider', label: '🤝 Service Provider' },
  { id: 'Custom', label: '✨ Custom Category' },
];

export default function LoginScreen({
  authToken,
  currentUser,
  onAuthSuccess,
  onLogout,
  onNavigateToProfile,
  onNavigateToAdmin,
  onShowToast,
}) {
  // Modes: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState('signin');
  // Steps for signup / forgot: 1 = email/details, 2 = OTP + password
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('Creator');
  const [customCategory, setCustomCategory] = useState('');
  const [bio, setBio] = useState('');
  const [otp, setOtp] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetFeedback = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchMode = (mode) => {
    resetFeedback();
    setAuthMode(mode);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
  };

  const toast = (msg, type = 'info') => {
    if (typeof onShowToast === 'function') {
      onShowToast(msg, type);
    }
  };

  // Helper: Autofill Super Admin credentials
  const handleFillAdmin = () => {
    resetFeedback();
    setAuthMode('signin');
    setEmail('admin@myprofile.com');
    setPassword('Admin@myprofile2026!');
    toast('Autofilled Super Admin credentials', 'info');
  };

  // ==========================================
  // 1. SIGN IN (Email + Password)
  // ==========================================
  const handleSignIn = async () => {
    resetFeedback();

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmailApi(email, password);
      if (res.success && res.data) {
        toast('Login successful!', 'success');
        if (onAuthSuccess) {
          await onAuthSuccess(res.data);
        }
      } else {
        const msg = res.message || 'Login failed. Please check your credentials.';
        setErrorMsg(msg);
        toast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Network error. Please check your connection.';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. SIGN UP: STEP 1 (Send Email OTP)
  // ==========================================
  const handleRegisterSendOtp = async () => {
    resetFeedback();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name or business name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!ageConfirmed) {
      setErrorMsg('Please confirm you are 18+ or have guardian consent');
      return;
    }

    setLoading(true);
    try {
      const res = await registerRequestOtpApi(email, fullName);
      if (res.success) {
        setStep(2);
        const msg = `Verification code sent to ${email.trim()}. Please check your email inbox.`;
        setSuccessMsg(msg);
        toast(msg, 'success');
      } else {
        const msg = res.message || 'Failed to send verification code.';
        setErrorMsg(msg);
        toast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Network error. Please try again.';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. SIGN UP: STEP 2 (Verify OTP & Set Password)
  // ==========================================
  const handleRegisterVerify = async () => {
    resetFeedback();

    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    const effectiveCategory = category === 'Custom' ? (customCategory.trim() || 'Creator') : category;

    setLoading(true);
    try {
      const res = await registerVerifyApi({
        email,
        otp: otp.trim(),
        password,
        name: fullName.trim(),
        bio: bio.trim(),
        profileType: effectiveCategory,
        category: effectiveCategory,
        customCategory: category === 'Custom' ? customCategory.trim() : '',
      });

      if (res.success && res.data) {
        toast('Account created successfully!', 'success');
        if (onAuthSuccess) {
          await onAuthSuccess(res.data);
        }
      } else {
        const msg = res.message || 'Registration verification failed.';
        setErrorMsg(msg);
        toast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Network error. Please try again.';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. FORGOT PASSWORD: STEP 1 (Send Recovery OTP)
  // ==========================================
  const handleForgotSendOtp = async () => {
    resetFeedback();

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter your registered email address');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPasswordRequestOtpApi(email);
      if (res.success) {
        setStep(2);
        const msg = `Recovery code sent to ${email.trim()}. Please check your email inbox.`;
        setSuccessMsg(msg);
        toast(msg, 'success');
      } else {
        const msg = res.message || 'No registered account found with this email.';
        setErrorMsg(msg);
        toast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Network error. Please try again.';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. FORGOT PASSWORD: STEP 2 (Reset Password)
  // ==========================================
  const handleResetPassword = async () => {
    resetFeedback();

    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit recovery code');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithOtpApi(email, otp.trim(), password);
      if (res.success) {
        setAuthMode('signin');
        setStep(1);
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        const successText = 'Password reset successfully! Please log in with your new password.';
        setSuccessMsg(successText);
        toast(successText, 'success');
      } else {
        const msg = res.message || 'Password reset failed. Invalid or expired code.';
        setErrorMsg(msg);
        toast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Network error. Please try again.';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGGED IN SESSION CARD
  // ==========================================
  if (authToken || currentUser?.token) {
    const isAdmin = currentUser?.user?.role === 'admin';
    const profileName = currentUser?.profile?.name || currentUser?.user?.name || 'Verified Creator';
    const profileHandle = currentUser?.profile?.username ? `@${currentUser.profile.username}` : '';
    const emailDisplay = currentUser?.user?.email || email || 'Verified Account';

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.signedInCard}>
          <View style={styles.signedInAvatarRing}>
            <Text style={styles.signedInCheckIcon}>✓</Text>
          </View>

          <Text style={styles.signedInTitle}>Session Active</Text>
          <Text style={styles.signedInSubtitle}>
            Logged in as {profileName} {profileHandle ? `(${profileHandle})` : ''}
          </Text>

          <View style={styles.sessionDetailsBox}>
            <View style={styles.sessionRow}>
              <Text style={styles.sessionLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.sessionValue}>{emailDisplay}</Text>
            </View>
            <View style={styles.sessionDivider} />
            <View style={styles.sessionRow}>
              <Text style={styles.sessionLabel}>STATUS</Text>
              <Text style={styles.sessionStatusText}>● SECURE SESSION ACTIVE</Text>
            </View>
            {isAdmin && (
              <>
                <View style={styles.sessionDivider} />
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>PRIVILEGES</Text>
                  <Text style={[styles.sessionStatusText, { color: '#facc15' }]}>👑 SUPER ADMIN</Text>
                </View>
              </>
            )}
          </View>

          {isAdmin && (
            <TouchableOpacity
              style={[styles.primaryActionBtn, styles.adminDashboardBtn]}
              onPress={onNavigateToAdmin}
              activeOpacity={0.8}
            >
              <Text style={styles.adminDashboardBtnText}>👑 Open Super Admin Console →</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={onNavigateToProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionText}>View My Profile Screen →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Sign Out of Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ==========================================
  // AUTHENTICATION INTERFACE
  // ==========================================
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand Hero Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeIcon}>✦</Text>
          <Text style={styles.heroBadgeText}>MYPROFILE PLATFORM</Text>
        </View>

        <Text style={styles.heroTitle}>
          {authMode === 'signin' && 'Welcome Back'}
          {authMode === 'signup' && (step === 1 ? 'Create Your Profile' : 'Verify Email & Password')}
          {authMode === 'forgot' && (step === 1 ? 'Reset Your Password' : 'Set New Password')}
        </Text>
        <Text style={styles.heroSubtitle}>
          {authMode === 'signin' && 'Sign in with your email and password to access your dashboard.'}
          {authMode === 'signup' && (step === 1 ? 'Enter your details to receive an email verification code.' : `Enter the 6-digit code sent to ${email}`)}
          {authMode === 'forgot' && (step === 1 ? 'Enter your registered email to receive a password reset code.' : `Enter recovery code sent to ${email}`)}
        </Text>
      </View>

      {/* Main Authentication Card */}
      <View style={styles.authCard}>
        {/* Mode Switcher Tabs (Only when on Step 1 of Sign In or Sign Up) */}
        {authMode !== 'forgot' && step === 1 && (
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, authMode === 'signin' && styles.modeToggleBtnActive]}
              onPress={() => switchMode('signin')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  authMode === 'signin' && styles.modeToggleTextActive,
                ]}
              >
                🔐 Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeToggleBtn, authMode === 'signup' && styles.modeToggleBtnActive]}
              onPress={() => switchMode('signup')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  authMode === 'signup' && styles.modeToggleTextActive,
                ]}
              >
                ✨ Create Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Multi-Step Indicator for Signup / Forgot */}
        {(authMode === 'signup' || authMode === 'forgot') && (
          <View style={styles.stepsRow}>
            <View style={[styles.stepItem, step === 1 && styles.stepItemActive]}>
              <View style={[styles.stepBadge, step === 1 && styles.stepBadgeActive]}>
                <Text style={[styles.stepBadgeText, step === 1 && styles.stepBadgeTextActive]}>1</Text>
              </View>
              <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
                {authMode === 'signup' ? 'Details' : 'Email'}
              </Text>
            </View>

            <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />

            <View style={[styles.stepItem, step === 2 && styles.stepItemActive]}>
              <View style={[styles.stepBadge, step === 2 && styles.stepBadgeActive]}>
                <Text style={[styles.stepBadgeText, step === 2 && styles.stepBadgeTextActive]}>2</Text>
              </View>
              <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
                {authMode === 'signup' ? 'OTP & Password' : 'New Password'}
              </Text>
            </View>
          </View>
        )}

        {/* Feedback Banners */}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerIcon}>⚠️</Text>
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerIcon}>✓</Text>
            <Text style={styles.successBannerText}>{successMsg}</Text>
          </View>
        ) : null}

        {/* ==================================================== */}
        {/* 1. SIGN IN FORM                                      */}
        {/* ==================================================== */}
        {authMode === 'signin' && (
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.standardInputWrapper}>
                <TextInput
                  style={styles.standardInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TouchableOpacity
                  onPress={() => switchMode('forgot')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In →</Text>
              )}
            </TouchableOpacity>

            {/* Quick Fill Super Admin */}
            <TouchableOpacity
              style={styles.adminQuickFillBtn}
              onPress={handleFillAdmin}
              activeOpacity={0.8}
            >
              <Text style={styles.adminQuickFillText}>
                🛡️ Fill Super Admin (<Text style={styles.codeText}>admin@myprofile.com</Text>)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeRow}
              onPress={() => switchMode('signup')}
            >
              <Text style={styles.switchModeText}>
                Don't have a profile yet?{' '}
                <Text style={styles.switchModeHighlight}>Create Profile</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* 2. SIGN UP: STEP 1 (Details & Request OTP)           */}
        {/* ==================================================== */}
        {authMode === 'signup' && step === 1 && (
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>FULL NAME / CREATOR NAME *</Text>
              <View style={styles.standardInputWrapper}>
                <TextInput
                  style={styles.standardInput}
                  placeholder="e.g. Sourabh Dhangar"
                  placeholderTextColor="#64748b"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS (FOR VERIFICATION OTP) *</Text>
              <View style={styles.standardInputWrapper}>
                <TextInput
                  style={styles.standardInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>PROFILE ROLE / CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsRow}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                      onPress={() => setCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {category === 'Custom' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>ENTER CUSTOM CATEGORY</Text>
                <View style={styles.standardInputWrapper}>
                  <TextInput
                    style={styles.standardInput}
                    placeholder="e.g. Photographer, Fitness Coach, Chef..."
                    placeholderTextColor="#64748b"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>BIO / ABOUT YOU</Text>
              <View style={[styles.standardInputWrapper, styles.bioInputWrapper]}>
                <TextInput
                  style={[styles.standardInput, styles.bioInput]}
                  placeholder="Brief summary of your work, skills, or portfolio..."
                  placeholderTextColor="#64748b"
                  value={bio}
                  onChangeText={setBio}
                  multiline={true}
                  numberOfLines={2}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgeConfirmed(!ageConfirmed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkboxBox, ageConfirmed && styles.checkboxBoxChecked]}>
                {ageConfirmed && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I confirm I am 18+ or have guardian consent to create a profile.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!fullName.trim() || !email.trim() || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleRegisterSendOtp}
              disabled={loading || !fullName.trim() || !email.trim()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Send Verification Code →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeRow}
              onPress={() => switchMode('signin')}
            >
              <Text style={styles.switchModeText}>
                Already have an account?{' '}
                <Text style={styles.switchModeHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* 2. SIGN UP: STEP 2 (Verify OTP & Set Password)       */}
        {/* ==================================================== */}
        {authMode === 'signup' && step === 2 && (
          <View style={styles.formContainer}>
            <View style={styles.emailPillRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.confirmSubText}>VERIFICATION CODE SENT TO</Text>
                <Text style={styles.confirmEmailText}>{email}</Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setStep(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.editBtnText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>ENTER 6-DIGIT VERIFICATION CODE</Text>
              <View style={styles.otpInputWrapper}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="••••••"
                  placeholderTextColor="#475569"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>SET PASSWORD (MIN. 6 CHARACTERS)</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create strong password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter password"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!otp.trim() || !password || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleRegisterVerify}
              disabled={loading || !otp.trim() || !password}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Create Account & Publish →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>← Change Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* 3. FORGOT PASSWORD: STEP 1 (Request Reset OTP)       */}
        {/* ==================================================== */}
        {authMode === 'forgot' && step === 1 && (
          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>REGISTERED EMAIL ADDRESS</Text>
              <View style={styles.standardInputWrapper}>
                <TextInput
                  style={styles.standardInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!email.trim() || loading) && styles.submitBtnDisabled]}
              onPress={handleForgotSendOtp}
              disabled={loading || !email.trim()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Send Recovery OTP →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => switchMode('signin')}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================== */}
        {/* 3. FORGOT PASSWORD: STEP 2 (Reset Password)          */}
        {/* ==================================================== */}
        {authMode === 'forgot' && step === 2 && (
          <View style={styles.formContainer}>
            <View style={styles.emailPillRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.confirmSubText}>RECOVERY CODE SENT TO</Text>
                <Text style={styles.confirmEmailText}>{email}</Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setStep(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.editBtnText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>ENTER 6-DIGIT RECOVERY CODE</Text>
              <View style={styles.otpInputWrapper}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="••••••"
                  placeholderTextColor="#475569"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>NEW PASSWORD (MIN. 6 CHARACTERS)</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!otp.trim() || !password || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading || !otp.trim() || !password}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Confirm & Reset Password →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => switchMode('signin')}
              activeOpacity={0.7}
            >
              <Text style={styles.backBtnText}>← Cancel & Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Google Play Compliant Privacy Policy Link */}
      <View style={styles.privacyFooter}>
        <Text style={styles.privacyFooterText}>
          By continuing, you agree to MyProfile's{' '}
          <Text
            style={styles.privacyLink}
            onPress={() => Linking.openURL('https://myprofile-official-web.vercel.app/privacy')}
          >
            Privacy Policy & Data Safety
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 10,
    gap: 6,
  },
  heroBadgeIcon: {
    color: '#10b981',
    fontSize: 12,
  },
  heroBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  authCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
  },
  modeToggleTextActive: {
    color: '#020617',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepItemActive: {},
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
  },
  stepBadgeTextActive: {
    color: '#020617',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  stepLabelActive: {
    color: '#ffffff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerIcon: {
    fontSize: 14,
  },
  errorBannerText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  successBannerIcon: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '900',
  },
  successBannerText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  formContainer: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  forgotPasswordLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  standardInputWrapper: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  standardInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeIcon: {
    fontSize: 14,
  },
  bioInputWrapper: {
    borderRadius: 14,
  },
  bioInput: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#34d399',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  categoryChipTextSelected: {
    color: '#34d399',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxCheck: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 11,
    color: '#94a3b8',
    flex: 1,
    lineHeight: 15,
  },
  emailPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  confirmSubText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  confirmEmailText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  otpInputWrapper: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#10b981',
    alignItems: 'center',
    paddingVertical: 6,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    color: '#34d399',
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  adminQuickFillBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  adminQuickFillText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  codeText: {
    color: '#38bdf8',
    fontFamily: 'monospace',
  },
  switchModeRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchModeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  switchModeHighlight: {
    color: '#34d399',
    fontWeight: '800',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backBtnText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  // Signed-in Active Card
  signedInCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  signedInAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signedInCheckIcon: {
    fontSize: 28,
    color: '#10b981',
    fontWeight: '900',
  },
  signedInTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  signedInSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  sessionDetailsBox: {
    width: '100%',
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
    gap: 10,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  sessionValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  sessionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  sessionStatusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  primaryActionBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
  },
  adminDashboardBtn: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderWidth: 1.5,
    borderColor: '#facc15',
  },
  adminDashboardBtnText: {
    color: '#facc15',
    fontWeight: '900',
    fontSize: 14,
  },
  logoutBtn: {
    paddingVertical: 10,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  privacyFooter: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  privacyFooterText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  privacyLink: {
    color: '#10b981',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
