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
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme';
import { normalizeMediaUrl, isGoogleDriveUrl, getCloudinaryThumbnail } from '../utils/media';
import { uploadToCloudinary } from '../services/cloudinary';

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
  {
    id: 'sample-clip-4',
    label: 'Mobile App Demo',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    duration: 20,
  },
];

const SAMPLE_IMAGES = [
  {
    id: 'sample-img-1',
    label: 'Design System',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1080',
    caption: 'My latest UI/UX Design System breakdown & micro-interactions 🎨 #portfolio #design',
  },
  {
    id: 'sample-img-2',
    label: 'Clean Code',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080',
    caption: 'Clean Architecture in React Native with offline state persistence 💻 #coding #reactnative',
  },
  {
    id: 'sample-img-3',
    label: 'Certification',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1080',
    caption: 'Achieved Staff Mobile Engineer Certification! 🏆 #milestone #career',
  },
  {
    id: 'sample-img-4',
    label: 'Creator Project',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080',
    caption: 'Building next-gen digital experiences with AI & Cloud integrations 🚀 #creator #tech',
  },
];

export default function ReelCreatorModal({
  visible,
  onClose,
  onSubmitReel,
  onShowToast,
}) {
  const [mediaType, setMediaType] = useState('video'); // 'video' | 'image'
  const [videoUrl, setVideoUrl] = useState(SAMPLE_CLIPS[0].videoUrl);
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0].imageUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState(SAMPLE_CLIPS[0].thumbnailUrl);
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState(15);
  const [visibility, setVisibility] = useState('public'); // 'public' | 'profile-only' | 'private'
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);

  const activeMediaUrl = (mediaType === 'image' ? imageUrl : videoUrl) || '';
  const isDriveLink = isGoogleDriveUrl(activeMediaUrl);
  const activePreviewUrl = mediaType === 'image'
    ? normalizeMediaUrl(imageUrl, 'image')
    : normalizeMediaUrl(thumbnailUrl || videoUrl, 'thumbnail');

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        onShowToast?.('Permission to access device media is required', 'error');
        return;
      }

      const pickerMediaType = mediaType === 'image'
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: pickerMediaType,
        allowsEditing: true,
        quality: 0.85,
        videoMaxDuration: 60,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      // Duration validation for videos
      if (mediaType === 'video' && asset.duration && asset.duration > 61000) {
        onShowToast?.('Video duration exceeds 60s. Please pick a clip under 60 seconds.', 'error');
        return;
      }

      setIsUploadingToCloud(true);
      setUploadProgress(0);
      setUploadedFileName(asset.fileName || (mediaType === 'video' ? 'reel_video.mp4' : 'reel_photo.jpg'));

      onShowToast?.('⏳ Uploading to Cloudinary fast CDN...', 'info');

      const cloudRes = await uploadToCloudinary(asset, (progress) => {
        setUploadProgress(progress);
      });

      if (cloudRes.mediaType === 'video') {
        setVideoUrl(cloudRes.url);
        setThumbnailUrl(cloudRes.thumbnailUrl);
        if (cloudRes.duration) {
          setDuration(cloudRes.duration);
        }
      } else {
        setImageUrl(cloudRes.url);
      }

      onShowToast?.('⚡ Uploaded to Cloudinary CDN! Ready to publish.', 'success');
    } catch (err) {
      console.error('Gallery pick & upload error:', err);
      onShowToast?.(err.message || 'Failed to upload from gallery', 'error');
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  const handlePickCoverFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        onShowToast?.('Permission to access device photos is required', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingCover(true);
      setCoverUploadProgress(0);
      onShowToast?.('⏳ Uploading Cover Photo to Cloudinary...', 'info');

      const cloudRes = await uploadToCloudinary(asset, (progress) => {
        setCoverUploadProgress(progress);
      });

      if (cloudRes.url) {
        setThumbnailUrl(cloudRes.url);
        onShowToast?.('🖼️ Cover Photo uploaded from Gallery!', 'success');
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      onShowToast?.(err.message || 'Failed to upload cover photo', 'error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handlePublish = async () => {
    if (mediaType === 'video' && !videoUrl.trim()) {
      onShowToast?.('Please provide or pick a video clip', 'error');
      return;
    }

    if (mediaType === 'image' && !imageUrl.trim()) {
      onShowToast?.('Please provide or pick a showcase image', 'error');
      return;
    }

    if (duration > 60 || duration <= 0) {
      onShowToast?.('Reel duration must be 60 seconds or less', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const rawMedia = (mediaType === 'image' ? imageUrl : videoUrl).trim();
      const finalMediaUrl = normalizeMediaUrl(rawMedia, mediaType);
      const safeThumbnail = mediaType === 'image'
        ? normalizeMediaUrl(rawMedia, 'image')
        : normalizeMediaUrl(
            (thumbnailUrl && !thumbnailUrl.toLowerCase().endsWith('.mp4') && !thumbnailUrl.toLowerCase().endsWith('.mov'))
              ? thumbnailUrl.trim()
              : rawMedia,
            'thumbnail'
          );

      const finalCaption = caption.trim() || (mediaType === 'image' ? 'My showcase photo reel 📸' : 'My showcase reel 🚀');

      await onSubmitReel?.({
        mediaType,
        mediaUrl: finalMediaUrl,
        videoUrl: finalMediaUrl,
        thumbnailUrl: safeThumbnail,
        caption: finalCaption,
        durationSeconds: duration || 15,
        visibility: visibility || 'public',
      });

      onShowToast?.(`🎉 ${mediaType === 'image' ? 'Photo Reel' : 'Video Reel'} Published Successfully!`, 'success');
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
              <Text style={styles.headerIcon}>{mediaType === 'image' ? '🖼️' : '🎬'}</Text>
              <Text style={styles.headerTitle}>Create New Reel</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Media Type Switcher: Video vs Photo Reel */}
            <Text style={styles.sectionLabel}>Choose Reel Format</Text>
            <View style={styles.mediaTypeRow}>
              <TouchableOpacity
                style={[
                  styles.mediaTypeBtn,
                  mediaType === 'video' && styles.mediaTypeBtnActive,
                ]}
                onPress={() => {
                  setMediaType('video');
                  if (!caption) setCaption('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.mediaTypeIcon}>📹</Text>
                <View>
                  <Text
                    style={[
                      styles.mediaTypeTitle,
                      mediaType === 'video' && styles.mediaTypeTitleActive,
                    ]}
                  >
                    Video Reel
                  </Text>
                  <Text style={styles.mediaTypeSub}>MP4 clip • Full motion</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mediaTypeBtn,
                  mediaType === 'image' && styles.mediaTypeBtnActive,
                ]}
                onPress={() => {
                  setMediaType('image');
                  if (!caption) setCaption('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.mediaTypeIcon}>🖼️</Text>
                <View>
                  <Text
                    style={[
                      styles.mediaTypeTitle,
                      mediaType === 'image' && styles.mediaTypeTitleActive,
                    ]}
                  >
                    Photo Reel
                  </Text>
                  <Text style={styles.mediaTypeSub}>Image card • High res</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Media Preview Chassis */}
            <View style={styles.previewContainer}>
              <Image source={{ uri: activePreviewUrl }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>
                    {mediaType === 'image' ? '🖼️ Photo Reel' : '📹 Video'} • ⏱️ {duration}s
                  </Text>
                </View>
                <View style={styles.visibilityBadge}>
                  <Text style={styles.visibilityBadgeText}>
                    {visibility === 'public' ? '🌐 Public Feed' : visibility === 'profile-only' ? '👤 Profile Only' : '🔒 Private'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Direct Device Gallery Upload (Cloudinary Powered) */}
            <TouchableOpacity
              style={[styles.galleryPickerCard, isUploadingToCloud && styles.galleryPickerCardDisabled]}
              onPress={handlePickFromGallery}
              disabled={isUploadingToCloud}
              activeOpacity={0.85}
            >
              <View style={styles.galleryIconWrapper}>
                <Text style={styles.galleryIconText}>
                  {mediaType === 'video' ? '🎬' : '📷'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.galleryCardTitle}>
                  {mediaType === 'video' ? 'Upload Video from Gallery' : 'Upload Photo from Gallery'}
                </Text>
                <Text style={styles.galleryCardSubtitle}>
                  {mediaType === 'video'
                    ? 'Select up to 60s clip • Fast Cloudinary CDN storage'
                    : 'Select high-res image • Fast Cloudinary CDN storage'}
                </Text>
              </View>
              <View style={styles.galleryActionBadge}>
                {isUploadingToCloud ? (
                  <ActivityIndicator size="small" color="#10b981" />
                ) : (
                  <Text style={styles.galleryActionText}>Choose ➔</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Live Cloudinary Upload Progress Bar */}
            {isUploadingToCloud && (
              <View style={styles.uploadProgressBox}>
                <View style={styles.uploadProgressHeader}>
                  <Text style={styles.uploadProgressTitle}>Uploading to Cloudinary CDN...</Text>
                  <Text style={styles.uploadProgressPercent}>{uploadProgress}%</Text>
                </View>
                <View style={styles.uploadProgressBarTrack}>
                  <View style={[styles.uploadProgressBarFill, { width: `${uploadProgress}%` }]} />
                </View>
                {Boolean(uploadedFileName) && (
                  <Text style={styles.uploadProgressFileName} numberOfLines={1}>
                    📁 {uploadedFileName}
                  </Text>
                )}
              </View>
            )}

            {/* Cloudinary CDN Active Badge */}
            {activeMediaUrl && activeMediaUrl.includes('cloudinary.com') && (
              <View style={styles.cloudSuccessBadge}>
                <Text style={styles.cloudSuccessIcon}>⚡</Text>
                <Text style={styles.cloudSuccessText}>
                  Cloudinary CDN Active: Fast playback & auto-optimized (q_auto, f_auto)
                </Text>
              </View>
            )}

            {/* Dedicated Cover Photo from Gallery Card */}
            <View style={styles.coverCardContainer}>
              <View style={styles.coverCardHeader}>
                <Text style={styles.sectionLabel}>Reel Cover Photo (Thumbnail)</Text>
                {thumbnailUrl && thumbnailUrl.includes('cloudinary.com') && (
                  <View style={styles.customCoverBadge}>
                    <Text style={styles.customCoverBadgeText}>✓ Custom Cover</Text>
                  </View>
                )}
              </View>

              <View style={styles.coverCardBody}>
                <Image
                  source={{
                    uri: normalizeMediaUrl(
                      mediaType === 'image'
                        ? (imageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800')
                        : (thumbnailUrl || videoUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'),
                      'thumbnail'
                    ),
                  }}
                  style={styles.coverPreviewThumb}
                  resizeMode="cover"
                />

                <View style={styles.coverActionCol}>
                  <Text style={styles.coverActionTitle}>
                    {mediaType === 'video' ? 'Video Cover / Poster' : 'Photo Reel Cover'}
                  </Text>
                  <Text style={styles.coverActionDesc}>
                    Select a custom cover photo directly from your device gallery
                  </Text>

                  <TouchableOpacity
                    style={[styles.coverPickerButton, isUploadingCover && styles.galleryPickerCardDisabled]}
                    onPress={handlePickCoverFromGallery}
                    disabled={isUploadingCover}
                    activeOpacity={0.8}
                  >
                    {isUploadingCover ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <>
                        <Text style={styles.coverPickerBtnIcon}>🖼️</Text>
                        <Text style={styles.coverPickerBtnText}>Upload Cover from Gallery</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {isUploadingCover && (
                    <View style={styles.coverProgressTrack}>
                      <View style={[styles.coverProgressFill, { width: `${coverUploadProgress}%` }]} />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* If Photo Reel: Image selection */}
            {mediaType === 'image' ? (
              <>
                <Text style={styles.sectionLabel}>Select Showcase Photo</Text>
                <View style={styles.sampleClipsRow}>
                  {SAMPLE_IMAGES.map((img) => (
                    <TouchableOpacity
                      key={img.id}
                      style={[
                        styles.sampleClipBtn,
                        imageUrl === img.imageUrl && styles.sampleClipBtnActive,
                      ]}
                      onPress={() => {
                        setImageUrl(img.imageUrl);
                        setCaption(img.caption);
                      }}
                    >
                      <Text
                        style={[
                          styles.sampleClipText,
                          imageUrl === img.imageUrl && styles.sampleClipTextActive,
                        ]}
                      >
                        {img.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Image URL Input */}
                <Text style={styles.sectionLabel}>Or Enter Image URL (Google Drive / Direct link)</Text>
                <TextInput
                  style={styles.inputField}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="Paste Google Drive image link or direct JPG/PNG URL"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
                {isGoogleDriveUrl(imageUrl) && (
                  <View style={styles.driveNoticeBox}>
                    <Text style={styles.driveNoticeIcon}>🟢</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driveNoticeTitle}>Google Drive Image Auto-Converted!</Text>
                      <Text style={styles.driveNoticeSub}>
                        High-res image streaming & thumbnail preview active. Ensure Drive sharing is set to "Anyone with the link".
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              /* If Video Reel: Video selection */
              <>
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
                <Text style={styles.sectionLabel}>Or Enter Video URL (Google Drive / MP4 / WebM)</Text>
                <TextInput
                  style={styles.inputField}
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="Paste Google Drive video link or direct MP4 URL"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                />
                {isGoogleDriveUrl(videoUrl) && (
                  <View style={styles.driveNoticeBox}>
                    <Text style={styles.driveNoticeIcon}>🟢</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driveNoticeTitle}>Google Drive Video Auto-Converted!</Text>
                      <Text style={styles.driveNoticeSub}>
                        Direct video stream & video thumbnail active. Ensure Drive sharing is set to "Anyone with the link".
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Duration Selector */}
            <Text style={styles.sectionLabel}>Display Duration Limit (Seconds)</Text>
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
              placeholder={mediaType === 'image' ? "What's this photo reel about? Add #design #skills #portfolio..." : "What's this video reel about? Add #coding #skills #demo..."}
              placeholderTextColor="#64748b"
              multiline={true}
              numberOfLines={3}
              maxLength={300}
            />

            {/* Visibility Selector */}
            <Text style={styles.sectionLabel}>Audience Visibility</Text>
            <View style={styles.visibilityRow}>
              {[
                { id: 'public', label: 'Public Feed', desc: 'Home feed & everyone can like/share' },
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
                <Text style={styles.publishBtnText}>
                  🚀 Publish {mediaType === 'image' ? 'Photo Reel' : 'Video Reel'}
                </Text>
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
  mediaTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  mediaTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
  },
  mediaTypeBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  mediaTypeIcon: {
    fontSize: 20,
  },
  mediaTypeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  mediaTypeTitleActive: {
    color: '#34d399',
  },
  mediaTypeSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
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
  driveNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 8,
  },
  driveNoticeIcon: {
    fontSize: 14,
  },
  driveNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34d399',
  },
  driveNoticeSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    lineHeight: 14,
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
  galleryPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10b981',
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  galleryPickerCardDisabled: {
    opacity: 0.6,
  },
  galleryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIconText: {
    fontSize: 22,
  },
  galleryCardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  galleryCardSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  galleryActionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryActionText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '800',
  },
  uploadProgressBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    padding: 12,
    marginBottom: 16,
  },
  uploadProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadProgressTitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadProgressPercent: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
  },
  uploadProgressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  uploadProgressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },
  uploadProgressFileName: {
    color: '#94a3b8',
    fontSize: 10,
  },
  cloudSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 16,
  },
  cloudSuccessIcon: {
    fontSize: 12,
  },
  cloudSuccessText: {
    color: '#34d399',
    fontSize: 10.5,
    fontWeight: '700',
    flex: 1,
  },
  coverCardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  coverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customCoverBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  customCoverBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  coverCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverPreviewThumb: {
    width: 64,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#020617',
    borderWidth: 1.5,
    borderColor: '#10b981',
  },
  coverActionCol: {
    flex: 1,
  },
  coverActionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  coverActionDesc: {
    fontSize: 10,
    color: '#94a3b8',
    lineHeight: 14,
    marginBottom: 8,
  },
  coverPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  coverPickerBtnIcon: {
    fontSize: 13,
  },
  coverPickerBtnText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },
  coverProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  coverProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
});
