import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme';

export default function DiscoverScreen({
  searchPhone,
  setSearchPhone,
  onSearch,
  loading,
  discoverResult,
  discoverMsg,
  onSelectProfile,
}) {
  const [countryCode, setCountryCode] = useState('+91');

  const sampleNumbers = ['9876543210', '9123456789'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Privacy-Preserving Hero Badge */}
      <View style={styles.heroSection}>
        <View style={styles.privacyShieldBadge}>
          <Text style={styles.shieldIcon}>🔒</Text>
          <Text style={styles.shieldText}>HMAC-SHA256 ZERO-LEAKAGE LOOKUP</Text>
        </View>

        <Text style={styles.heroTitle}>Discover by Phone</Text>
        <Text style={styles.heroSubtitle}>
          Connect with colleagues & creators who have verified their number and opted into discovery.
        </Text>
      </View>

      {/* Security Guarantee Box */}
      <View style={styles.securityBox}>
        <View style={styles.securityHeader}>
          <Text style={styles.securityCheck}>🛡️</Text>
          <Text style={styles.securityTitle}>Privacy & Anti-Enumeration</Text>
        </View>
        <Text style={styles.securityBody}>
          Phone numbers are salted and irreversibly hashed. Unlisted numbers return an identical 404 response to prevent database scraping.
        </Text>
        <View style={styles.quotaPill}>
          <Text style={styles.quotaText}>QUOTA: 5 REQUESTS / MINUTE</Text>
        </View>
      </View>

      {/* Search Input Card */}
      <View style={styles.searchCard}>
        <Text style={styles.inputLabel}>ENTER MOBILE NUMBER</Text>

        <View style={styles.inputRow}>
          <View style={styles.countryPill}>
            <Text style={styles.countryText}>🇮🇳 {countryCode}</Text>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="10-digit number"
            placeholderTextColor="#64748b"
            value={searchPhone}
            onChangeText={setSearchPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <TouchableOpacity
            style={[
              styles.searchBtn,
              (!searchPhone || loading) && styles.searchBtnDisabled,
            ]}
            onPress={onSearch}
            disabled={loading || !searchPhone}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Discovery Result Card */}
      {discoverResult && (
        <View style={styles.resultWrapper}>
          <View style={styles.resultHeaderRow}>
            <Text style={styles.resultHeaderTitle}>✓ Profile Discovered</Text>
            <Text style={styles.resultMatchTag}>100% Match</Text>
          </View>

          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => onSelectProfile(discoverResult.username)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarHolder}>
              <Image
                source={{
                  uri:
                    discoverResult.photoUrl && !discoverResult.photoUrl.includes('photo-1534528741775')
                      ? discoverResult.photoUrl
                      : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(discoverResult.name || 'User') + '&background=1e293b&color=10b981&bold=true&size=256',
                }}
                style={styles.resultAvatar}
              />
              <View style={styles.resultVerifiedBadge}>
                <Text style={styles.resultVerifiedTick}>✓</Text>
              </View>
            </View>

            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{discoverResult.name}</Text>
              <Text style={styles.resultHandle}>
                @{discoverResult.username} • {discoverResult.profileType || 'Creator'}
              </Text>
              {discoverResult.category && (
                <Text style={{ fontSize: 11, color: '#38bdf8', fontWeight: '700', marginTop: 2 }}>
                  🏷️ {discoverResult.category}
                </Text>
              )}
              {discoverResult.city && (
                <Text style={styles.resultCity}>📍 {discoverResult.city}</Text>
              )}
            </View>

            <View style={styles.viewArrowCircle}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewFullProfileBtn}
            onPress={() => onSelectProfile(discoverResult.username)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewFullProfileText}>
              Open Verified Profile & Sections →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error / Not Found Message */}
      {discoverMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{discoverMsg}</Text>
        </View>
      ) : null}

      {/* Featured Business Categories & Digital Profiles */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.6, marginBottom: 12 }}>
          FEATURED BUSINESS & PROFESSIONAL PROFILES
        </Text>

        {[
          {
            username: 'ananya_hair_studio',
            name: 'Ananya Hair & Beauty Studio',
            category: '💇 Salon & Beauty',
            city: 'Bandra West, Mumbai',
            hours: '10:00 AM - 8:30 PM',
            tag: 'Bridal & Hair Spa',
            color: '#ec4899',
          },
          {
            username: 'rahul_dev',
            name: 'Rahul Sharma',
            category: '💻 IT & Software',
            city: 'Bengaluru, India',
            hours: 'Available for Hire',
            tag: 'Full-Stack Architect',
            color: '#06b6d4',
          },
          {
            username: 'dr_kavita_care',
            name: 'Dr. Kavita Verma Clinic',
            category: '🩺 Doctor & Clinic',
            city: 'Indiranagar, Bengaluru',
            hours: '10:00 AM - 7:00 PM',
            tag: 'Senior Consultant',
            color: '#10b981',
          },
        ].map((item) => (
          <TouchableOpacity
            key={item.username}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.08)',
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            activeOpacity={0.8}
            onPress={() => onSelectProfile(item.username)}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: item.color, backgroundColor: 'rgba(255, 255, 255, 0.06)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  {item.category}
                </Text>
                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '700' }}>
                  {item.tag}
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff' }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                📍 {item.city} • ⏰ {item.hours}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800' }}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    marginVertical: 14,
  },
  privacyShieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
    marginBottom: 10,
  },
  shieldIcon: {
    fontSize: 12,
  },
  shieldText: {
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
    maxWidth: '90%',
  },
  securityBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  securityCheck: {
    fontSize: 15,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  securityBody: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },
  quotaPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
  },
  quotaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  searchCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
  },
  countryPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchBtnDisabled: {
    opacity: 0.45,
  },
  searchBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 13,
  },
  samplesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  samplesLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  sampleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sampleChipText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '700',
  },
  resultWrapper: {
    marginTop: 20,
    gap: 10,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  resultHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34d399',
  },
  resultMatchTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarHolder: {
    position: 'relative',
    marginRight: 14,
  },
  resultAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#1e293b',
  },
  resultVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  resultVerifiedTick: {
    fontSize: 9,
    fontWeight: '900',
    color: '#020617',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  resultHandle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  resultCity: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
    marginTop: 3,
  },
  viewArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  arrowIcon: {
    color: '#34d399',
    fontSize: 16,
    fontWeight: '900',
  },
  viewFullProfileBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewFullProfileText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    marginTop: 16,
    gap: 10,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
});
