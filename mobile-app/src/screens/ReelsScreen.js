import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { COLORS } from '../theme';
import { normalizeMediaUrl, getGoogleDriveFileId } from '../utils/media';
import ReelCreatorModal from '../components/ReelCreatorModal';

let ExpoVideo = null;
let ResizeMode = { COVER: 'cover', CONTAIN: 'contain' };
try {
  const expoAv = require('expo-av');
  ExpoVideo = expoAv.Video;
  if (expoAv.ResizeMode) {
    ResizeMode = expoAv.ResizeMode;
  }
} catch (e) {
  ExpoVideo = null;
}
import {
  fetchReelComments,
  addReelComment,
  deleteReelComment,
  toggleFollowCreator,
  checkFollowStatus,
  shareReelApi,
} from '../services/api';

const TOPIC_CHIPS = [
  { key: 'all', label: '✨ All' },
  { key: 'code', label: '💻 Code' },
  { key: 'uiux', label: '🎨 UI/UX' },
  { key: 'ai', label: '🤖 AI & ML' },
  { key: 'mobile', label: '📱 Mobile' },
  { key: 'career', label: '💼 Career' },
  { key: '3d', label: '🌐 3D & Cloud' },
];

export default function ReelsScreen({
  reels = [],
  loading = false,
  onShowToast,
  onViewCreatorProfile,
  currentUser = null,
  authToken = null,
  activeFeedTab = 'forYou', // 'forYou' | 'following' | 'saved'
  onSwitchFeedTab,
  onToggleBookmark,
  onNavigateToAuth,
  onCreateReel,
  isAdmin = false,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState({});
  const [likesCountMap, setLikesCountMap] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [bookmarksCountMap, setBookmarksCountMap] = useState({});
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showPlayState, setShowPlayState] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const flatListRef = useRef(null);
  const [feedHeight, setFeedHeight] = useState(
    Math.round(Dimensions.get('window').height * 0.73)
  );

  // Full-Screen Video Player Modal
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Comments State
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsCountMap, setCommentsCountMap] = useState({});

  // Follow State
  const [followMap, setFollowMap] = useState({});
  const [followLoading, setFollowLoading] = useState(false);

  const lastTapRef = useRef(0);
  const videoRef = useRef(null);

  const activeIndex = currentIndex >= 0 && currentIndex < reels.length ? currentIndex : 0;
  const isPhotoReel = Boolean(
    reels[activeIndex]?.mediaType === 'image' ||
    (reels[activeIndex]?.videoUrl && reels[activeIndex].videoUrl.match(/\.(jpeg|jpg|png|webp|gif)/i))
  );
  const currentReel = reels[activeIndex] || reels[0] || {};
  const reelId = currentReel?._id || `reel-${activeIndex}`;
  const creatorUsername = currentReel?.profileId?.username || '';
  const isLiked = !!likedMap[reelId];
  const isBookmarked = bookmarkedMap[reelId] ?? Boolean(currentReel?.isBookmarked);
  const likesCount = (likesCountMap[reelId] ?? currentReel?.likesCount) || 0;
  const bookmarksCount = (bookmarksCountMap[reelId] ?? currentReel?.bookmarksCount) || 0;
  const commentsCount = (commentsCountMap[reelId] ?? currentReel?.commentsCount) || 0;
  const isFollowing = !!followMap[creatorUsername];
  const isOwnReel = Boolean(
    currentUser?.profile?.username &&
    creatorUsername &&
    currentUser.profile.username === creatorUsername
  );
  const userIsAdmin = Boolean(
    isAdmin ||
    currentUser?.user?.role === 'admin' ||
    currentUser?.role === 'admin'
  );

  const currentIndexRef = useRef(activeIndex);
  currentIndexRef.current = activeIndex;
  const reelsLengthRef = useRef(reels.length);
  reelsLengthRef.current = reels.length;

  useEffect(() => {
    setImageError(false);
  }, [activeIndex, currentReel?._id]);

  useEffect(() => {
    try {
      const expoAv = require('expo-av');
      if (expoAv?.Audio?.setAudioModeAsync) {
        expoAv.Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        }).catch(() => {});
      }
    } catch (e) {}
  }, []);

  const reelThumbnailUri = (
    currentReel?.thumbnailUrl &&
    typeof currentReel.thumbnailUrl === 'string' &&
    currentReel.thumbnailUrl.trim().length > 0 &&
    !currentReel.thumbnailUrl.toLowerCase().endsWith('.mp4') &&
    !currentReel.thumbnailUrl.toLowerCase().endsWith('.mov')
  )
    ? currentReel.thumbnailUrl
    : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';

  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const onViewableItemsChangedRef = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const activeItem = viewableItems[0];
      if (typeof activeItem.index === 'number') {
        setCurrentIndex(activeItem.index);
        setIsPlaying(true);
      }
    }
  });

  const handleToggleBookmark = async (targetId = null) => {
    if (!authToken) {
      onShowToast('Sign in to save reels to your vault 🔖', 'info');
      if (onNavigateToAuth) onNavigateToAuth();
      return;
    }
    const id = targetId || reelId;
    const nextBookmarked = !bookmarkedMap[id];
    const targetReel = reels.find((r) => (r._id || r.id) === id) || currentReel;
    const currentCount = (bookmarksCountMap[id] ?? targetReel?.bookmarksCount) || 0;

    setBookmarkedMap((prev) => ({ ...prev, [id]: nextBookmarked }));
    setBookmarksCountMap((prev) => ({
      ...prev,
      [id]: nextBookmarked ? currentCount + 1 : Math.max(currentCount - 1, 0),
    }));

    if (onToggleBookmark && id) {
      const res = await onToggleBookmark(id);
      if (res) {
        setBookmarkedMap((prev) => ({ ...prev, [id]: res.isBookmarked }));
        setBookmarksCountMap((prev) => ({ ...prev, [id]: res.bookmarksCount }));
      }
    }
  };

  const handleSelectTopic = (topicKey) => {
    setSelectedTopic(topicKey);
    if (onSwitchFeedTab) {
      onSwitchFeedTab(activeFeedTab, topicKey === 'all' ? '' : topicKey, searchQuery);
    }
  };

  // Check follow status when active reel changes
  useEffect(() => {
    if (creatorUsername && authToken && !isOwnReel) {
      checkFollowStatus(authToken, creatorUsername).then((res) => {
        if (res?.success) {
          setFollowMap((prev) => ({ ...prev, [creatorUsername]: res.data?.isFollowing }));
        }
      });
    }
  }, [currentIndex, creatorUsername, authToken]);

  // Load comments when comments modal opens
  useEffect(() => {
    if (showCommentsModal && currentReel?._id) {
      loadComments(currentReel._id);
    }
  }, [showCommentsModal, currentReel?._id]);

  const loadComments = async (id) => {
    setLoadingComments(true);
    try {
      const res = await fetchReelComments(id);
      if (res?.success && res.data?.comments) {
        setComments(res.data.comments);
        setCommentsCountMap((prev) => ({ ...prev, [id]: res.data.comments.length }));
      } else {
        setComments([]);
      }
    } catch (e) {
      console.log('Error loading comments:', e.message);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const scrollToReelIndex = (index) => {
    if (index >= 0 && index < reels.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
      try {
        flatListRef.current?.scrollToIndex({ index, animated: true });
      } catch (e) {
        flatListRef.current?.scrollToOffset({
          offset: index * feedHeight,
          animated: true,
        });
      }
    }
  };

  const handleNext = () => {
    const total = reels.length || 1;
    const nextIndex = (currentIndex + 1) % total;
    scrollToReelIndex(nextIndex);
  };

  const handlePrev = () => {
    const total = reels.length || 1;
    const prevIndex = (currentIndex - 1 + total) % total;
    scrollToReelIndex(prevIndex);
  };

  const handleLikeToggle = (targetId = null) => {
    const id = targetId || reelId;
    const nextLiked = !likedMap[id];
    const targetReel = reels.find((r) => (r._id || r.id) === id) || currentReel;
    const currentCount = (likesCountMap[id] ?? targetReel?.likesCount) || 0;

    setLikedMap((prev) => ({ ...prev, [id]: nextLiked }));
    setLikesCountMap((prev) => ({
      ...prev,
      [id]: nextLiked ? currentCount + 1 : Math.max(currentCount - 1, 0),
    }));

    if (nextLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      onShowToast('Liked Reel! ❤️', 'success');
    }
  };

  const handlePlayReelVideo = (targetReel = null) => {
    const reel = targetReel || currentReel;
    const streamUrl = reel?.streamUrl || (reel?._id ? `https://myprofile-official-api.vercel.app/api/v1/reels/${reel._id}/stream` : null);
    const targetUrl = streamUrl || normalizeMediaUrl(reel?.videoUrl || reel?.mediaUrl, 'video');

    if (targetUrl) {
      if (Platform.OS === 'web') {
        setShowVideoModal(true);
      } else {
        Linking.openURL(targetUrl).catch(() => {
          onShowToast?.('Could not open video stream', 'error');
        });
      }
    } else {
      setShowVideoModal(true);
    }
  };

  const handleCardTap = (index = currentIndex) => {
    setCurrentIndex(index);
    const now = Date.now();
    const diff = now - lastTapRef.current;
    const targetReel = reels[index] || currentReel;
    const targetReelId = targetReel?._id || `reel-${index}`;

    if (diff < 300) {
      // Double tap like!
      handleLikeToggle(targetReelId);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap toggles inline Play / Pause (Instagram style - stays inside app!)
      setTimeout(() => {
        if (lastTapRef.current === now) {
          setIsPlaying((prev) => !prev);
          setShowPlayState(true);
          setTimeout(() => setShowPlayState(false), 700);
        }
      }, 320);
    }
  };

  const handleFollowToggle = async () => {
    if (!authToken) {
      onShowToast('Please sign in to follow creators', 'info');
      if (onNavigateToAuth) onNavigateToAuth();
      return;
    }

    if (!creatorUsername) return;
    const nextFollowing = !isFollowing;
    setFollowMap((prev) => ({ ...prev, [creatorUsername]: nextFollowing }));
    setFollowLoading(true);

    try {
      const res = await toggleFollowCreator(authToken, creatorUsername);
      if (res?.success) {
        onShowToast(res.message || (nextFollowing ? 'Following creator!' : 'Unfollowed creator'), 'success');
      } else {
        // Rollback
        setFollowMap((prev) => ({ ...prev, [creatorUsername]: !nextFollowing }));
        onShowToast(res?.message || 'Failed to update follow status', 'error');
      }
    } catch (e) {
      onShowToast('Follow action saved locally', 'info');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;

    if (!authToken) {
      onShowToast('Please sign in to post comments', 'info');
      if (onNavigateToAuth) onNavigateToAuth();
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await addReelComment(authToken, currentReel._id, commentInput.trim());
      if (res?.success && res.data) {
        setComments((prev) => [res.data, ...prev]);
        setCommentsCountMap((prev) => ({
          ...prev,
          [currentReel._id]: commentsCount + 1,
        }));
        setCommentInput('');
        onShowToast('Comment posted! 💬', 'success');
      } else {
        onShowToast(res?.message || 'Could not post comment', 'error');
      }
    } catch (e) {
      onShowToast('Comment submitted', 'info');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setCommentsCountMap((prev) => ({
        ...prev,
        [currentReel._id]: Math.max(0, commentsCount - 1),
      }));
      await deleteReelComment(authToken, currentReel._id, commentId);
      onShowToast('Comment removed 🗑️', 'info');
    } catch (e) {
      onShowToast('Comment removed', 'info');
    }
  };

  const handleShare = async (targetReel = null) => {
    const reel = targetReel || currentReel;
    const creator = reel?.profileId?.username || creatorUsername || 'creator';
    const id = reel?._id || reel?.id;
    const isPhoto = Boolean(
      reel?.mediaType === 'image' ||
      (reel?.videoUrl && reel.videoUrl.match(/\.(jpeg|jpg|png|webp|gif)/i))
    );
    const reelShareUrl = `https://myprofile-official-web.vercel.app/p/${creator}`;
    const shareMessage = `Check out this ${isPhoto ? 'photo reel' : 'reel'} by @${creator} on MyProfile: "${reel?.caption || 'Showcase'}"\n\n${reelShareUrl}`;

    try {
      if (id) {
        shareReelApi(id, authToken).catch(() => {});
      }
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareMessage);
          onShowToast?.('Reel link copied to clipboard! 📋', 'success');
        } else {
          onShowToast?.(`Shared: ${reelShareUrl}`, 'success');
        }
      } else {
        await Share.share({
          title: `Reel by @${creator}`,
          message: shareMessage,
          url: reelShareUrl,
        });
        onShowToast?.('Reel shared! 🚀', 'success');
      }
    } catch (e) {
      onShowToast?.(`Link copied for @${creator}!`, 'success');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Video Reels Feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Feed Tabs: For You vs Following vs Saved */}
      <View style={styles.feedTabsHeader}>
        <TouchableOpacity
          style={[styles.feedTabBtn, activeFeedTab === 'forYou' && styles.feedTabBtnActive]}
          onPress={() => onSwitchFeedTab && onSwitchFeedTab('forYou', selectedTopic === 'all' ? '' : selectedTopic, searchQuery)}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.feedTabText, activeFeedTab === 'forYou' && styles.feedTabTextActive]}
          >
            🌍 For You
          </Text>
          {activeFeedTab === 'forYou' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <View style={styles.feedTabSeparator} />

        <TouchableOpacity
          style={[styles.feedTabBtn, activeFeedTab === 'following' && styles.feedTabBtnActive]}
          onPress={() => {
            if (!authToken) {
              onShowToast('Sign in to view your Following feed', 'info');
              if (onNavigateToAuth) onNavigateToAuth();
              return;
            }
            if (onSwitchFeedTab) onSwitchFeedTab('following');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.feedTabText, activeFeedTab === 'following' && styles.feedTabTextActive]}
          >
            👥 Following
          </Text>
          {activeFeedTab === 'following' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <View style={styles.feedTabSeparator} />

        <TouchableOpacity
          style={[styles.feedTabBtn, activeFeedTab === 'saved' && styles.feedTabBtnActive]}
          onPress={() => {
            if (!authToken) {
              onShowToast('Sign in to view your Saved Vault', 'info');
              if (onNavigateToAuth) onNavigateToAuth();
              return;
            }
            if (onSwitchFeedTab) onSwitchFeedTab('saved');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.feedTabText, activeFeedTab === 'saved' && styles.feedTabTextActive]}
          >
            🔖 Saved
          </Text>
          {activeFeedTab === 'saved' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <View style={styles.feedTabSeparator} />

        <TouchableOpacity
          style={styles.postReelHeaderBtn}
          onPress={() => {
            if (!authToken && !currentUser?.token) {
              onShowToast('Sign in to post video reels 🎬', 'info');
              if (onNavigateToAuth) onNavigateToAuth();
              return;
            }
            setShowCreateModal(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.postReelHeaderText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Topic Filter Chips & Search Bar (Active on For You tab) */}
      {activeFeedTab === 'forYou' && (
        <View style={styles.topicFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topicScrollView}
            contentContainerStyle={styles.topicChipsScroll}
          >
            {TOPIC_CHIPS.map((chip) => {
              const isSelected = selectedTopic === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  style={[styles.topicChip, isSelected && styles.topicChipActive]}
                  onPress={() => handleSelectTopic(chip.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      isSelected && styles.topicChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Empty State for current feed */}
      {reels.length === 0 ? (
        <View style={styles.emptyFeedBox}>
          <Text style={styles.emptyIcon}>
            {activeFeedTab === 'following' ? '👥' : '🎬'}
          </Text>
          <Text style={styles.emptyTitle}>
            {activeFeedTab === 'following' ? 'No Followed Creators Yet' : 'No Reels Available'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeFeedTab === 'following'
              ? 'Follow creators from the "For You" feed or Profile screen to see their reels here.'
              : 'Be the first creator to upload a reel showcase!'}
          </Text>
          {activeFeedTab === 'following' && (
            <TouchableOpacity
              style={styles.exploreForYouBtn}
              onPress={() => onSwitchFeedTab && onSwitchFeedTab('forYou')}
            >
              <Text style={styles.exploreForYouText}>Explore "For You" Feed →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* Scrollable Vertical Reels Feed (Instagram / TikTok Style) */
        <View
          style={styles.feedWrapper}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height > 100 && Math.abs(height - feedHeight) > 1) {
              setFeedHeight(Math.round(height));
            }
          }}
        >
          <FlatList
            ref={flatListRef}
            data={reels}
            keyExtractor={(item, index) => item._id || `reel-${index}`}
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ flexGrow: 1 }}
            pagingEnabled={false}
            snapToInterval={feedHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum={true}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            viewabilityConfig={viewabilityConfigRef.current}
            onViewableItemsChanged={onViewableItemsChangedRef.current}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToOffset({
                offset: info.index * feedHeight,
                animated: true,
              });
            }}
            onMomentumScrollEnd={(e) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / feedHeight);
              if (index >= 0 && index < reels.length && index !== currentIndex) {
                setCurrentIndex(index);
                setIsPlaying(true);
              }
            }}
            getItemLayout={(data, index) => ({
              length: feedHeight,
              offset: feedHeight * index,
              index,
            })}
            renderItem={({ item, index }) => {
              const itemIsPhoto = Boolean(
                item?.mediaType === 'image' ||
                (item?.videoUrl && item.videoUrl.match(/\.(jpeg|jpg|png|webp|gif)/i))
              );
              const itemReelId = item?._id || `reel-${index}`;
              const itemCreatorUsername = item?.profileId?.username || '';
              const itemIsLiked = !!likedMap[itemReelId];
              const itemIsBookmarked = bookmarkedMap[itemReelId] ?? Boolean(item?.isBookmarked);
              const itemLikesCount = (likesCountMap[itemReelId] ?? item?.likesCount) || 0;
              const itemBookmarksCount = (bookmarksCountMap[itemReelId] ?? item?.bookmarksCount) || 0;
              const itemCommentsCount = (commentsCountMap[itemReelId] ?? item?.commentsCount) || 0;
              const itemIsFollowing = !!followMap[itemCreatorUsername];
              const itemIsOwnReel = Boolean(
                currentUser?.profile?.username &&
                itemCreatorUsername &&
                currentUser.profile.username === itemCreatorUsername
              );

              const itemCoverUri = normalizeMediaUrl(
                (item?.thumbnailUrl && typeof item.thumbnailUrl === 'string' && item.thumbnailUrl.trim().length > 0 && !item.thumbnailUrl.toLowerCase().endsWith('.mp4') && !item.thumbnailUrl.toLowerCase().endsWith('.mov'))
                  ? item.thumbnailUrl
                  : (item?.mediaUrl || item?.videoUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'),
                'image'
              );

              const itemVideoUri = item?.streamUrl ||
                (item?._id ? `https://myprofile-official-api.vercel.app/api/v1/reels/${item._id}/stream` : null) ||
                normalizeMediaUrl(item?.videoUrl || item?.mediaUrl, 'video');

              return (
                <View style={{ height: feedHeight, width: '100%', paddingBottom: 6 }}>
                  <View style={styles.reelChassis}>
                    {/* Background Media Pressable: Tapping toggles inline play/pause, double tap likes */}
                    <Pressable
                      style={StyleSheet.absoluteFillObject}
                      onPress={() => handleCardTap(index)}
                      delayPressIn={60}
                    >
                      {itemIsPhoto ? (
                        <Image
                          source={{ uri: itemCoverUri }}
                          style={styles.reelImage}
                          resizeMode="cover"
                        />
                      ) : Platform.OS === 'web' ? (
                        <video
                          key={itemReelId}
                          src={itemVideoUri}
                          poster={itemCoverUri}
                          autoPlay={currentIndex === index && isPlaying}
                          loop
                          playsInline
                          muted={isMuted}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            backgroundColor: '#000000',
                          }}
                        />
                      ) : ExpoVideo ? (
                        <ExpoVideo
                          source={{ uri: itemVideoUri }}
                          posterSource={{ uri: itemCoverUri }}
                          usePoster={currentIndex !== index}
                          posterStyle={styles.reelImage}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={currentIndex === index && isPlaying}
                          isLooping
                          isMuted={isMuted}
                          style={StyleSheet.absoluteFillObject}
                        />
                      ) : (
                        <Image
                          source={{ uri: itemCoverUri }}
                          style={styles.reelImage}
                          resizeMode="cover"
                        />
                      )}

                      {/* Vignette Gradients */}
                      <View style={styles.topVignette} pointerEvents="none" />
                      <View style={styles.bottomVignette} pointerEvents="none" />
                    </Pressable>

                    {/* Double-tap Heart Burst Overlay */}
                    {showHeartBurst && currentIndex === index && (
                      <View style={styles.centerOverlay} pointerEvents="none">
                        <Text style={styles.heartBurstIcon}>❤️</Text>
                      </View>
                    )}

                    {/* Play / Pause transient state indicator */}
                    {showPlayState && currentIndex === index && (
                      <View style={styles.centerOverlay} pointerEvents="none">
                        <View style={styles.playStateCircle}>
                          <Text style={styles.playStateIcon}>{isPlaying ? '▶' : '⏸'}</Text>
                        </View>
                      </View>
                    )}

                    {/* Fallback button only if native module not compiled into this APK build */}
                    {!ExpoVideo && Platform.OS !== 'web' && !itemIsPhoto && (
                      <TouchableOpacity
                        style={styles.playHintBadge}
                        activeOpacity={0.8}
                        onPress={() => handlePlayReelVideo(item)}
                      >
                        <Text style={styles.playHintIcon}>▶</Text>
                        <Text style={styles.playHintText}>Tap to Stream Video</Text>
                      </TouchableOpacity>
                    )}

                    {/* Floating Loop Controls */}
                    <View style={styles.loopPillContainer}>
                      <TouchableOpacity
                        style={styles.loopPillBtn}
                        onPress={() => {
                          const total = reels.length || 1;
                          const prev = (index - 1 + total) % total;
                          scrollToReelIndex(prev);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.loopPillIcon}>▲</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.loopPillBtn}
                        onPress={() => {
                          const total = reels.length || 1;
                          const next = (index + 1) % total;
                          scrollToReelIndex(next);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.loopPillIcon}>▼</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Top Bar on Reel - Reel count shown strictly for Admin; clean Instagram badge for regular users */}
                    <View style={styles.topBar} pointerEvents="box-none">
                      <View style={styles.counterPill}>
                        <Text style={styles.counterText}>
                          {userIsAdmin
                            ? `#${index + 1} of ${reels.length} • 👑 Admin`
                            : activeFeedTab === 'following'
                            ? '👥 Following • ↕️ Swipe'
                            : activeFeedTab === 'saved'
                            ? '🔖 Saved • ↕️ Swipe'
                            : '✨ For You • ↕️ Swipe'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.cardMuteBtn}
                          onPress={() => setIsMuted((m) => !m)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.cardMuteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
                        </TouchableOpacity>

                        <View style={styles.liveTag}>
                          <View style={styles.pulseDot} />
                          <Text style={styles.liveTagText}>60 FPS</Text>
                        </View>
                      </View>
                    </View>

                    {/* Right Action Rail */}
                    <View style={styles.actionRail}>
                      {/* Like Button */}
                      <TouchableOpacity
                        style={[styles.actionBtn, itemIsLiked && styles.actionBtnActive]}
                        onPress={() => handleLikeToggle(itemReelId)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionIcon}>{itemIsLiked ? '❤️' : '🤍'}</Text>
                        <Text style={styles.actionCount}>{itemLikesCount}</Text>
                      </TouchableOpacity>

                      {/* Comments Button */}
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          setCurrentIndex(index);
                          setShowCommentsModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionCount}>{itemCommentsCount}</Text>
                      </TouchableOpacity>

                      {/* Bookmark / Saved Vault Button */}
                      <TouchableOpacity
                        style={[styles.actionBtn, itemIsBookmarked && styles.actionBtnActive]}
                        onPress={() => handleToggleBookmark(itemReelId)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionIcon}>{itemIsBookmarked ? '🔖' : '📑'}</Text>
                        <Text
                          style={[
                            styles.actionCount,
                            itemIsBookmarked && { color: '#fbbf24', fontWeight: '800' },
                          ]}
                        >
                          {itemBookmarksCount > 0 ? itemBookmarksCount : 'Save'}
                        </Text>
                      </TouchableOpacity>

                      {/* View Counter - Visible exclusively to Admin & Reel Owner */}
                      {(userIsAdmin || itemIsOwnReel) && (
                        <View style={styles.actionBtn}>
                          <Text style={styles.actionIcon}>👁️</Text>
                          <Text style={styles.actionCount}>
                            {item.viewsCount !== undefined ? item.viewsCount : 0}
                          </Text>
                        </View>
                      )}

                      {/* Share Button */}
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleShare(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionIcon}>📤</Text>
                        <Text style={styles.actionCount}>Share</Text>
                      </TouchableOpacity>

                      {/* Profile Quick Jump */}
                      {Boolean(itemCreatorUsername) && (
                        <TouchableOpacity
                          style={styles.creatorActionBtn}
                          onPress={() => onViewCreatorProfile(itemCreatorUsername)}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{
                              uri:
                                item.profileId?.photoUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profileId?.name || 'User')}&background=1e293b&color=94a3b8&size=256`,
                            }}
                            style={styles.creatorMiniAvatar}
                          />
                          <View style={styles.creatorMiniTick}>
                            <Text style={styles.miniTickText}>✓</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Bottom Drawer (Creator info & Caption) */}
                    <View style={styles.bottomDrawer}>
                      {/* Master Pitch Golden Pinned Badge */}
                      {Boolean(item.isPinned) && (
                        <View style={styles.masterPitchBadge}>
                          <Text style={styles.masterPitchBadgeText}>📌 MASTER PITCH</Text>
                        </View>
                      )}

                      {Boolean(item.profileId) && (
                        <View style={styles.creatorRow}>
                          <TouchableOpacity
                            style={styles.creatorPill}
                            onPress={() => onViewCreatorProfile(itemCreatorUsername)}
                            activeOpacity={0.8}
                          >
                            <Image
                              source={{
                                uri:
                                  item.profileId.photoUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profileId.name || 'User')}&background=1e293b&color=94a3b8&size=256`,
                              }}
                              style={styles.creatorAvatar}
                            />
                            <View style={styles.creatorTexts}>
                              <Text style={styles.creatorName}>
                                {item.profileId.name}{' '}
                                <Text style={styles.verifiedCheck}>
                                  {item.profileId.verifiedBadge === 'top_creator'
                                    ? '⭐'
                                    : item.profileId.verifiedBadge === 'verified_engineer'
                                    ? '⚡'
                                    : '🛡️'}
                                </Text>
                              </Text>
                              <Text style={styles.creatorHandle}>
                                @{itemCreatorUsername}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          {/* Follow Button */}
                          {!itemIsOwnReel && itemCreatorUsername ? (
                            <TouchableOpacity
                              style={[
                                styles.followBtn,
                                itemIsFollowing && styles.followingBtn,
                              ]}
                              onPress={() => handleFollowToggle(itemCreatorUsername)}
                              disabled={followLoading}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.followBtnText,
                                  itemIsFollowing && styles.followingBtnText,
                                ]}
                              >
                                {itemIsFollowing ? '✓ Following' : '+ Follow'}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      )}

                      {item.caption ? (
                        <View style={styles.captionBox}>
                          <Text style={styles.captionText} numberOfLines={2}>
                            {item.caption}
                          </Text>
                        </View>
                      ) : null}

                      {/* Audio Ticker & Spinning Vinyl Disc */}
                      <View style={styles.audioContainer}>
                        <View style={styles.audioRow}>
                          <Text style={styles.audioIcon}>🎵</Text>
                          <Text style={styles.audioText} numberOfLines={1}>
                            {item.audioTrack?.title || 'Original Sound'} • {item.audioTrack?.artist || item.profileId?.name || 'Verified Creator'}
                          </Text>
                        </View>
                        <View style={styles.vinylDisc}>
                          <View style={styles.vinylInnerRing}>
                            <View style={styles.vinylCenterHole} />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* ========================================================================= */}
      {/* 0. CREATE / PUBLISH REEL MODAL                                            */}
      {/* ========================================================================= */}
      <ReelCreatorModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmitReel={async (data) => {
          if (onCreateReel) {
            return await onCreateReel(data);
          }
        }}
        onShowToast={onShowToast}
      />

      {/* ========================================================================= */}
      {/* 1. IMMERSIVE FULL-SCREEN VIDEO PLAYER MODAL                               */}
      {/* ========================================================================= */}
      <Modal
        visible={showVideoModal}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setShowVideoModal(false)}
      >
        <View style={styles.fullPlayerContainer}>
          {/* Top Controls Overlay */}
          <View style={styles.fullPlayerTopBar}>
            <TouchableOpacity
              style={styles.playerCloseBtn}
              onPress={() => setShowVideoModal(false)}
            >
              <Text style={styles.playerCloseText}>✕ Close</Text>
            </TouchableOpacity>

            <View style={styles.playerCreatorHeader}>
              <Text style={styles.playerCreatorName} numberOfLines={1}>
                {currentReel?.profileId?.name || 'Reel Playback'}
              </Text>
              <Text style={styles.playerCreatorHandle}>
                @{creatorUsername}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.muteBtn}
              onPress={() => setIsMuted((m) => !m)}
            >
              <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
          </View>

          {/* Web HTML5 Video / Native Media Player / Photo Reel */}
          <View style={styles.videoSurfaceWrapper}>
            {isPhotoReel ? (
              <Image
                source={{
                  uri: normalizeMediaUrl(currentReel?.mediaUrl || currentReel?.videoUrl || currentReel?.thumbnailUrl, 'image'),
                }}
                style={styles.reelImage}
                resizeMode="contain"
              />
            ) : Platform.OS === 'web' ? (
              (() => {
                const fileId = getGoogleDriveFileId(currentReel?.videoUrl || currentReel?.mediaUrl);
                if (fileId) {
                  return (
                    <iframe
                      src={`https://drive.google.com/file/d/${fileId}/preview`}
                      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#000000' }}
                      allow="autoplay; fullscreen"
                    />
                  );
                }
                return (
                  <video
                    ref={videoRef}
                    src={normalizeMediaUrl(currentReel?.videoUrl || currentReel?.mediaUrl, 'video') || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      backgroundColor: '#000000',
                    }}
                  />
                );
              })()
            ) : (
              <View style={StyleSheet.absoluteFillObject}>
                <Image
                  source={{
                    uri: normalizeMediaUrl(currentReel?.thumbnailUrl || currentReel?.mediaUrl || currentReel?.videoUrl, 'image'),
                  }}
                  style={styles.reelImage}
                  resizeMode="cover"
                />
                <View style={styles.nativePlayOverlay}>
                  <TouchableOpacity
                    style={styles.nativePlayBtn}
                    activeOpacity={0.85}
                    onPress={() => handlePlayReelVideo(currentReel)}
                  >
                    <View style={styles.nativePlayIconCircle}>
                      <Text style={styles.nativePlayTriangle}>▶</Text>
                    </View>
                    <Text style={styles.nativePlayTitle}>Play Reel Video</Text>
                    <Text style={styles.nativePlaySub}>Tap to watch in high definition stream</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bottom Overlay on Player */}
            <View style={styles.fullPlayerBottomOverlay}>
              {currentReel?.isPinned && (
                <View style={styles.masterPitchBadge}>
                  <Text style={styles.masterPitchBadgeText}>📌 MASTER PITCH</Text>
                </View>
              )}
              <Text style={styles.fullPlayerCaption}>
                {currentReel?.caption}
              </Text>
              <View style={styles.audioRow}>
                <Text style={styles.audioIcon}>🎵</Text>
                <Text style={styles.audioText} numberOfLines={1}>
                  {currentReel?.audioTrack?.title || 'Original Sound'} • {currentReel?.audioTrack?.artist || currentReel?.profileId?.name || 'Verified Creator'}
                </Text>
              </View>

              {/* Progress Line */}
              <View style={styles.progressBarTrack}>
                <View style={styles.progressBarFill} />
              </View>

              {/* Quick Actions in Player */}
              <View style={styles.fullPlayerActionsRow}>
                <TouchableOpacity
                  style={styles.playerActionPill}
                  onPress={handleLikeToggle}
                >
                  <Text style={styles.playerActionText}>
                    {isLiked ? '❤️' : '🤍'} {likesCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playerActionPill}
                  onPress={() => {
                    setShowVideoModal(false);
                    setTimeout(() => setShowCommentsModal(true), 300);
                  }}
                >
                  <Text style={styles.playerActionText}>💬 {commentsCount} Comments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playerActionPill}
                  onPress={handleShare}
                >
                  <Text style={styles.playerActionText}>📤 Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. COMMENTS BOTTOM SHEET MODAL                                            */}
      {/* ========================================================================= */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.commentsSheet}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Comments ({comments.length})
              </Text>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setShowCommentsModal(false)}
              >
                <Text style={styles.sheetCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {loadingComments ? (
              <View style={styles.commentsCenterLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingCommentsText}>Loading conversation...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyCommentsBox}>
                <Text style={styles.emptyCommentsIcon}>💬</Text>
                <Text style={styles.emptyCommentsTitle}>No comments yet</Text>
                <Text style={styles.emptyCommentsSubtitle}>
                  Be the first to share your thoughts with @{creatorUsername}!
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.commentsScrollView}
                contentContainerStyle={styles.commentsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {comments.map((item) => {
                  const isAuthor = currentUser?.user?._id && item.userId === currentUser.user._id;
                  const isReelCreator = currentUser?.profile?._id && currentReel.profileId?._id === currentUser.profile._id;
                  const canDelete = isAuthor || isReelCreator || currentUser?.user?.role === 'admin';

                  return (
                    <View key={item._id} style={styles.commentItem}>
                      <View style={styles.commentAvatarWrapper}>
                        {item.profileId?.photoUrl ? (
                          <Image
                            source={{ uri: item.profileId.photoUrl }}
                            style={styles.commentAvatarImg}
                          />
                        ) : (
                          <View style={styles.commentAvatarFallback}>
                            <Text style={styles.commentAvatarText}>
                              {(item.profileId?.name || 'U').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.commentBody}>
                        <View style={styles.commentMetaRow}>
                          <Text style={styles.commentAuthorName}>
                            {item.profileId?.name || 'Creator'}
                          </Text>
                          <Text style={styles.commentAuthorHandle}>
                            @{item.profileId?.username || 'user'}
                          </Text>
                          <Text style={styles.commentDate}>
                            {new Date(item.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>

                        <Text style={styles.commentText}>{item.text}</Text>
                      </View>

                      {Boolean(canDelete) && (
                        <TouchableOpacity
                          style={styles.deleteCommentBtn}
                          onPress={() => handleDeleteComment(item._id)}
                        >
                          <Text style={styles.deleteCommentText}>🗑️</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* Comment Input Bar */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentTextInput}
                placeholder={
                  authToken
                    ? `Add comment as @${currentUser?.profile?.username || 'me'}...`
                    : 'Sign in to add a comment...'
                }
                placeholderTextColor="#64748b"
                value={commentInput}
                onChangeText={setCommentInput}
                editable={!submittingComment}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                style={[
                  styles.sendCommentBtn,
                  (!commentInput.trim() || submittingComment) && styles.sendCommentBtnDisabled,
                ]}
                onPress={handleAddComment}
                disabled={!commentInput.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.sendCommentText}>➤</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  loopPillContainer: {
    position: 'absolute',
    left: 12,
    top: '42%',
    zIndex: 25,
    gap: 10,
  },
  loopPillBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loopPillIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
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
  feedTabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
    gap: 8,
  },
  feedTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    position: 'relative',
    alignItems: 'center',
  },
  feedTabBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  feedTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  feedTabTextActive: {
    color: '#34d399',
    fontWeight: '900',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },
  feedTabSeparator: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  postReelHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postReelHeaderText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '900',
  },
  emptyFeedBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
  exploreForYouBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreForYouText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 12,
  },
  feedWrapper: {
    flex: 1,
    width: '100%',
  },
  reelChassis: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0a0f1d',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  playHintBadge: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  playHintIcon: {
    fontSize: 12,
    color: '#34d399',
  },
  playHintText: {
    fontSize: 11,
    fontWeight: '800',
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
  cardMuteBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMuteIcon: {
    fontSize: 12,
  },
  playStateCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playStateIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  actionRail: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    alignItems: 'center',
    zIndex: 25,
    gap: 12,
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
    marginTop: 4,
    position: 'relative',
  },
  creatorMiniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  creatorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  creatorTexts: {
    marginRight: 2,
  },
  creatorName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  verifiedCheck: {
    color: '#34d399',
    fontSize: 10,
  },
  creatorHandle: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
  },
  followBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  followingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  followBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34d399',
  },
  followingBtnText: {
    color: '#cbd5e1',
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
    left: 12,
    top: '40%',
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

  /* FULL PLAYER MODAL STYLES */
  fullPlayerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullPlayerTopBar: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  playerCloseBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playerCloseText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  playerCreatorHeader: {
    alignItems: 'center',
  },
  playerCreatorName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  playerCreatorHandle: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  muteBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  muteIcon: {
    fontSize: 16,
  },
  videoSurfaceWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fullPlayerBottomOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 20,
    gap: 10,
  },
  fullPlayerCaption: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#10b981',
  },
  fullPlayerActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  playerActionPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  playerActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },

  /* COMMENTS SHEET STYLES */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  commentsSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    maxHeight: '65%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetCloseText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  commentsCenterLoading: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingCommentsText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyCommentsBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyCommentsIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyCommentsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyCommentsSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  commentsScrollView: {
    maxHeight: 280,
    marginVertical: 10,
  },
  commentsScrollContent: {
    gap: 12,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  commentAvatarImg: {
    width: '100%',
    height: '100%',
  },
  commentAvatarFallback: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  commentBody: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthorName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  commentAuthorHandle: {
    fontSize: 10,
    color: '#64748b',
  },
  commentDate: {
    fontSize: 9,
    color: '#475569',
  },
  commentText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
    lineHeight: 16,
  },
  deleteCommentBtn: {
    padding: 4,
  },
  deleteCommentText: {
    fontSize: 12,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 6,
  },
  sendCommentBtn: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentBtnDisabled: {
    opacity: 0.35,
  },
  sendCommentText: {
    color: '#020617',
    fontSize: 14,
    fontWeight: '900',
  },
  topicFilterContainer: {
    width: '100%',
    height: 38,
    marginBottom: 8,
    zIndex: 10,
  },
  topicScrollView: {
    flexGrow: 0,
    height: 38,
  },
  topicChipsScroll: {
    paddingHorizontal: 4,
    gap: 6,
    alignItems: 'center',
  },
  topicChip: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topicChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  topicChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  topicChipTextActive: {
    color: '#020617',
    fontWeight: '800',
  },
  masterPitchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  masterPitchBadgeText: {
    color: '#0f172a',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  vinylDisc: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  vinylInnerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenterHole: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
});
