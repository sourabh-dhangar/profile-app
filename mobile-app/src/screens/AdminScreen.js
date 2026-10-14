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
  Alert,
} from 'react-native';
import { COLORS } from '../theme';

export default function AdminScreen({
  users = [],
  analytics = null,
  reports = [],
  loading = false,
  onRefresh,
  onViewProfile,
  onUpdateUserStatus,
  onResolveReport,
  onShowToast,
  currentUser,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'suspended' | 'admins' | 'reports'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (filterTab === 'active' && u.accountStatus !== 'active') return false;
    if (filterTab === 'suspended' && u.accountStatus !== 'suspended') return false;
    if (filterTab === 'admins' && u.role !== 'admin') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = u.profile?.name?.toLowerCase() || '';
    const username = u.profile?.username?.toLowerCase() || '';
    const mobile = u.mobile?.toLowerCase() || '';
    const bio = u.profile?.bio?.toLowerCase() || '';
    const role = u.role?.toLowerCase() || '';

    return (
      name.includes(q) ||
      username.includes(q) ||
      mobile.includes(q) ||
      bio.includes(q) ||
      role.includes(q)
    );
  });

  const handleToggleStatus = async (user) => {
    const nextStatus = user.accountStatus === 'suspended' ? 'active' : 'suspended';
    setActionLoadingId(user._id);
    try {
      await onUpdateUserStatus(user._id, nextStatus, user.role);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    setActionLoadingId(user._id);
    try {
      await onUpdateUserStatus(user._id, user.accountStatus, nextRole);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActionReport = async (reportId, actionTaken) => {
    setActionLoadingId(reportId);
    try {
      await onResolveReport(reportId, 'resolved', actionTaken);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Super Admin Top Badge & Header */}
      <View style={styles.headerBox}>
        <View style={styles.badgeRow}>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeIcon}>👑</Text>
            <Text style={styles.adminBadgeText}>SUPER ADMIN COMMAND CENTER</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.refreshBtnText}>{loading ? '⏳' : '🔄 Refresh'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dashboardTitle}>Platform Governance</Text>
        <Text style={styles.dashboardSubtitle}>
          Real-time oversight over all creator profiles, identity isolation, account standing, and content compliance.
        </Text>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statNumber}>
            {analytics?.users?.total ?? users.length}
          </Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👤</Text>
          <Text style={styles.statNumber}>
            {analytics?.profiles?.published ?? users.filter((u) => u.profile).length}
          </Text>
          <Text style={styles.statLabel}>Live Profiles</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎬</Text>
          <Text style={styles.statNumber}>
            {analytics?.reels?.total ?? '—'}
          </Text>
          <Text style={styles.statLabel}>Active Reels</Text>
        </View>

        <View style={[styles.statCard, reports.length > 0 && styles.statCardAlert]}>
          <Text style={styles.statIcon}>🚨</Text>
          <Text
            style={[
              styles.statNumber,
              reports.length > 0 && { color: COLORS.rose },
            ]}
          >
            {analytics?.reports?.pending ?? reports.length}
          </Text>
          <Text style={styles.statLabel}>Flagged Items</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'all' && styles.filterChipActive]}
          onPress={() => setFilterTab('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filterTab === 'all' && styles.filterChipTextActive]}>
            All ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'active' && styles.filterChipActive]}
          onPress={() => setFilterTab('active')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filterTab === 'active' && styles.filterChipTextActive]}>
            Active ({users.filter((u) => u.accountStatus !== 'suspended').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'suspended' && styles.filterChipActive]}
          onPress={() => setFilterTab('suspended')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filterTab === 'suspended' && styles.filterChipTextActive]}>
            Suspended ({users.filter((u) => u.accountStatus === 'suspended').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'admins' && styles.filterChipActive]}
          onPress={() => setFilterTab('admins')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filterTab === 'admins' && styles.filterChipTextActive]}>
            Admins ({users.filter((u) => u.role === 'admin').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'reports' && styles.filterChipActive]}
          onPress={() => setFilterTab('reports')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filterTab === 'reports' && styles.filterChipTextActive]}>
            🚨 Reports ({reports.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Box */}
      {filterTab !== 'reports' && (
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, @username, or mobile number..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loading state indicator */}
      {loading && users.length === 0 && (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading all platform accounts...</Text>
        </View>
      )}

      {/* REPORTS VIEW */}
      {filterTab === 'reports' ? (
        <View style={styles.reportsSection}>
          <Text style={styles.sectionHeading}>
            Content Moderation Queue ({reports.length})
          </Text>

          {reports.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={styles.emptyTitle}>All Clear</Text>
              <Text style={styles.emptySubtitle}>
                No pending content reports or violations flagged on the platform.
              </Text>
            </View>
          ) : (
            reports.map((rep) => (
              <View key={rep._id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTypeBadge}>
                    <Text style={styles.reportTypeText}>
                      {rep.targetType?.toUpperCase() || 'CONTENT'} REPORT
                    </Text>
                  </View>
                  <Text style={styles.reportStatusBadge}>{rep.status}</Text>
                </View>

                <Text style={styles.reportReason}>"{rep.reason}"</Text>
                <Text style={styles.reportMeta}>
                  Target ID: {rep.targetId} • Status: {rep.status}
                </Text>

                {rep.status === 'pending' && (
                  <View style={styles.reportActionRow}>
                    <TouchableOpacity
                      style={styles.takedownBtn}
                      onPress={() => handleActionReport(rep._id, 'takedown')}
                      disabled={actionLoadingId === rep._id}
                    >
                      <Text style={styles.takedownBtnText}>🚫 Take Down Content</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => handleActionReport(rep._id, 'dismiss')}
                      disabled={actionLoadingId === rep._id}
                    >
                      <Text style={styles.dismissBtnText}>Dismiss Report</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      ) : (
        /* USERS LIST VIEW */
        <View style={styles.usersListContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.sectionHeading}>
              Registered Users ({filteredUsers.length})
            </Text>
            {searchQuery.trim() ? (
              <Text style={styles.matchCounterText}>
                Matching "{searchQuery}"
              </Text>
            ) : null}
          </View>

          {filteredUsers.length === 0 && !loading && (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptySubtitle}>
                No accounts match the current filter or search criteria.
              </Text>
            </View>
          )}

          {filteredUsers.map((item) => {
            const hasProfile = Boolean(item.profile);
            const isSuspended = item.accountStatus === 'suspended';
            const isAdminRole = item.role === 'admin';
            const isProcessing = actionLoadingId === item._id;

            return (
              <View
                key={item._id}
                style={[styles.userCard, isSuspended && styles.userCardSuspended]}
              >
                {/* Card Top: Avatar, Names, and Status Badges */}
                <View style={styles.userCardTop}>
                  <View
                    style={[
                      styles.avatarWrapper,
                      isSuspended ? styles.avatarBorderSuspended : styles.avatarBorderActive,
                    ]}
                  >
                    {item.profile?.photoUrl ? (
                      <Image
                        source={{ uri: item.profile.photoUrl }}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>
                          {(item.profile?.name || item.mobile || 'U').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.userInfoCol}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userNameText} numberOfLines={1}>
                        {item.profile?.name || 'Uninitialized Profile'}
                      </Text>
                      {isAdminRole && (
                        <View style={styles.roleAdminPill}>
                          <Text style={styles.roleAdminText}>👑 ADMIN</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.userHandleText}>
                      {item.profile?.username
                        ? `@${item.profile.username}`
                        : `ID: ${item.mobile}`}
                    </Text>

                    <View style={styles.tagsRow}>
                      <View style={styles.phoneTag}>
                        <Text style={styles.phoneTagText}>📱 {item.mobile}</Text>
                      </View>
                      {item.profile?.profileType ? (
                        <View style={styles.profileTypeTag}>
                          <Text style={styles.profileTypeTagText}>
                            {item.profile.profileType}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Status Indicator Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      isSuspended ? styles.statusPillSuspended : styles.statusPillActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isSuspended ? styles.statusDotSuspended : styles.statusDotActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        isSuspended ? styles.statusTextSuspended : styles.statusTextActive,
                      ]}
                    >
                      {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </Text>
                  </View>
                </View>

                {/* Profile Bio / Completion */}
                {item.profile?.bio ? (
                  <Text style={styles.bioSnippetText} numberOfLines={2}>
                    {item.profile.bio}
                  </Text>
                ) : null}

                {/* Account Details Row */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>
                    Completion: {item.profile?.completionPercentage ?? 0}%
                  </Text>
                  <Text style={styles.metaLabel}>
                    Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>

                {/* Action Buttons Toolbar */}
                <View style={styles.actionsBar}>
                  {hasProfile && item.profile?.username ? (
                    <TouchableOpacity
                      style={styles.viewProfileBtn}
                      onPress={() => onViewProfile(item.profile.username)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewProfileBtnText}>👁️ View Profile</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.actionStatusBtn,
                      isSuspended ? styles.activateBtn : styles.suspendBtn,
                    ]}
                    onPress={() => handleToggleStatus(item)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.actionBtnText}>
                        {isSuspended ? '✅ Reactivate' : '🚫 Suspend'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.roleToggleBtn}
                    onPress={() => handleToggleRole(item)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.roleToggleBtnText}>
                      {isAdminRole ? 'Demote' : '👑 Make Admin'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Safety Compliance Footer */}
      <View style={styles.complianceBox}>
        <Text style={styles.complianceText}>
          🛡️ Super Admin Audit Logging Active • All status modifications recorded in persistent audit trail.
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
  headerBox: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    gap: 6,
  },
  adminBadgeIcon: {
    fontSize: 13,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#facc15',
    letterSpacing: 0.8,
  },
  refreshBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  refreshBtnText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  dashboardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statCardAlert: {
    borderColor: 'rgba(244, 63, 94, 0.35)',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  filterChipTextActive: {
    color: '#34d399',
    fontWeight: '900',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94a3b8',
    paddingHorizontal: 4,
  },
  centerLoading: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  usersListContainer: {
    gap: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '900',
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  matchCounterText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '700',
  },
  emptyStateBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  userCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  userCardSuspended: {
    borderColor: 'rgba(244, 63, 94, 0.35)',
    backgroundColor: 'rgba(24, 15, 24, 0.95)',
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarBorderActive: {
    borderColor: '#10b981',
  },
  avatarBorderSuspended: {
    borderColor: '#f43f5e',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  userInfoCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  roleAdminPill: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  roleAdminText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#facc15',
  },
  userHandleText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  phoneTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phoneTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  profileTypeTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  profileTypeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38bdf8',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusPillSuspended: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  statusDotSuspended: {
    backgroundColor: '#f43f5e',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: '#34d399',
  },
  statusTextSuspended: {
    color: '#fb7185',
  },
  bioSnippetText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 10,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  viewProfileBtn: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 11,
  },
  actionStatusBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspendBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  activateBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  roleToggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleToggleBtnText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  reportsSection: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTypeBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportTypeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fb7185',
  },
  reportStatusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  reportReason: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 4,
  },
  reportMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  reportActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  takedownBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f43f5e',
  },
  takedownBtnText: {
    color: '#fb7185',
    fontSize: 11,
    fontWeight: '900',
  },
  dismissBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dismissBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  complianceBox: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  complianceText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 15,
  },
});
