import { Platform } from 'react-native';
import { getCloudinaryThumbnail, normalizeMediaUrl } from '../utils/media';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'gphexfmz';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'myprofile_reels';

/**
 * Uploads a local file (video or image) from mobile device to Cloudinary
 * with real-time percentage progress updates.
 *
 * @param {Object} fileAsset - { uri, type, fileName, mimeType, duration }
 * @param {Function} onProgress - Callback (progressPercent: number) => void
 * @returns {Promise<Object>} Upload result with optimized URLs
 */
export const uploadToCloudinary = (fileAsset, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!fileAsset || !fileAsset.uri) {
      return reject(new Error('No media file selected'));
    }

    const isVideo = fileAsset.type === 'video' || (fileAsset.mimeType && fileAsset.mimeType.startsWith('video/'));
    const isImage = fileAsset.type === 'image' || (fileAsset.mimeType && fileAsset.mimeType.startsWith('image/'));

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const rawUrl = response.secure_url;
          const detectedType = (response.resource_type === 'video' || isVideo) ? 'video' : 'image';
          const optimizedUrl = normalizeMediaUrl(rawUrl, detectedType);
          const thumbnailUrl = detectedType === 'video'
            ? getCloudinaryThumbnail(rawUrl)
            : rawUrl;
          const duration = response.duration
            ? Math.min(60, Math.round(response.duration))
            : (fileAsset.duration ? Math.min(60, Math.round(fileAsset.duration / 1000)) : 15);

          resolve({
            success: true,
            rawUrl,
            url: optimizedUrl,
            thumbnailUrl,
            mediaType: detectedType,
            duration,
            publicId: response.public_id,
            format: response.format,
          });
        } catch (parseErr) {
          reject(new Error('Failed to parse Cloudinary response: ' + parseErr.message));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Upload failed with status ${xhr.status}`));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Cloudinary. Please check your connection.'));
    };

    const formData = new FormData();
    const fileExt = fileAsset.uri.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const fileName = fileAsset.fileName || `reel_${Date.now()}.${fileExt}`;
    const mimeType = fileAsset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');

    const sendRequest = (filePayload) => {
      formData.append('file', filePayload);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'reels');
      xhr.send(formData);
    };

    if (Platform.OS === 'web') {
      if (fileAsset.file) {
        sendRequest(fileAsset.file);
      } else {
        fetch(fileAsset.uri)
          .then((res) => res.blob())
          .then((blob) => {
            sendRequest(blob);
          })
          .catch(() => {
            sendRequest({
              uri: fileAsset.uri,
              type: mimeType,
              name: fileName,
            });
          });
      }
    } else {
      sendRequest({
        uri: fileAsset.uri,
        type: mimeType,
        name: fileName,
      });
    }
  });
};
