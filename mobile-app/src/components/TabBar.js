import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function TabBar({
  activeTab,
  onTabPress,
  unreadReels = 0,
  isAdmin = false,
  isAuthenticated = false,
}) {
  const tabs = isAuthenticated
    ? [
        { id: 'profile', label: 'My Profile', icon: '👤', glyph: '●' },
        { id: 'reels', label: 'Reels', icon: '🎬', glyph: '●' },
        { id: 'discover', label: 'Discover', icon: '🔍', glyph: '●' },
        ...(isAdmin || activeTab === 'admin'
          ? [{ id: 'admin', label: 'Admin', icon: '👑', glyph: '●' }]
          : []),
        { id: 'login', label: 'Account', icon: '⚙️', glyph: '●' },
      ]
    : [
        { id: 'login', label: 'Sign Up / In', icon: '✨', glyph: '●' },
        { id: 'profile', label: 'Profile', icon: '🔒', glyph: '●', isLocked: true },
        { id: 'reels', label: 'Reels', icon: '🔒', glyph: '●', isLocked: true },
        { id: 'discover', label: 'Discover', icon: '🔍', glyph: '●' },
      ];

  return (
    <View style={styles.dockWrapper}>
      <View style={styles.dockContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                isActive && styles.tabButtonActive,
                tab.isLocked && styles.tabButtonLocked,
              ]}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Text
                  style={[
                    styles.tabIcon,
                    isActive && styles.tabIconActive,
                    tab.isLocked && styles.tabIconLocked,
                  ]}
                >
                  {tab.icon}
                </Text>
                {tab.id === 'reels' && unreadReels > 0 && isAuthenticated && (
                  <View style={styles.badgeDot} />
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                  tab.isLocked && styles.tabLabelLocked,
                ]}
              >
                {tab.label}
              </Text>

              {isActive ? (
                <View style={styles.activePillIndicator} />
              ) : (
                <View style={styles.inactivePlaceholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
    backgroundColor: 'rgba(3, 7, 18, 0.95)',
  },
  dockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  tabButtonLocked: {
    opacity: 0.6,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabIconLocked: {
    fontSize: 18,
    opacity: 0.45,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.rose,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  tabLabelLocked: {
    color: '#475569',
  },
  activePillIndicator: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginTop: 3,
  },
  inactivePlaceholder: {
    width: 14,
    height: 3,
    marginTop: 3,
  },
});
