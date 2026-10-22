import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  Share,
  Linking,
} from 'react-native';
import { COLORS } from '../theme';
import { getQRCodeUrl, getVCardUrl } from '../services/api';

export default function QRCodeShareModal({
  visible,
  onClose,
  profile,
  onShowToast,
}) {
  if (!profile) return null;

  const username = profile.username || 'user';
  const name = profile.name || 'Profile User';
  const profileUrl = `https://myprofile.app/${username}`;
  const qrEndpointUrl = getQRCodeUrl(username);
  const vCardUrl = getVCardUrl(username);

  // High-reliability QR fallback if backend network is offline
  const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    profileUrl
  )}&bgcolor=030712&color=10b981&margin=10`;

  const handleCopyLink = () => {
    onShowToast?.(`Copied profile link: ${profileUrl}`, 'success');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${name} on MyProfile`,
        message: `Connect with ${name} (@${username}) on MyProfile: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (err) {
      onShowToast?.('Failed to open share dialog', 'error');
    }
  };

  const handleSaveContact = () => {
    try {
      Linking.openURL(vCardUrl);
      onShowToast?.('Downloading vCard (.vcf) contact...', 'info');
    } catch (e) {
      onShowToast?.(`Direct vCard link: ${vCardUrl}`, 'info');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerIcon}>📱</Text>
              <Text style={styles.headerTitle}>Profile QR & Share</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User mini badge */}
          <View style={styles.userBadge}>
            <Image
              source={{
                uri:
                  profile.photoUrl ||
                  'https://ui-avatars.com/api/?name=User&background=1e293b&color=94a3b8&size=256',
              }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {name}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              </View>
              <Text style={styles.userHandle}>@{username}</Text>
            </View>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: qrEndpointUrl }}
              defaultSource={{ uri: fallbackQrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <View style={styles.scanNotice}>
              <Text style={styles.scanNoticeText}>
                ⚡ Scan with any camera to open instant profile
              </Text>
            </View>
          </View>

          {/* Vanity URL Box */}
          <TouchableOpacity
            style={styles.urlBox}
            onPress={handleCopyLink}
            activeOpacity={0.7}
          >
            <Text style={styles.urlText} numberOfLines={1}>
              {profileUrl}
            </Text>
            <Text style={styles.copyPill}>Copy</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>📤</Text>
              <Text style={styles.actionBtnPrimaryText}>Share Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={handleSaveContact}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnIcon}>📇</Text>
              <Text style={styles.actionBtnSecondaryText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0b1120',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 10,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  verifiedBadge: {
    backgroundColor: '#10b981',
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#030712',
    fontSize: 9,
    fontWeight: '900',
  },
  userHandle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  qrContainer: {
    backgroundColor: '#030712',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  qrImage: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  scanNotice: {
    marginTop: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  scanNoticeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '500',
    marginRight: 8,
  },
  copyPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnIcon: {
    fontSize: 15,
  },
  actionBtnPrimaryText: {
    color: '#030712',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnSecondaryText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
