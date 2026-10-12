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
} from 'react-native';
import { COLORS, THEME_ACCENTS } from '../theme';
import { getVCardUrl } from '../services/api';

const { width } = Dimensions.get('window');

const SECTION_ICONS = {
  about: '👤',
  experience: '💼',
  education: '🎓',
  skills: '⚡',
  services: '🛠️',
  achievements: '🏆',
  contact: '📞',
  social: '🌐',
};

export default function ProfileScreen({
  profileData,
  loading,
  onRefresh,
  onShowToast,
  onSelectReelsTab,
}) {
  const [selectedTheme, setSelectedTheme] = useState('default');

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

  const { profile, sections = [], reels = [] } = profileData;
  const currentThemeKey = profile.theme || selectedTheme || 'default';
  const theme = THEME_ACCENTS[currentThemeKey] || THEME_ACCENTS['default'];

  const handleSaveContact = () => {
    const url = getVCardUrl(profile.username);
    Linking.openURL(url).catch(() => {
      onShowToast('Could not open vCard download link', 'error');
    });
    onShowToast('Downloading vCard Contact...', 'success');
  };

  const handleShare = () => {
    onShowToast(`Copied @${profile.username} profile link!`, 'success');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            }}
            style={[styles.avatar, { borderColor: theme.primary }]}
          />
          <View style={[styles.verifiedSparkle, { backgroundColor: theme.primary }]}>
            <Text style={styles.sparkleIcon}>✓</Text>
          </View>
        </View>

        {/* Name & Handle */}
        <Text style={styles.profileName}>{profile.name}</Text>
        
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

          {profile.city && (
            <View style={styles.cityBadge}>
              <Text style={styles.cityText}>📍 {profile.city}</Text>
            </View>
          )}
        </View>

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
              {profile.completionPercentage || 100}%
            </Text>
            <Text style={styles.metricLabel}>VERIFIED</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{reels.length || 3}</Text>
            <Text style={styles.metricLabel}>REELS</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>1.4K</Text>
            <Text style={styles.metricLabel}>VIEWS</Text>
          </View>
        </View>

        {/* Action Button Strip */}
        <View style={styles.actionStrip}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveContact}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionIcon}>📥</Text>
            <Text style={styles.primaryActionText}>Save Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionIcon}>🔗</Text>
            <Text style={styles.secondaryActionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={() => onShowToast('Inquiry request dispatched!', 'success')}
            activeOpacity={0.8}
          >
            <Text style={styles.iconActionGlyph}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Reels Carousel Preview Teaser */}
      <View style={styles.reelsTeaserCard}>
        <View style={styles.reelsTeaserHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionEmoji}>🎬</Text>
            <Text style={styles.sectionHeading}>Reels Showcase</Text>
          </View>
          <TouchableOpacity onPress={onSelectReelsTab}>
            <Text style={[styles.seeAllText, { color: theme.text }]}>
              Watch Feed →
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.reelsTeaserSub}>
          Short 60s video introductions & project walkthroughs.
        </Text>
      </View>

      {/* Modular Profile Sections */}
      <View style={styles.sectionsContainer}>
        <View style={styles.sectionsTitleRow}>
          <Text style={styles.sectionsMainTitle}>Curated Portfolio & Details</Text>
          <Text style={styles.sectionsCount}>
            {sections.length} Active Modules
          </Text>
        </View>

        {sections.length === 0 ? (
          <View style={styles.noSectionsBox}>
            <Text style={styles.noSectionsText}>
              No extra sections added yet. Check back soon!
            </Text>
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
                  <View style={styles.sectionIndexBadge}>
                    <Text style={styles.sectionIndexText}>#{idx + 1}</Text>
                  </View>
                </View>

                {/* Section Content Rendering */}
                {section.content?.items && Array.isArray(section.content.items) ? (
                  <View style={styles.pillsContainer}>
                    {section.content.items.map((item, itemIdx) => (
                      <View
                        key={itemIdx}
                        style={[
                          styles.skillPill,
                          {
                            borderColor:
                              itemIdx === 0 ? theme.badgeBorder : 'rgba(255,255,255,0.1)',
                          },
                        ]}
                      >
                        <Text style={styles.skillPillText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.sectionBodyText}>
                    {section.content?.text || 'No description provided.'}
                  </Text>
                )}
              </View>
            );
          })
        )}
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
    fontSize: 11,
    color: '#020617',
    fontWeight: '900',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  handleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  handleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
  },
  cityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cityText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  bioCard: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    width: '100%',
  },
  bioText: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 19,
    fontWeight: '500',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 18,
    paddingVertical: 12,
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 16,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionIcon: {
    fontSize: 13,
  },
  primaryActionText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 13,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  secondaryActionIcon: {
    fontSize: 13,
  },
  secondaryActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionGlyph: {
    fontSize: 16,
  },
  reelsTeaserCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reelsTeaserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reelsTeaserSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sectionsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionsMainTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  sectionsCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  noSectionsBox: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  noSectionsText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    marginTop: 2,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillPill: {
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
});
