import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

export default function ReelsScreen({
  reels = [],
  loading,
  onShowToast,
  onViewCreatorProfile,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState({});
  const [likesCountMap, setLikesCountMap] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showPlayState, setShowPlayState] = useState(false);

  const lastTapRef = useRef(0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Video Reels Feed...</Text>
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconBox}>
          <Text style={styles.emptyIcon}>🎬</Text>
        </View>
        <Text style={styles.emptyTitle}>No Reels Published Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create short-form video showcases from the Creator Studio to showcase your skills.
        </Text>
      </View>
    );
  }

  const currentReel = reels[currentIndex] || reels[0];
  const reelId = currentReel._id || `reel-${currentIndex}`;
  const isLiked = !!likedMap[reelId];
  const likesCount = (likesCountMap[reelId] ?? currentReel.likesCount) || 12;

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleLikeToggle = () => {
    const nextLiked = !isLiked;
    setLikedMap((prev) => ({ ...prev, [reelId]: nextLiked }));
    setLikesCountMap((prev) => ({
      ...prev,
      [reelId]: nextLiked ? likesCount + 1 : Math.max(likesCount - 1, 0),
    }));

    if (nextLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      onShowToast('Liked Reel!', 'success');
    }
  };

  const handleCardTap = () => {
    const now = Date.now();
    const diff = now - lastTapRef.current;

    if (diff < 300) {
      // Double tap like!
      if (!isLiked) {
        handleLikeToggle();
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 800);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          setIsPlaying((prev) => !prev);
          setShowPlayState(true);
          setTimeout(() => setShowPlayState(false), 600);
        }
      }, 320);
    }
  };

  const handleShare = () => {
    onShowToast(`Copied link for @${currentReel.profileId?.username || 'creator'}!`, 'success');
  };

  return (
    <View style={styles.container}>
      {/* Video Reel Chassis Card */}
      <TouchableOpacity
        style={styles.reelChassis}
        activeOpacity={1}
        onPress={handleCardTap}
      >
        {/* Cover / Media Image */}
        <Image
          source={{
            uri:
              currentReel.thumbnailUrl ||
              currentReel.videoUrl ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
          }}
          style={styles.reelImage}
          resizeMode="cover"
        />

        {/* Ambient Top & Bottom Shading Gradients */}
        <View style={styles.topVignette} />
        <View style={styles.bottomVignette} />

        {/* Double-tap Heart Burst Overlay */}
        {showHeartBurst && (
          <View style={styles.centerOverlay}>
            <Text style={styles.heartBurstIcon}>❤️</Text>
          </View>
        )}

        {/* Play / Pause indicator */}
        {showPlayState && (
          <View style={styles.centerOverlay}>
            <View style={styles.playStateCircle}>
              <Text style={styles.playStateIcon}>{isPlaying ? '▶' : '⏸'}</Text>
            </View>
          </View>
        )}

        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {reels.length}
            </Text>
          </View>

          <View style={styles.liveTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveTagText}>REEL</Text>
          </View>
        </View>

        {/* Right Action Rail (Vertical Interaction Stack) */}
        <View style={styles.actionRail}>
          {/* Like Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
            onPress={handleLikeToggle}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionCount}>{likesCount}</Text>
          </TouchableOpacity>

          {/* View Counter */}
          <View style={styles.actionBtn}>
            <Text style={styles.actionIcon}>👁️</Text>
            <Text style={styles.actionCount}>
              {currentReel.viewsCount || 240}
            </Text>
          </View>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>

          {/* Profile Quick Jump */}
          {currentReel.profileId?.username && (
            <TouchableOpacity
              style={styles.creatorActionBtn}
              onPress={() =>
                onViewCreatorProfile(currentReel.profileId.username)
              }
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    currentReel.profileId.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                }}
                style={styles.creatorMiniAvatar}
              />
              <View style={styles.creatorMiniTick}>
                <Text style={styles.miniTickText}>✓</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Metadata & Creator Drawer */}
        <View style={styles.bottomDrawer}>
          {currentReel.profileId && (
            <TouchableOpacity
              style={styles.creatorPill}
              onPress={() =>
                onViewCreatorProfile(currentReel.profileId.username)
              }
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    currentReel.profileId.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                }}
                style={styles.creatorAvatar}
              />
              <View style={styles.creatorTexts}>
                <Text style={styles.creatorName}>
                  {currentReel.profileId.name}{' '}
                  <Text style={styles.verifiedCheck}>✓</Text>
                </Text>
                <Text style={styles.creatorHandle}>
                  @{currentReel.profileId.username}
                </Text>
              </View>
              <View style={styles.viewBadge}>
                <Text style={styles.viewBadgeText}>View</Text>
              </View>
            </TouchableOpacity>
          )}

          {currentReel.caption ? (
            <View style={styles.captionBox}>
              <Text style={styles.captionText} numberOfLines={2}>
                {currentReel.caption}
              </Text>
            </View>
          ) : null}

          {/* Audio Ticker */}
          <View style={styles.audioRow}>
            <Text style={styles.audioIcon}>🎵</Text>
            <Text style={styles.audioText}>
              Original Audio • {currentReel.profileId?.name || 'Verified Creator'}
            </Text>
          </View>
        </View>

        {/* Floating Quick Navigation Chevrons */}
        <View style={styles.navChevrons}>
          <TouchableOpacity
            style={[styles.chevronBtn, currentIndex === 0 && styles.chevronDisabled]}
            disabled={currentIndex === 0}
            onPress={handlePrev}
          >
            <Text style={styles.chevronText}>▲</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chevronBtn,
              currentIndex === reels.length - 1 && styles.chevronDisabled,
            ]}
            disabled={currentIndex === reels.length - 1}
            onPress={handleNext}
          >
            <Text style={styles.chevronText}>▼</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    lineHeight: 18,
  },
  reelChassis: {
    width: '100%',
    height: '100%',
    maxHeight: 560,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  reelImage: {
    width: '100%',
    height: '100%',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  heartBurstIcon: {
    fontSize: 72,
  },
  playStateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playStateIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  counterPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  counterText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveTagText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
  },
  actionRail: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    alignItems: 'center',
    zIndex: 25,
    gap: 14,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
    borderColor: 'rgba(244, 63, 94, 0.5)',
  },
  actionIcon: {
    fontSize: 18,
  },
  actionCount: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 1,
  },
  creatorActionBtn: {
    marginTop: 6,
    position: 'relative',
  },
  creatorMiniAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  creatorMiniTick: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTickText: {
    fontSize: 8,
    color: '#020617',
    fontWeight: '900',
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 70,
    zIndex: 20,
    gap: 8,
  },
  creatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'flex-start',
    gap: 8,
  },
  creatorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  creatorTexts: {
    marginRight: 4,
  },
  creatorName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  verifiedCheck: {
    color: '#34d399',
    fontSize: 10,
  },
  creatorHandle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  viewBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  viewBadgeText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '800',
  },
  captionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  captionText: {
    color: '#f1f5f9',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioIcon: {
    fontSize: 11,
  },
  audioText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  navChevrons: {
    position: 'absolute',
    right: 12,
    top: '38%',
    zIndex: 22,
    gap: 8,
  },
  chevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chevronDisabled: {
    opacity: 0.25,
  },
  chevronText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
});
