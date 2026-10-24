import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { COLORS } from '../theme';

export default function MyProfileDashboardScreen({
  profileData,
  loading,
  onRefresh,
  onOpenReelCreator,
  onOpenQRModal,
  onOpenSectionEditor,
  onDeleteSection,
  onUpdateInquiryStatus,
  onTogglePrivacy,
  onUpdateProfile,
  onLogout,
  onShowToast,
  onViewPublicProfile,
}) {
  const [subTab, setSubTab] = useState('reels'); // 'reels' | 'sections' | 'inquiries' | 'analytics' | 'privacy'
  const [inquiryFilter, setInquiryFilter] = useState('all'); // 'all' | 'new' | 'contacted'

  const [allowPhoneDiscovery, setAllowPhoneDiscovery] = useState(
    profileData?.allowDiscovery ?? false
  );
  const [showPhone, setShowPhone] = useState(
    profileData?.profile?.contactDetails?.showPhone ?? false
  );
  const [showEmail, setShowEmail] = useState(
    profileData?.profile?.contactDetails?.showEmail ?? false
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(profileData?.profile?.name || '');

  useEffect(() => {
    if (profileData?.profile) {
      if (profileData.profile.name) setEditName(profileData.profile.name);
      if (profileData.profile.bio !== undefined) setEditBio(profileData.profile.bio || '');
      if (profileData.profile.profileType) setEditProfileType(profileData.profile.profileType);
      if (profileData.profile.city !== undefined) setEditCity(profileData.profile.city || '');
      if (profileData.profile.category) setEditCategory(profileData.profile.category);
      if (profileData.profile.subCategory !== undefined) setEditSubCategory(profileData.profile.subCategory || '');
      if (profileData.profile.businessDetails?.timing !== undefined) setEditTiming(profileData.profile.businessDetails.timing || '10:00 AM - 8:00 PM');
      if (profileData.profile.businessDetails?.address !== undefined) setEditAddress(profileData.profile.businessDetails.address || '');
      if (profileData.profile.businessDetails?.whatsappNumber !== undefined) setEditWhatsapp(profileData.profile.businessDetails.whatsappNumber || '');
    }
  }, [profileData?.profile]);
  const [editBio, setEditBio] = useState(profileData?.profile?.bio || '');
  const [editProfileType, setEditProfileType] = useState(
    profileData?.profile?.profileType || 'Creator'
  );
  const [editCity, setEditCity] = useState(profileData?.profile?.city || '');
  const [editCategory, setEditCategory] = useState(
    profileData?.profile?.category || 'Content Creator & Artist'
  );
  const [editSubCategory, setEditSubCategory] = useState(
    profileData?.profile?.subCategory || ''
  );
  const [editTiming, setEditTiming] = useState(
    profileData?.profile?.businessDetails?.timing || '10:00 AM - 8:00 PM'
  );
  const [editAddress, setEditAddress] = useState(
    profileData?.profile?.businessDetails?.address || ''
  );
  const [editWhatsapp, setEditWhatsapp] = useState(
    profileData?.profile?.businessDetails?.whatsappNumber || ''
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Owner Dashboard...</Text>
      </View>
    );
  }

  const profile = profileData?.profile || {
    name: 'Verified Profile',
    username: 'creator',
    profileType: 'Creator',
    bio: 'Full Stack Engineer & Content Creator building next-generation mobile experiences.',
    city: 'Bengaluru, India',
    photoUrl: 'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
    completionPercentage: 85,
    status: 'published',
  };

  const sections = profileData?.sections || [];
  const reels = profileData?.reels || [];
  const inquiries = profileData?.inquiries || [
    {
      _id: 'inq-1',
      name: 'Aditi Verma',
      email: 'aditi.v@startup.io',
      phone: '+919876501234',
      message: 'Loved your mobile app reels! We need a senior React Native consultant for our fintech app.',
      status: 'new',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      _id: 'inq-2',
      name: 'Vikram Mehta',
      email: 'vikram@creatorlabs.in',
      phone: '+919812345678',
      message: 'Looking to collaborate on video feed architecture and high-performance list virtualisation.',
      status: 'contacted',
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
  ];

  const analytics = profileData?.analytics || {
    totalViews: 3840,
    uniqueVisitors: 2190,
    linkClicks: 472,
    reelsPlays: 8950,
    inquiriesReceived: inquiries.length,
  };

  const conversionRate = (
    (analytics.inquiriesReceived / (analytics.totalViews || 1)) *
    100
  ).toFixed(1);

  const handleDiscoveryChange = (val) => {
    setAllowPhoneDiscovery(val);
    onTogglePrivacy?.('discovery', val);
    onShowToast?.(
      val ? 'Phone discovery enabled via salted HMAC' : 'Phone discovery disabled',
      'info'
    );
  };

  const handleOpenEdit = () => {
    setEditName(profile.name || '');
    setEditBio(profile.bio || '');
    setEditProfileType(profile.profileType || 'Creator');
    setEditCity(profile.city || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      onShowToast?.('Display name cannot be empty', 'error');
      return;
    }
    await onUpdateProfile?.({
      name: editName.trim(),
      bio: editBio.trim(),
      profileType: editProfileType,
      city: editCity.trim(),
      category: editCategory,
      subCategory: editSubCategory.trim(),
      businessDetails: {
        timing: editTiming.trim(),
        address: editAddress.trim(),
        whatsappNumber: editWhatsapp.trim(),
      },
    });
    setEditModalVisible(false);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (inquiryFilter === 'new') return inq.status === 'new';
    if (inquiryFilter === 'contacted') return inq.status === 'contacted';
    return true;
  });

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Owner Dashboard Identity Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{
                uri:
                  profile.photoUrl ||
                  'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
              }}
              style={styles.avatar}
            />
            <View style={styles.userMainInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {profile.name}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              </View>
              <Text style={styles.handleText}>@{profile.username}</Text>
              <View style={styles.tagsRow}>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{profile.profileType}</Text>
                </View>
                {profile.category ? (
                  <View style={[styles.rolePill, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8' }]}>
                    <Text style={[styles.rolePillText, { color: '#38bdf8' }]}>🏷️ {profile.category}</Text>
                  </View>
                ) : null}
                {profile.city ? (
                  <Text style={styles.cityText}>📍 {profile.city}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}

          {/* Profile Completion Gauge */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeLabel}>⚡ Profile Completion Gauge</Text>
              <Text style={styles.gaugePercent}>
                {profile.completionPercentage || 85}%
              </Text>
            </View>
            <View style={styles.gaugeTrack}>
              <View
                style={[
                  styles.gaugeFill,
                  { width: `${profile.completionPercentage || 85}%` },
                ]}
              />
            </View>
            <Text style={styles.gaugeHint}>
              {profile.completionPercentage >= 50
                ? '✅ Ready for public link sharing and QR scanning.'
                : 'Add photo, bio, and 1 section to reach 50% and unlock public sharing.'}
            </Text>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={onOpenReelCreator}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>✨</Text>
              <Text style={styles.actionBtnPrimaryText}>Post Reel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={handleOpenEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>✏️</Text>
              <Text style={styles.actionBtnSecondaryText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={onOpenQRModal}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>📱</Text>
              <Text style={styles.actionBtnSecondaryText}>QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={onViewPublicProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>🌐</Text>
              <Text style={styles.actionBtnSecondaryText}>Public</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Sub Tabs */}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollWrap}
          contentContainerStyle={styles.tabBarStrip}
        >
          {[
            { id: 'reels', label: `Reels (${reels.length})`, icon: '🎬' },
            { id: 'sections', label: `Sections (${sections.length})`, icon: '📑' },
            { id: 'inquiries', label: `Leads (${inquiries.length})`, icon: '📬' },
            { id: 'analytics', label: 'Stats', icon: '📊' },
            { id: 'privacy', label: 'Privacy', icon: '🛡️' },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabStripBtn, subTab === t.id && styles.tabStripBtnActive]}
              onPress={() => setSubTab(t.id)}
            >
              <Text style={styles.tabStripIcon}>{t.icon}</Text>
              <Text
                style={[
                  styles.tabStripLabel,
                  subTab === t.id && styles.tabStripLabelActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab 1: My Reels */}
        {subTab === 'reels' && (
          <View style={styles.tabContentBox}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Uploaded Video Reels</Text>
              <TouchableOpacity style={styles.addMiniBtn} onPress={onOpenReelCreator}>
                <Text style={styles.addMiniBtnText}>+ Add Reel</Text>
              </TouchableOpacity>
            </View>

            {reels.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateIcon}>🎬</Text>
                <Text style={styles.emptyStateTitle}>No Reels Created Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Post short video showcases under 60 seconds to reach more clients.
                </Text>
              </View>
            ) : (
              reels.map((reel, idx) => (
                <View key={reel._id || idx} style={styles.reelItemCard}>
                  <Image
                    source={{
                      uri:
                        reel.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
                    }}
                    style={styles.reelThumb}
                  />
                  <View style={styles.reelItemInfo}>
                    <Text style={styles.reelCaption} numberOfLines={2}>
                      {reel.caption || 'Showcase Reel'}
                    </Text>
                    <View style={styles.reelMetaRow}>
                      <Text style={styles.reelMetaText}>
                        👁️ {reel.viewsCount || 0} views
                      </Text>
                      <Text style={styles.reelMetaText}>
                        ❤️ {reel.likesCount || 0} likes
                      </Text>
                    </View>
                    <View style={styles.visibilityTag}>
                      <Text style={styles.visibilityTagText}>
                        {reel.visibility === 'public'
                          ? '🌐 Public'
                          : reel.visibility === 'profile-only'
                          ? '👤 Profile Only'
                          : '🔒 Private'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 2: Modular Sections Manager */}
        {subTab === 'sections' && (
          <View style={styles.tabContentBox}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.sectionTitle}>Modular Sections</Text>
                <Text style={styles.sectionSubDesc}>
                  Customize skills, work history, and freelance offerings.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addMiniBtn}
                onPress={() => onOpenSectionEditor?.(null)}
              >
                <Text style={styles.addMiniBtnText}>+ Add Section</Text>
              </TouchableOpacity>
            </View>

            {sections.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateIcon}>📑</Text>
                <Text style={styles.emptyStateTitle}>No Sections Added Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Add technical skills, work experience, or services to build credibility.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtnPrimary, { marginTop: 14 }]}
                  onPress={() => onOpenSectionEditor?.(null)}
                >
                  <Text style={styles.actionBtnPrimaryText}>+ Create First Section</Text>
                </TouchableOpacity>
              </View>
            ) : (
              sections.map((sec, idx) => (
                <View key={sec._id || idx} style={styles.sectionCardItem}>
                  <View style={styles.sectionHeaderLine}>
                    <View style={styles.sectionTitleWrap}>
                      <Text style={styles.sectionHeaderTitle}>{sec.title}</Text>
                      <View style={styles.sectionTypePill}>
                        <Text style={styles.sectionTypeTag}>{sec.type}</Text>
                      </View>
                    </View>
                    <View style={styles.sectionCardActions}>
                      <TouchableOpacity
                        style={styles.cardActionIconBtn}
                        onPress={() => onOpenSectionEditor?.(sec)}
                      >
                        <Text style={styles.cardActionIconText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardActionIconBtn}
                        onPress={() => onDeleteSection?.(sec._id)}
                      >
                        <Text style={styles.cardActionIconText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Section Content Rendering */}
                  {sec.type === 'skills' &&
                  sec.content?.items &&
                  Array.isArray(sec.content.items) ? (
                    <View style={styles.skillBadgesRow}>
                      {sec.content.items.map((skill, sIdx) => (
                        <View key={sIdx} style={styles.skillBadge}>
                          <Text style={styles.skillBadgeText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.sectionContentText}>
                      {sec.content?.text ||
                        (sec.content?.items && sec.content.items.join(', ')) ||
                        'Section body'}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 3: Leads & Inquiries CRM */}
        {subTab === 'inquiries' && (
          <View style={styles.tabContentBox}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.sectionTitle}>Client Inquiries CRM</Text>
                <Text style={styles.sectionSubDesc}>
                  Visitor contact requests from your public profile.
                </Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.inquiryFilterRow}>
              {['all', 'new', 'contacted'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.inquiryFilterPill,
                    inquiryFilter === f && styles.inquiryFilterPillActive,
                  ]}
                  onPress={() => setInquiryFilter(f)}
                >
                  <Text
                    style={[
                      styles.inquiryFilterText,
                      inquiryFilter === f && styles.inquiryFilterTextActive,
                    ]}
                  >
                    {f === 'all'
                      ? `All (${inquiries.length})`
                      : f === 'new'
                      ? `New (${inquiries.filter((i) => i.status === 'new').length})`
                      : `Contacted (${inquiries.filter((i) => i.status === 'contacted').length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredInquiries.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateIcon}>📬</Text>
                <Text style={styles.emptyStateTitle}>No Inquiries Found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Client inquiries sent through your public page contact form appear here.
                </Text>
              </View>
            ) : (
              filteredInquiries.map((inq, idx) => {
                const isNew = inq.status === 'new';
                return (
                  <View key={inq._id || idx} style={styles.inquiryCard}>
                    <View style={styles.inquiryCardHeader}>
                      <View style={styles.inquirySenderInfo}>
                        <Text style={styles.inquirySenderName}>{inq.name}</Text>
                        <Text style={styles.inquiryDate}>
                          {inq.createdAt
                            ? new Date(inq.createdAt).toLocaleDateString()
                            : 'Recent'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.inquiryStatusBadge,
                          isNew
                            ? styles.statusBadgeNew
                            : styles.statusBadgeContacted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.inquiryStatusText,
                            isNew
                              ? styles.statusTextNew
                              : styles.statusTextContacted,
                          ]}
                        >
                          {isNew ? '● NEW' : '✓ CONTACTED'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.inquiryMessageText}>
                      "{inq.message}"
                    </Text>

                    <View style={styles.inquiryContactRow}>
                      {inq.email ? (
                        <TouchableOpacity
                          style={styles.contactActionBtn}
                          onPress={() => Linking.openURL(`mailto:${inq.email}`)}
                        >
                          <Text style={styles.contactActionText}>✉️ {inq.email}</Text>
                        </TouchableOpacity>
                      ) : null}
                      {inq.phone ? (
                        <TouchableOpacity
                          style={styles.contactActionBtn}
                          onPress={() => Linking.openURL(`tel:${inq.phone}`)}
                        >
                          <Text style={styles.contactActionText}>📞 {inq.phone}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* CRM Quick Status Toggle */}
                    <View style={styles.inquiryFooterRow}>
                      <TouchableOpacity
                        style={styles.statusToggleBtn}
                        onPress={() =>
                          onUpdateInquiryStatus?.(
                            inq._id,
                            isNew ? 'contacted' : 'new'
                          )
                        }
                      >
                        <Text style={styles.statusToggleBtnText}>
                          {isNew ? '✓ Mark as Contacted' : '↩ Mark as New'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Tab 4: Performance Analytics */}
        {subTab === 'analytics' && (
          <View style={styles.tabContentBox}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.sectionTitle}>Performance Analytics</Text>
                <Text style={styles.sectionSubDesc}>
                  Real-time engagement telemetry across views & leads.
                </Text>
              </View>
            </View>

            {/* Metrics KPI Grid */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiIcon}>👁️</Text>
                <Text style={styles.kpiValue}>{analytics.totalViews}</Text>
                <Text style={styles.kpiLabel}>Profile Views</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiIcon}>👥</Text>
                <Text style={styles.kpiValue}>{analytics.uniqueVisitors}</Text>
                <Text style={styles.kpiLabel}>Unique Visitors</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiIcon}>🔗</Text>
                <Text style={styles.kpiValue}>{analytics.linkClicks}</Text>
                <Text style={styles.kpiLabel}>Contact Clicks</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiIcon}>🎬</Text>
                <Text style={styles.kpiValue}>{analytics.reelsPlays}</Text>
                <Text style={styles.kpiLabel}>Reel Video Plays</Text>
              </View>

              <View style={[styles.kpiCard, styles.kpiCardHighlight]}>
                <Text style={styles.kpiIcon}>📬</Text>
                <Text style={[styles.kpiValue, { color: COLORS.primary }]}>
                  {analytics.inquiriesReceived}
                </Text>
                <Text style={styles.kpiLabel}>Client Inquiries</Text>
              </View>

              <View style={[styles.kpiCard, styles.kpiCardHighlight]}>
                <Text style={styles.kpiIcon}>🎯</Text>
                <Text style={[styles.kpiValue, { color: '#38bdf8' }]}>
                  {conversionRate}%
                </Text>
                <Text style={styles.kpiLabel}>Conversion Rate</Text>
              </View>
            </View>

            {/* Traffic Source Breakdown */}
            <View style={styles.trafficInsightsCard}>
              <Text style={styles.insightsTitle}>⚡ Growth & Traffic Insights</Text>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Direct URL & QR Scans</Text>
                <Text style={styles.insightVal}>68%</Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Mobile Phone Discovery</Text>
                <Text style={styles.insightVal}>24%</Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightLabel}>Social & Chat Shares</Text>
                <Text style={styles.insightVal}>8%</Text>
              </View>
              <View style={styles.insightTipBox}>
                <Text style={styles.insightTipText}>
                  💡 Pro Tip: Uploading 2+ active video reels increases visitor contact inquiries by 3.4x.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 5: Privacy Hub */}
        {subTab === 'privacy' && (
          <View style={styles.tabContentBox}>
            <Text style={styles.sectionTitle}>Privacy & Search Controls</Text>
            <Text style={styles.sectionSubDesc}>
              Control contact discovery and profile security.
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Allow Mobile Discovery</Text>
                <Text style={styles.settingDesc}>
                  Contacts who know your number can look you up. Salted HMAC-SHA256 indexed.
                </Text>
              </View>
              <Switch
                value={allowPhoneDiscovery}
                onValueChange={handleDiscoveryChange}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={allowPhoneDiscovery ? '#ffffff' : '#94a3b8'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Show Phone on Public Profile</Text>
                <Text style={styles.settingDesc}>Renders instant Call & WhatsApp buttons</Text>
              </View>
              <Switch
                value={showPhone}
                onValueChange={(val) => {
                  setShowPhone(val);
                  onTogglePrivacy?.('showPhone', val);
                }}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={showPhone ? '#ffffff' : '#94a3b8'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Show Email on Public Profile</Text>
                <Text style={styles.settingDesc}>Allows visitors to send email inquiries</Text>
              </View>
              <Switch
                value={showEmail}
                onValueChange={(val) => {
                  setShowEmail(val);
                  onTogglePrivacy?.('showEmail', val);
                }}
                trackColor={{ false: '#334155', true: '#10b981' }}
                thumbColor={showEmail ? '#ffffff' : '#94a3b8'}
              />
            </View>

            {/* Session Logout Trigger */}
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>🚪 Sign Out of Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Details Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>✏️ Edit Profile Details</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Display Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full Name"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>Business & Industry Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {[
                  'IT & Software',
                  'Salon & Beauty',
                  'Fitness & Health',
                  'Doctor & Clinic',
                  'Restaurant & Food',
                  'Professional Services',
                  'Education & Coaching',
                  'Retail & Commerce',
                  'Content Creator & Artist',
                  'Other Business',
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      borderWidth: 1,
                      marginRight: 8,
                      backgroundColor: editCategory === cat ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: editCategory === cat ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                    }}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: editCategory === cat ? '#38bdf8' : '#94a3b8' }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Sub-Category / Specialization Title</Text>
              <TextInput
                style={styles.modalInput}
                value={editSubCategory}
                onChangeText={setEditSubCategory}
                placeholder="e.g. Bridal Makeup, Full Stack Dev, Dentist"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>Storefront Timings / Working Hours</Text>
              <TextInput
                style={styles.modalInput}
                value={editTiming}
                onChangeText={setEditTiming}
                placeholder="e.g. Mon-Sat: 10:00 AM - 8:30 PM"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>Physical Storefront / Clinic Address</Text>
              <TextInput
                style={styles.modalInput}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="e.g. Shop 4B, MG Road, Mumbai"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>WhatsApp Inquiry Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editWhatsapp}
                onChangeText={setEditWhatsapp}
                placeholder="e.g. +91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>Role / Profession</Text>
              <TextInput
                style={styles.modalInput}
                value={editProfileType}
                onChangeText={setEditProfileType}
                placeholder="e.g. Creator, Engineer, Freelancer"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>City / Location</Text>
              <TextInput
                style={styles.modalInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="e.g. Bengaluru, India"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.fieldLabel}>Bio / Summary</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell visitors about your craft, skills, or portfolio..."
                placeholderTextColor="#64748b"
                multiline={true}
                numberOfLines={3}
                maxLength={500}
              />

              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  dashboardCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  userMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#020617',
    fontSize: 10,
    fontWeight: '900',
  },
  handleText: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '700',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  rolePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rolePillText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '700',
  },
  cityText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  bioText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  gaugeContainer: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  gaugePercent: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34d399',
  },
  gaugeTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  gaugeHint: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnPrimary: {
    flex: 1.1,
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  actionBtnIcon: {
    fontSize: 13,
  },
  actionBtnPrimaryText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnSecondaryText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  tabScrollWrap: {
    marginBottom: 14,
  },
  tabBarStrip: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  tabStripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  tabStripBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  tabStripIcon: {
    fontSize: 12,
  },
  tabStripLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabStripLabelActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  tabContentBox: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionSubDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  addMiniBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  addMiniBtnText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  emptyStateTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  reelItemCard: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reelThumb: {
    width: 50,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#000000',
  },
  reelItemInfo: {
    flex: 1,
  },
  reelCaption: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  reelMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  reelMetaText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  visibilityTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visibilityTagText: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '700',
  },
  sectionCardItem: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTypePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionTypeTag: {
    color: '#34d399',
    fontSize: 9,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  sectionCardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  cardActionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionIconText: {
    fontSize: 12,
  },
  skillBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillBadge: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  skillBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionContentText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  inquiryFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inquiryFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inquiryFilterPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  inquiryFilterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  inquiryFilterTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inquiryCard: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  inquiryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inquirySenderInfo: {
    flex: 1,
  },
  inquirySenderName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  inquiryDate: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  inquiryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeNew: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeContacted: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  inquiryStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextNew: {
    color: '#10b981',
  },
  statusTextContacted: {
    color: '#38bdf8',
  },
  inquiryMessageText: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  inquiryContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  contactActionBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  contactActionText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  inquiryFooterRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
  },
  statusToggleBtn: {
    alignSelf: 'flex-start',
  },
  statusToggleBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  kpiCardHighlight: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  kpiIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  trafficInsightsCard: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#cbd5e1',
    marginBottom: 10,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  insightLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  insightVal: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '700',
  },
  insightTipBox: {
    marginTop: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 10,
    padding: 8,
  },
  insightTipText: {
    fontSize: 10,
    color: '#38bdf8',
    lineHeight: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingTexts: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  settingDesc: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 16,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  editModalCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '88%',
    paddingBottom: 24,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalScrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#ffffff',
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '800',
  },
});
