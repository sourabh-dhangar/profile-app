import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme';

const CATEGORIES = [
  { id: 'IT & Software', label: '💻 IT & Tech' },
  { id: 'Salon & Beauty', label: '💇 Salon & Beauty' },
  { id: 'Retail & Commerce', label: '🏪 Retail & Store' },
  { id: 'Grocery & Supermarket', label: '🛒 Grocery & Mart' },
  { id: 'Restaurant & Food', label: '🍽️ Food & Dining' },
  { id: 'Doctor & Clinic', label: '🩺 Doctor & Clinic' },
  { id: 'Fitness & Health', label: '💪 Gym & Fitness' },
  { id: 'Fashion & Apparel', label: '👗 Fashion & Boutique' },
  { id: 'Electronics & Mobile', label: '📱 Mobile & Electronics' },
  { id: 'Automobile & Garage', label: '🚗 Auto & Garage' },
  { id: 'Professional Services', label: '💼 Professional Services' },
  { id: 'Content Creator & Artist', label: '🎬 Creator & Artist' },
];

export default function LoginScreen({
  mobileInput,
  setMobileInput,
  otpInput,
  setOtpInput,
  otpStep,
  setOtpStep,
  authMsg,
  authToken,
  currentUser,
  onSendOtp,
  onVerifyOtp,
  onLogout,
  onNavigateToProfile,
  onNavigateToAdmin,
  loading,
}) {
  // Tab Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signup'); // Default to Sign Up as requested by user

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('IT & Software');
  const [bio, setBio] = useState('');

  const isStep1 = otpStep === 1;

  // Handle Signup Submit -> triggers OTP dispatch
  const handleProceedSignup = () => {
    if (!fullName.trim()) return;
    if (!mobileInput || mobileInput.length < 10) return;
    onSendOtp();
  };

  // Handle Verify Submit with profile metadata
  const handleVerify = () => {
    if (authMode === 'signup') {
      onVerifyOtp({
        name: fullName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        profileType: category,
        category: category,
      });
    } else {
      onVerifyOtp();
    }
  };

  if (authToken) {
    const isAdmin = currentUser?.user?.role === 'admin';
    const profileName = currentUser?.profile?.name || 'Verified User';
    const profileHandle = currentUser?.profile?.username ? `@${currentUser.profile.username}` : '';
    const phoneDisplay = currentUser?.user?.mobile || mobileInput || 'Verified Account';

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
              <Text style={styles.sessionLabel}>MOBILE NUMBER</Text>
              <Text style={styles.sessionValue}>{phoneDisplay}</Text>
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Professional Brand Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeIcon}>✦</Text>
          <Text style={styles.heroBadgeText}>MYPROFILE DIGITAL IDENTITY</Text>
        </View>

        <Text style={styles.heroTitle}>
          {!isStep1
            ? 'Verify Verification Code'
            : authMode === 'signup'
            ? 'Create Your Profile'
            : 'Welcome Back'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {!isStep1
            ? `Enter the 6-digit verification code sent to +91 ${mobileInput}`
            : authMode === 'signup'
            ? 'Build your public portfolio, vertical reels, and direct client bookings.'
            : 'Sign in to access your existing digital profile dashboard.'}
        </Text>
      </View>

      {/* Main Authentication Card */}
      <View style={styles.authCard}>
        {/* Step 1 Mode Switcher (Sign In vs Create Profile) */}
        {isStep1 && (
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, authMode === 'signup' && styles.modeToggleBtnActive]}
              onPress={() => setAuthMode('signup')}
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

            <TouchableOpacity
              style={[styles.modeToggleBtn, authMode === 'signin' && styles.modeToggleBtnActive]}
              onPress={() => setAuthMode('signin')}
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
          </View>
        )}

        {/* Step Progress Indicators */}
        <View style={styles.stepsRow}>
          <View style={[styles.stepItem, isStep1 && styles.stepItemActive]}>
            <View style={[styles.stepBadge, isStep1 && styles.stepBadgeActive]}>
              <Text style={[styles.stepBadgeText, isStep1 && styles.stepBadgeTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, isStep1 && styles.stepLabelActive]}>
              {authMode === 'signup' ? 'Profile Details' : 'Mobile Number'}
            </Text>
          </View>

          <View style={[styles.stepLine, !isStep1 && styles.stepLineActive]} />

          <View style={[styles.stepItem, !isStep1 && styles.stepItemActive]}>
            <View style={[styles.stepBadge, !isStep1 && styles.stepBadgeActive]}>
              <Text style={[styles.stepBadgeText, !isStep1 && styles.stepBadgeTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, !isStep1 && styles.stepLabelActive]}>Verify OTP</Text>
          </View>
        </View>

        {isStep1 ? (
          authMode === 'signup' ? (
            /* ================= SIGN UP / CREATE PROFILE FORM ================= */
            <View style={styles.formContainer}>
              {/* Field 1: Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>FULL NAME / BUSINESS NAME *</Text>
                <View style={styles.standardInputWrapper}>
                  <TextInput
                    style={styles.standardInput}
                    placeholder="e.g. Sourabh Dhangar or Apex Studio"
                    placeholderTextColor="#64748b"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Field 2: Mobile Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>MOBILE NUMBER (FOR SMS & WHATSAPP) *</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.flagHolder}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.flagText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#64748b"
                    value={mobileInput}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setMobileInput(cleaned);
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Field 3: Email Address */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS (OPTIONAL)</Text>
                <View style={styles.standardInputWrapper}>
                  <TextInput
                    style={styles.standardInput}
                    placeholder="e.g. sourabh@example.com"
                    placeholderTextColor="#64748b"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Field 4: Business Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>PRIMARY PROFESSION / CATEGORY</Text>
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

              {/* Field 5: About / Bio */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>ABOUT YOU OR YOUR BUSINESS</Text>
                <View style={[styles.standardInputWrapper, styles.bioInputWrapper]}>
                  <TextInput
                    style={[styles.standardInput, styles.bioInput]}
                    placeholder="Briefly describe what you do, your services, projects, or store..."
                    placeholderTextColor="#64748b"
                    value={bio}
                    onChangeText={setBio}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!fullName.trim() || !mobileInput || mobileInput.length < 10 || loading) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={handleProceedSignup}
                disabled={!fullName.trim() || !mobileInput || mobileInput.length < 10 || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Profile & Send OTP →</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeRow}
                onPress={() => setAuthMode('signin')}
              >
                <Text style={styles.switchModeText}>
                  Already have a profile? <Text style={styles.switchModeHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ================= SIGN IN (EXISTING USER) FORM ================= */
            <View style={styles.formContainer}>
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>YOUR REGISTERED MOBILE NUMBER</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.flagHolder}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.flagText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#64748b"
                    value={mobileInput}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      setMobileInput(cleaned);
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    autoFocus={true}
                  />
                </View>
              </View>

              <View style={styles.securityHintRow}>
                <Text style={styles.securityHintIcon}>🔒</Text>
                <Text style={styles.securityHintText}>
                  Instant passwordless login via 6-digit SMS verification
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!mobileInput || mobileInput.length < 10 || loading) && styles.submitBtnDisabled,
                ]}
                onPress={onSendOtp}
                disabled={loading || !mobileInput || mobileInput.length < 10}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.submitBtnText}>Get Verification Code →</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeRow}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={styles.switchModeText}>
                  Don't have a profile yet?{' '}
                  <Text style={styles.switchModeHighlight}>Create Profile</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          /* ================= STEP 2: OTP VERIFICATION ================= */
          <View style={styles.formContainer}>
            <View style={styles.phoneConfirmationRow}>
              <View>
                <Text style={styles.confirmSubText}>
                  {authMode === 'signup' ? 'REGISTERING MOBILE' : 'VERIFYING CODE'}
                </Text>
                <Text style={styles.confirmPhoneText}>
                  {fullName ? `${fullName} • ` : ''}+91 {mobileInput}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editNumberBtn}
                onPress={() => setOtpStep(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.editNumberText}>Change</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>ENTER 6-DIGIT VERIFICATION CODE</Text>

            <View style={styles.otpInputWrapper}>
              <TextInput
                style={styles.otpInput}
                placeholder="••••••"
                placeholderTextColor="#475569"
                value={otpInput}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setOtpInput(cleaned);
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!otpInput || otpInput.length < 6 || loading) && styles.submitBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={loading || !otpInput || otpInput.length < 6}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {authMode === 'signup' ? 'Complete Profile Creation & Launch →' : 'Verify & Sign In →'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={onSendOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>Didn't receive code? Resend SMS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status / Error Message */}
        {authMsg ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{authMsg}</Text>
          </View>
        ) : null}
      </View>

      {/* Professional Value Highlights Card */}
      {isStep1 && (
        <View style={styles.valueCard}>
          <Text style={styles.valueCardTitle}>✦ All-In-One Professional Identity</Text>
          <View style={styles.valueItem}>
            <Text style={styles.valueBullet}>🌐</Text>
            <View style={styles.valueItemContent}>
              <Text style={styles.valueItemHeader}>Custom Digital Identity Link</Text>
              <Text style={styles.valueItemDesc}>One link for your portfolio, resume, projects, and rate card.</Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Text style={styles.valueBullet}>🎬</Text>
            <View style={styles.valueItemContent}>
              <Text style={styles.valueItemHeader}>Vertical Portfolio Reels</Text>
              <Text style={styles.valueItemDesc}>Showcase high-resolution video work, product demos & pitches.</Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <Text style={styles.valueBullet}>💼</Text>
            <View style={styles.valueItemContent}>
              <Text style={styles.valueItemHeader}>Direct Bookings & Inquiries</Text>
              <Text style={styles.valueItemDesc}>Allow clients to WhatsApp or book you with zero platform commission.</Text>
            </View>
          </View>
        </View>
      )}

      {/* Security Footer */}
      <View style={styles.securityFooter}>
        <Text style={styles.secFootText}>
          🔒 256-Bit SSL Encrypted • Privacy Protected
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
    marginBottom: 10,
  },
  heroBadgeIcon: {
    fontSize: 12,
    color: '#34d399',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: '92%',
  },
  authCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeToggleBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  modeToggleTextActive: {
    color: '#34d399',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.5,
  },
  stepItemActive: {
    opacity: 1,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
    color: '#94a3b8',
  },
  stepLabelActive: {
    color: '#ffffff',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 12,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  formContainer: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.8,
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
    fontSize: 15,
    fontWeight: '600',
  },
  bioInputWrapper: {
    borderRadius: 14,
  },
  bioInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  flagHolder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  flagIcon: {
    fontSize: 16,
  },
  flagText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  securityHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
  },
  securityHintIcon: {
    fontSize: 11,
  },
  securityHintText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 16,
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
    fontSize: 15,
    letterSpacing: -0.2,
  },
  switchModeRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchModeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  switchModeHighlight: {
    color: '#34d399',
    fontWeight: '800',
  },
  phoneConfirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 4,
  },
  confirmSubText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  confirmPhoneText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  editNumberBtn: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  editNumberText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },
  otpInputWrapper: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  otpInput: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
    letterSpacing: 10,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 16,
    alignItems: 'center',
  },
  statusText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  valueCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  valueCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  valueBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  valueItemContent: {
    flex: 1,
  },
  valueItemHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  valueItemDesc: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  securityFooter: {
    alignItems: 'center',
    marginTop: 24,
  },
  secFootText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  signedInCard: {
    marginVertical: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  signedInAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 14,
  },
  signedInCheckIcon: {
    fontSize: 26,
    color: '#34d399',
    fontWeight: '900',
  },
  signedInTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  signedInSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  sessionDetailsBox: {
    width: '100%',
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    borderRadius: 16,
    padding: 14,
    marginVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
    fontWeight: '700',
    color: '#ffffff',
  },
  sessionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  sessionStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34d399',
  },
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
  },
  adminDashboardBtn: {
    backgroundColor: '#facc15',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  adminDashboardBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 13,
  },
});
