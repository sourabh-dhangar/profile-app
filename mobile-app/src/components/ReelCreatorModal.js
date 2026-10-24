import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS } from '../theme';

const SAMPLE_CLIPS = [
  {
    id: 'sample-clip-1',
    label: 'Tech Showcase',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    duration: 15,
  },
  {
    id: 'sample-clip-2',
    label: 'Design Walkthrough',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    duration: 25,
  },
  {
    id: 'sample-clip-3',
    label: 'Architecture Pitch',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    duration: 30,
  },
];

export default function ReelCreatorModal({
  visible,
  onClose,
  onSubmitReel,
  onShowToast,
}) {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_CLIPS[0].videoUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState(SAMPLE_CLIPS[0].thumbnailUrl);
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState(15);
  const [visibility, setVisibility] = useState('public'); // 'public' | 'profile-only' | 'private'
  const [isUploading, setIsUploading] = useState(false);

  const handlePublish = async () => {
    if (!videoUrl.trim()) {
      onShowToast?.('Please provide or pick a video clip', 'error');
      return;
    }

    if (duration > 60 || duration <= 0) {
      onShowToast?.('Reel duration must be 60 seconds or less', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const safeThumbnail = (thumbnailUrl && !thumbnailUrl.toLowerCase().endsWith('.mp4') && !thumbnailUrl.toLowerCase().endsWith('.mov'))
        ? thumbnailUrl.trim()
        : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';

      await onSubmitReel?.({
        videoUrl: videoUrl.trim(),
        thumbnailUrl: safeThumbnail,
        caption: caption.trim() || 'My new showcase reel 🚀',
        durationSeconds: duration || 15,
        visibility: visibility || 'public',
      });

      onShowToast?.('🎉 Reel Published Successfully!', 'success');
      setCaption('');
      onClose();
    } catch (err) {
      onShowToast?.(err.message || 'Failed to upload reel', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalChassis}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrapper}>
              <Text style={styles.headerIcon}>🎬</Text>
              <Text style={styles.headerTitle}>Create New Reel</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Video Preview Chassis */}
            <View style={styles.previewContainer}>
              <Image source={{ uri: thumbnailUrl || videoUrl }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>⏱️ {duration}s / 60s max</Text>
                </View>
                <View style={styles.visibilityBadge}>
                  <Text style={styles.visibilityBadgeText}>
                    {visibility === 'public' ? '🌐 Public' : visibility === 'profile-only' ? '👤 Profile Only' : '🔒 Private'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Pick Samples / Media Picker */}
            <Text style={styles.sectionLabel}>Select or Pick Video Media</Text>
            <View style={styles.sampleClipsRow}>
              {SAMPLE_CLIPS.map((clip) => (
                <TouchableOpacity
                  key={clip.id}
                  style={[
                    styles.sampleClipBtn,
                    videoUrl === clip.videoUrl && styles.sampleClipBtnActive,
                  ]}
                  onPress={() => {
                    setVideoUrl(clip.videoUrl);
                    setThumbnailUrl(clip.thumbnailUrl);
                    setDuration(clip.duration);
                  }}
                >
                  <Text
                    style={[
                      styles.sampleClipText,
                      videoUrl === clip.videoUrl && styles.sampleClipTextActive,
                    ]}
                  >
                    {clip.label} ({clip.duration}s)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom URL Input */}
            <Text style={styles.sectionLabel}>Or Enter Direct Video URL (MP4 / WebM)</Text>
            <TextInput
              style={styles.inputField}
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://example.com/video.mp4"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />

            {/* Duration Selector */}
            <Text style={styles.sectionLabel}>Duration Limit (Seconds)</Text>
            <View style={styles.durationRow}>
              {[15, 30, 45, 60].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durBtn, duration === d && styles.durBtnActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.durBtnText, duration === d && styles.durBtnTextActive]}>
                    {d}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Caption Input */}
            <View style={styles.captionHeader}>
              <Text style={styles.sectionLabel}>Caption & Hashtags</Text>
              <Text style={styles.charCount}>{caption.length} / 300</Text>
            </View>
            <TextInput
              style={[styles.inputField, styles.captionInput]}
              value={caption}
              onChangeText={setCaption}
              placeholder="What's this reel about? Add #coding #skills #portfolio..."
              placeholderTextColor="#64748b"
              multiline={true}
              numberOfLines={3}
              maxLength={300}
            />

            {/* Visibility Selector */}
            <Text style={styles.sectionLabel}>Audience Visibility</Text>
            <View style={styles.visibilityRow}>
              {[
                { id: 'public', label: 'Public Feed', desc: 'Home feed & profile' },
                { id: 'profile-only', label: 'Profile Only', desc: 'Direct visitors only' },
                { id: 'private', label: 'Private', desc: 'Only you can see' },
              ].map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.visOptionBtn,
                    visibility === v.id && styles.visOptionBtnActive,
                  ]}
                  onPress={() => setVisibility(v.id)}
                >
                  <Text
                    style={[
                      styles.visOptionTitle,
                      visibility === v.id && styles.visOptionTitleActive,
                    ]}
                  >
                    {v.label}
                  </Text>
                  <Text style={styles.visOptionDesc}>{v.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isUploading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishBtn, isUploading && styles.publishBtnDisabled]}
              onPress={handlePublish}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#020617" />
              ) : (
                <Text style={styles.publishBtnText}>🚀 Publish Reel</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalChassis: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '92%',
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  previewContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  durationBadgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold',
  },
  visibilityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  visibilityBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 6,
  },
  sampleClipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  sampleClipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sampleClipBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  sampleClipText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  sampleClipTextActive: {
    color: '#34d399',
    fontWeight: '800',
  },
  inputField: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 14,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  durBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  durBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  durBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  durBtnTextActive: {
    color: '#34d399',
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  captionInput: {
    height: 72,
    textAlignVertical: 'top',
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  visOptionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  visOptionBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  visOptionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#cbd5e1',
    marginBottom: 2,
  },
  visOptionTitleActive: {
    color: '#34d399',
  },
  visOptionDesc: {
    fontSize: 9,
    color: '#64748b',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  publishBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
});
