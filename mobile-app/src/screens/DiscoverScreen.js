import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../theme';
import { browseProfilesApi } from '../services/api';

const CATEGORIES = [
  { id: 'All', label: '🌟 All Profiles' },
  { id: 'Doctor & Clinic', label: '🩺 Doctor & Clinic', color: '#10b981' },
  { id: 'Salon & Beauty', label: '💇 Salon & Beauty', color: '#ec4899' },
  { id: 'IT & Software', label: '💻 IT & Tech', color: '#06b6d4' },
  { id: 'Content Creator & Artist', label: '🎬 Creator & Artist', color: '#a855f7' },
  { id: 'Fitness & Health', label: '💪 Gym & Fitness', color: '#f59e0b' },
  { id: 'Restaurant & Food', label: '🍽️ Food & Dining', color: '#f97316' },
  { id: 'Fashion & Apparel', label: '👗 Fashion & Boutique', color: '#e11d48' },
  { id: 'Professional Services', label: '💼 Professional Services', color: '#3b82f6' },
  { id: 'Grocery & Supermarket', label: '🛒 Grocery & Mart', color: '#22c55e' },
  { id: 'Electronics & Mobile', label: '📱 Mobile & Electronics', color: '#6366f1' },
];

const SAMPLE_NUMBERS = [
  { phone: '9820112233', label: '🩺 Dr. Arjun Mehta' },
  { phone: '9820223344', label: '📸 Pooja Hegde' },
  { phone: '9820334455', label: '🍽️ Chef Kabir' },
  { phone: '9820445566', label: '💪 Rohan Fitness' },
  { phone: '9820556677', label: '👗 Natasha Roy' },
  { phone: '9811223344', label: '🎨 Kavya Verma' },
  { phone: '9876543210', label: '💻 Rahul Sharma' },
];

export default function DiscoverScreen({
  searchPhone,
  setSearchPhone,
  onSearch,
  loading,
  discoverResult,
  discoverMsg,
  onSelectProfile,
}) {
  const [activeView, setActiveView] = useState('browse'); // 'browse' | 'phone'
  const [countryCode, setCountryCode] = useState('+91');

  // Directory Browse State
  const [profiles, setProfiles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDirectoryProfiles = async (category = selectedCategory, query = searchQuery) => {
    setLoadingDirectory(true);
    try {
      const res = await browseProfilesApi(category, query, '', 1, 30);
      if (res.success && res.data?.profiles) {
        setProfiles(res.data.profiles);
        setTotalCount(res.data.total || res.data.profiles.length);
      }
    } catch (err) {
      console.log('Error browsing directory profiles:', err.message);
    } finally {
      setLoadingDirectory(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDirectoryProfiles(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleSearchSubmit = () => {
    loadDirectoryProfiles(selectedCategory, searchQuery);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDirectoryProfiles(selectedCategory, searchQuery);
  };

  const getCategoryColor = (catName) => {
    const found = CATEGORIES.find((c) => c.id === catName);
    return found?.color || '#38bdf8';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* View Switcher: Directory vs Phone Lookup */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity
          style={[styles.switchBtn, activeView === 'browse' && styles.switchBtnActive]}
          onPress={() => setActiveView('browse')}
          activeOpacity={0.8}
        >
          <Text style={[styles.switchBtnText, activeView === 'browse' && styles.switchBtnTextActive]}>
            🌐 Explore Directory {totalCount > 0 ? `(${totalCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, activeView === 'phone' && styles.switchBtnActive]}
          onPress={() => setActiveView('phone')}
          activeOpacity={0.8}
        >
          <Text style={[styles.switchBtnText, activeView === 'phone' && styles.switchBtnTextActive]}>
            🔒 Find by Phone
          </Text>
        </TouchableOpacity>
      </View>

      {/* VIEW 1: DIRECTORY BROWSER */}
      {activeView === 'browse' ? (
        <View>
          {/* Header Badge & Title */}
          <View style={styles.heroSection}>
            <View style={styles.verifiedCountBadge}>
              <Text style={{ fontSize: 13 }}>🟢</Text>
              <Text style={styles.verifiedCountText}>
                {totalCount > 0 ? `${totalCount}+ PROFILES IN DATABASE` : 'LIVE DATABASE DIRECTORY'}
              </Text>
            </View>
            <Text style={styles.heroTitle}>Discover Verified Profiles</Text>
            <Text style={styles.heroSubtitle}>
              Explore verified doctors, creators, salon artists, engineers & businesses across India.
            </Text>
          </View>

          {/* Search Box */}
          <View style={styles.directorySearchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.directorySearchInput}
              placeholder="Search by name, skill, category, city..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  loadDirectoryProfiles(selectedCategory, '');
                }}
                style={styles.clearBtn}
              >
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchSubmitBtn}
              onPress={handleSearchSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.searchSubmitBtnText}>Go</Text>
            </TouchableOpacity>
          </View>

          {/* Category Chips Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsContainer}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                    isSelected && cat.color && { borderColor: cat.color },
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                      isSelected && cat.color && { color: cat.color },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Directory Profile List */}
          {loadingDirectory ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingSubtext}>Loading verified profiles from database...</Text>
            </View>
          ) : profiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🔍</Text>
              <Text style={styles.emptyTitle}>No Profiles Found</Text>
              <Text style={styles.emptySubtext}>
                No profiles match "{searchQuery}" in {selectedCategory}.
              </Text>
              <TouchableOpacity
                style={styles.resetFiltersBtn}
                onPress={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  loadDirectoryProfiles('All', '');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileCardsList}>
              {profiles.map((item) => {
                const badgeColor = getCategoryColor(item.category);
                const avatarUri =
                  item.photoUrl && !item.photoUrl.includes('photo-1534528741775')
                    ? item.photoUrl
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=0f172a&color=10b981&bold=true&size=256`;

                const businessName = item.businessDetails?.businessName;
                const tagline = item.businessDetails?.tagline;

                return (
                  <TouchableOpacity
                    key={item._id || item.username}
                    style={styles.profileCard}
                    activeOpacity={0.85}
                    onPress={() => onSelectProfile(item.username)}
                  >
                    {/* Top Row: Avatar + Details */}
                    <View style={styles.cardHeader}>
                      <View style={styles.avatarWrap}>
                        <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                        <View style={styles.verifiedTickBadge}>
                          <Text style={{ fontSize: 9, fontWeight: '900', color: '#020617' }}>✓</Text>
                        </View>
                      </View>

                      <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.cardName}>{item.name}</Text>
                        </View>
                        <Text style={styles.cardHandle}>
                          @{item.username} • <Text style={{ color: '#cbd5e1' }}>{item.profileType || 'Creator'}</Text>
                        </Text>

                        {/* Category Pill */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                          <View
                            style={[
                              styles.catBadge,
                              { backgroundColor: `${badgeColor}18`, borderColor: `${badgeColor}40` },
                            ]}
                          >
                            <Text style={[styles.catBadgeText, { color: badgeColor }]}>
                              {item.category || 'General'}
                            </Text>
                          </View>
                          {item.city ? (
                            <Text style={styles.cardCity}>📍 {item.city}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {/* Business Name or Bio Preview */}
                    {businessName ? (
                      <View style={styles.businessSnippet}>
                        <Text style={styles.businessNameText}>🏢 {businessName}</Text>
                        {tagline ? <Text style={styles.taglineText}>"{tagline}"</Text> : null}
                      </View>
                    ) : item.bio ? (
                      <Text style={styles.bioSnippet} numberOfLines={2}>
                        {item.bio}
                      </Text>
                    ) : null}

                    {/* Bottom Action Row */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.viewProfilePrompt}>Tap to open digital profile & links</Text>
                      <View style={styles.arrowCircle}>
                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '900' }}>→</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      ) : (
        /* VIEW 2: PHONE LOOKUP */
        <View>
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

            {/* Quick Sample Numbers */}
            <View style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>
                TAP TO TEST VERIFIED PROFILES:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {SAMPLE_NUMBERS.map((s) => (
                  <TouchableOpacity
                    key={s.phone}
                    style={styles.sampleChip}
                    onPress={() => {
                      setSearchPhone(s.phone);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sampleChipText}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(discoverResult.name || 'User')}&background=1e293b&color=10b981&bold=true&size=256`,
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
        </View>
      )}
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
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  switchBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  switchBtnTextActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  verifiedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 6,
    marginBottom: 8,
  },
  verifiedCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 22,
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
  directorySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  directorySearchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 8,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  searchSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 6,
  },
  searchSubmitBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 12,
  },
  categoryChipsContainer: {
    paddingVertical: 6,
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  categoryChipTextSelected: {
    fontWeight: '900',
  },
  centerLoading: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetFiltersBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  resetFiltersBtnText: {
    color: '#34d399',
    fontWeight: '800',
    fontSize: 12,
  },
  profileCardsList: {
    gap: 12,
  },
  profileCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#1e293b',
  },
  verifiedTickBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardHandle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardCity: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  businessSnippet: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  businessNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  taglineText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  bioSnippet: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  viewProfilePrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  sampleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
