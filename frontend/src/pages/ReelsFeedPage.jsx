import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Heart,
  Eye,
  Share2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Film,
  Sparkles,
  User
} from 'lucide-react';
import { useToast } from '../components/Toast';

const ReelsFeedPage = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [isMuted, setIsMuted] = useState(true); // default muted for browser autoplay policy
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);

  const videoRef = useRef(null);
  const lastTapRef = useRef(0);
  const toast = useToast();

  useEffect(() => {
    fetchReelsFeed();
  }, []);

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length, isPlaying]);

  const fetchReelsFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reels/feed');
      if (res.data.success) {
        const fetched = res.data.data.reels || [];
        setReels(fetched);

        const initialLikes = {};
        fetched.forEach((r) => {
          initialLikes[r._id] = r.likesCount || 0;
        });
        setLikesCount(initialLikes);

        // Record initial view
        if (fetched.length > 0) {
          api.post(`/reels/${fetched[0]._id}/view`).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load reels feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsPlaying(true);
      api.post(`/reels/${reels[nextIdx]._id}/view`).catch(() => {});
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleLike = async (reelId) => {
    const current = likesCount[reelId] || 0;
    const liked = isLiked[reelId];

    setIsLiked((prev) => ({ ...prev, [reelId]: !liked }));
    setLikesCount((prev) => ({ ...prev, [reelId]: liked ? Math.max(current - 1, 0) : current + 1 }));

    try {
      await api.post(`/reels/${reelId}/like`);
    } catch (err) {
      // rollback if failed
      setIsLiked((prev) => ({ ...prev, [reelId]: liked }));
      setLikesCount((prev) => ({ ...prev, [reelId]: current }));
    }
  };

  const handleVideoTap = (e) => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < 320) {
      // Double tap detected!
      const reelId = reels[currentIndex]?._id;
      if (reelId) {
        if (!isLiked[reelId]) {
          handleLike(reelId);
        }
        setShowHeartAnim(true);
        setTimeout(() => setShowHeartAnim(false), 750);
      }
      lastTapRef.current = 0;
    } else {
      // Single tap candidate
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          togglePlayPause();
        }
      }, 330);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
      setShowPlayOverlay(true);
      setTimeout(() => setShowPlayOverlay(false), 600);
    }
  };

  const handleShare = (reel) => {
    const profileUrl = `${window.location.origin}/p/${reel.profileId?.username || ''}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success('Creator profile link copied to clipboard!');
  };

  const currentReel = reels[currentIndex];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-emerald-400">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">No Public Reels Yet</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          Be the first to share a high-impact video showcase from your Creator Studio dashboard!
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          Go to Creator Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-4 select-none">
      {/* Keyboard hints banner (Desktop) */}
      <div className="hidden md:flex items-center space-x-4 mb-3 text-[11px] text-slate-500 font-mono">
        <span>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">↓</kbd> to navigate</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Space</kbd> to play/pause</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">M</kbd> to mute</span>
      </div>

      <div className="relative w-full max-w-[370px] aspect-[9/16] rounded-[36px] overflow-hidden glass-panel border border-slate-800/90 shadow-2xl bg-black">
        {/* Video Player or Google Drive Embedded Player */}
        {(() => {
          const driveMatch = currentReel?.videoUrl?.match(
            /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/
          );
          const googleDriveId = driveMatch ? driveMatch[1] : null;

          if (googleDriveId) {
            return (
              <iframe
                key={currentReel._id}
                src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
                title={currentReel.caption || 'Reel Video'}
                className="w-full h-full border-0 select-none bg-black"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            );
          }

          return (
            <video
              ref={videoRef}
              key={currentReel._id}
              src={currentReel.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onClick={handleVideoTap}
              className="w-full h-full object-cover cursor-pointer"
            />
          );
        })()}

        {/* Double-tap burst heart animation */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-burst drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
          </div>
        )}

        {/* Play / Pause transient indicator */}
        {showPlayOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 animate-scale-up">
              {isPlaying ? <Play className="w-8 h-8 fill-white ml-1" /> : <Pause className="w-8 h-8 fill-white" />}
            </div>
          </div>
        )}

        {/* Ambient Top & Bottom Gradients and Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 flex flex-col justify-between p-5 pointer-events-none">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-md">
                {currentIndex + 1} / {reels.length}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                LIVE
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Bottom Info & Action Bar */}
          <div className="flex items-end justify-between pointer-events-auto gap-4 pb-2">
            {/* Creator details */}
            <div className="flex-1 space-y-2">
              {currentReel.profileId && (
                <Link
                  to={`/p/${currentReel.profileId.username}`}
                  className="flex items-center space-x-2.5 group bg-black/40 hover:bg-black/60 p-1.5 pr-3 rounded-full backdrop-blur-md border border-white/10 transition-all w-fit max-w-full"
                >
                  <img
                    src={currentReel.profileId.photoUrl && !currentReel.profileId.photoUrl.includes('photo-1534528741775') ? currentReel.profileId.photoUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentReel.profileId.name || 'User')}&background=1e293b&color=10b981&bold=true&size=256`}
                    alt={currentReel.profileId.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center space-x-1 truncate">
                      <span className="truncate">{currentReel.profileId.name}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70 flex-shrink-0" />
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">@{currentReel.profileId.username}</p>
                  </div>
                </Link>
              )}

              {currentReel.caption && (
                <p className="text-xs text-slate-100 line-clamp-3 leading-relaxed drop-shadow bg-black/30 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                  {currentReel.caption}
                </p>
              )}
            </div>

            {/* Right interaction column */}
            <div className="flex flex-col items-center space-y-3.5 flex-shrink-0">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => handleLike(currentReel._id)}
                className="flex flex-col items-center group"
                aria-label="Like reel"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg border border-white/10 backdrop-blur-md ${
                    isLiked[currentReel._id]
                      ? 'bg-rose-500 text-white shadow-rose-500/30'
                      : 'bg-black/60 text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked[currentReel._id] ? 'fill-current' : ''}`} />
                </div>
                <span className="text-[11px] text-white font-bold mt-1 drop-shadow">
                  {likesCount[currentReel._id] || 0}
                </span>
              </button>

              {/* View Counter */}
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/10 shadow-lg">
                  <Eye className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[11px] text-white font-bold mt-1 drop-shadow">
                  {currentReel.viewsCount || 0}
                </span>
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => handleShare(currentReel)}
                className="flex flex-col items-center group"
                aria-label="Share creator link"
              >
                <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white group-hover:text-emerald-300 flex items-center justify-center border border-white/10 shadow-lg transition-transform group-hover:scale-110">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-300 font-semibold mt-1 drop-shadow">
                  Share
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Up / Down navigation overlay triggers */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-20">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-20 transition-all backdrop-blur-md border border-white/10 shadow-lg"
            aria-label="Previous reel"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === reels.length - 1}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white disabled:opacity-20 transition-all backdrop-blur-md border border-white/10 shadow-lg"
            aria-label="Next reel"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReelsFeedPage;
