import React from 'react';
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

export default function LoginScreen({
  mobileInput,
  setMobileInput,
  otpInput,
  setOtpInput,
  otpStep,
  setOtpStep,
  authMsg,
  authToken,
  onSendOtp,
  onVerifyOtp,
  onLogout,
  onNavigateToProfile,
  loading,
}) {
  const isStep1 = otpStep === 1;
  const sampleMobile = '9876543210';

  if (authToken) {
    return (
      <View style={styles.container}>
        <View style={styles.signedInCard}>
          <View style={styles.signedInAvatarRing}>
            <Text style={styles.signedInCheckIcon}>✓</Text>
          </View>

          <Text style={styles.signedInTitle}>Session Active</Text>
          <Text style={styles.signedInSubtitle}>
            Authenticated as verified user via Mobile OTP.
          </Text>

          <View style={styles.sessionDetailsBox}>
            <View style={styles.sessionRow}>
              <Text style={styles.sessionLabel}>MOBILE</Text>
              <Text style={styles.sessionValue}>{mobileInput || '+91 9876543210'}</Text>
            </View>
            <View style={styles.sessionDivider} />
            <View style={styles.sessionRow}>
              <Text style={styles.sessionLabel}>STATUS</Text>
              <Text style={styles.sessionStatusText}>● ONLINE & VERIFIED</Text>
            </View>
          </View>

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
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero Badge */}
      <View style={styles.heroSection}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeIcon}>🔐</Text>
          <Text style={styles.heroBadgeText}>PASSWORDLESS MOBILE OTP</Text>
        </View>

        <Text style={styles.heroTitle}>
          {isStep1 ? 'Sign In or Register' : 'Verify Mobile OTP'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {isStep1
            ? 'Access your digital profile dashboard with a fast 6-digit SMS verification.'
            : `Enter the verification code dispatched to ${mobileInput}.`}
        </Text>
      </View>

      {/* Auth Card */}
      <View style={styles.authCard}>
        {/* Step Indicator */}
        <View style={styles.stepsRow}>
          <View style={[styles.stepDot, isStep1 && styles.stepDotActive]}>
            <Text style={[styles.stepNum, isStep1 && styles.stepNumActive]}>1</Text>
          </View>
          <View style={[styles.stepConnector, !isStep1 && styles.stepConnectorActive]} />
          <View style={[styles.stepDot, !isStep1 && styles.stepDotActive]}>
            <Text style={[styles.stepNum, !isStep1 && styles.stepNumActive]}>2</Text>
          </View>
        </View>

        {isStep1 ? (
          /* STEP 1: Phone Entry */
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>YOUR MOBILE NUMBER</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.flagHolder}>
                <Text style={styles.flagText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#64748b"
                value={mobileInput}
                onChangeText={setMobileInput}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => setMobileInput(sampleMobile)}
            >
              <Text style={styles.sampleChipText}>
                ⚡ Tap to autofill demo number: {sampleMobile}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!mobileInput || loading) && styles.submitBtnDisabled,
              ]}
              onPress={onSendOtp}
              disabled={loading || !mobileInput}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Send 6-Digit OTP →</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* STEP 2: OTP Entry */
          <View style={styles.formContainer}>
            <View style={styles.phoneConfirmationRow}>
              <Text style={styles.confirmPhoneText}>Sent to {mobileInput}</Text>
              <TouchableOpacity onPress={() => setOtpStep(1)}>
                <Text style={styles.changePhoneText}>Change</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>ENTER VERIFICATION CODE</Text>

            <View style={styles.otpInputWrapper}>
              <TextInput
                style={styles.otpInput}
                placeholder="123456"
                placeholderTextColor="#64748b"
                value={otpInput}
                onChangeText={setOtpInput}
                keyboardType="number-pad"
                maxLength={6}
                letterSpacing={6}
              />
            </View>

            {/* Quick dev helper */}
            <TouchableOpacity
              style={styles.devOtpChip}
              onPress={() => setOtpInput('123456')}
            >
              <Text style={styles.devOtpText}>
                ⚡ Dev Mode: Tap to auto-enter test OTP "123456"
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!otpInput || loading) && styles.submitBtnDisabled,
              ]}
              onPress={onVerifyOtp}
              disabled={loading || !otpInput}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.submitBtnText}>Verify & Continue →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Status Message */}
        {authMsg ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{authMsg}</Text>
          </View>
        ) : null}
      </View>

      {/* Security Footer Pill */}
      <View style={styles.securityFooter}>
        <Text style={styles.secFootText}>
          🔒 End-to-End Encrypted Session • Stateless JWT Tokens
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
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
    marginBottom: 12,
  },
  heroBadgeIcon: {
    fontSize: 12,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: '88%',
  },
  authCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
  },
  stepNumActive: {
    color: '#020617',
  },
  stepConnector: {
    width: 32,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepConnectorActive: {
    backgroundColor: COLORS.primary,
  },
  formContainer: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  flagHolder: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  flagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  sampleChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    marginVertical: 4,
  },
  sampleChipText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
  },
  phoneConfirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  confirmPhoneText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  changePhoneText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
  },
  otpInputWrapper: {
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  otpInput: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  devOtpChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    marginVertical: 4,
  },
  devOtpText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 14,
    alignItems: 'center',
  },
  statusText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  securityFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  secFootText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  signedInCard: {
    margin: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 28,
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
  logoutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fb7185',
    fontWeight: '800',
    fontSize: 12,
  },
});
