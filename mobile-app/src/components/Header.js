import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function Header({ activeTab, onLogoPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.logoRow} 
        activeOpacity={0.8}
        onPress={onLogoPress}
      >
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>✦</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>MyProfile</Text>
          <Text style={styles.brandSubtitle}>DIGITAL IDENTITY</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.rightCluster}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>SYNCED</Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.verifiedText}>PRO</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: 'rgba(3, 7, 18, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 18,
    color: '#34d399',
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.2,
    marginTop: -2,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    gap: 4,
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#34d399',
    fontWeight: '900',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.5,
  },
});
