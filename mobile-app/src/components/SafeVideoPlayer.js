import React, { Component } from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { normalizeMediaUrl, getCloudinaryThumbnail } from '../utils/media';

let ExpoVideo = null;
let ResizeMode = { COVER: 'cover', CONTAIN: 'contain' };

if (Platform.OS !== 'web') {
  try {
    const expoAv = require('expo-av');
    ExpoVideo = expoAv.Video;
    if (expoAv.ResizeMode) {
      ResizeMode = expoAv.ResizeMode;
    }
  } catch (e) {
    ExpoVideo = null;
  }
}

export const initAudioMode = async () => {
  if (Platform.OS === 'web') return;
  try {
    const expoAv = require('expo-av');
    if (expoAv?.Audio?.setAudioModeAsync) {
      await expoAv.Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    }
  } catch (e) {}
};

class VideoErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.log('[SafeVideoPlayer] Native video error caught:', error?.message);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default class SafeVideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      isLoaded: false,
    };
    this.videoRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.isActive) {
      initAudioMode().catch(() => {});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.videoRef.current) {
      if (prevProps.isPlaying !== this.props.isPlaying || prevProps.isActive !== this.props.isActive) {
        if (this.props.isActive && this.props.isPlaying) {
          this.videoRef.current.playAsync?.().catch(() => {});
        } else {
          this.videoRef.current.pauseAsync?.().catch(() => {});
        }
      }
      if (prevProps.isMuted !== this.props.isMuted) {
        this.videoRef.current.setIsMutedAsync?.(this.props.isMuted).catch(() => {});
      }
    }
  }

  render() {
    const {
      videoUri,
      coverUri,
      isActive = true,
      isPlaying = true,
      isMuted = false,
      style,
      resizeMode = ResizeMode.COVER,
    } = this.props;

    const streamableVideoUri = normalizeMediaUrl(videoUri, 'video');
    const effectiveCoverUri = coverUri || (streamableVideoUri?.includes('cloudinary.com') ? getCloudinaryThumbnail(streamableVideoUri) : null);

    if (!ExpoVideo || this.state.hasError || !streamableVideoUri) {
      return (
        <Image
          source={{ uri: effectiveCoverUri || coverUri }}
          style={style || styles.defaultStyle}
          resizeMode="cover"
        />
      );
    }

    return (
      <VideoErrorBoundary
        fallback={
          <Image
            source={{ uri: effectiveCoverUri || coverUri }}
            style={style || styles.defaultStyle}
            resizeMode="cover"
          />
        }
        onError={() => this.setState({ hasError: true })}
      >
        <ExpoVideo
          ref={this.videoRef}
          source={{ uri: streamableVideoUri }}
          posterSource={{ uri: effectiveCoverUri }}
          usePoster={true}
          posterStyle={style || styles.defaultStyle}
          resizeMode={resizeMode}
          shouldPlay={isActive && isPlaying}
          isLooping
          isMuted={isMuted}
          style={style || StyleSheet.absoluteFillObject}
          onLoad={() => {
            this.setState({ isLoaded: true });
            if (this.props.isActive && this.props.isPlaying) {
              this.videoRef.current?.playAsync?.().catch(() => {});
            }
          }}
          onError={(err) => {
            console.log('[SafeVideoPlayer] Video playback error:', err);
            this.setState({ hasError: true });
          }}
        />
      </VideoErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  defaultStyle: {
    width: '100%',
    height: '100%',
  },
});
