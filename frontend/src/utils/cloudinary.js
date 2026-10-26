const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'gphexfmz';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'myprofile_reels';

/**
 * Optimizes a Cloudinary video URL for Instagram-style fast streaming:
 * Applies dynamic auto-format and auto-quality (q_auto, f_auto).
 */
export function optimizeCloudinaryVideoUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  if (url.includes('/q_auto')) return url;
  return url.replace('/video/upload/', '/video/upload/q_auto,f_auto/');
}

/**
 * Generates an instant first-frame poster thumbnail from a Cloudinary video URL:
 * Converts video extension to .jpg and specifies start-offset 0 with web-friendly dimensions.
 */
export function getCloudinaryThumbnail(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  const jpgUrl = url.replace(/\.(mp4|mov|webm|mkv|m4v)($|\?)/i, '.jpg$2');
  if (jpgUrl.includes('/so_0')) return jpgUrl;
  return jpgUrl.replace(
    /\/video\/upload\/(?:q_auto,f_auto\/)?/,
    '/video/upload/so_0,q_auto,f_auto,w_720/'
  );
}

/**
 * Direct client-side file upload to Cloudinary CDN with live percentage progress tracking.
 *
 * @param {File} file - Browser File object (video/mp4, image/jpeg, etc.)
 * @param {Function} onProgress - Callback (progressPercent: number) => void
 * @returns {Promise<Object>} Upload metadata including optimized stream URL and thumbnail
 */
export function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected'));
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const rawUrl = response.secure_url;
          const detectedType = (response.resource_type === 'video' || isVideo) ? 'video' : 'image';
          const optimizedUrl = detectedType === 'video' ? optimizeCloudinaryVideoUrl(rawUrl) : rawUrl;
          const thumbnailUrl = detectedType === 'video' ? getCloudinaryThumbnail(rawUrl) : rawUrl;
          const duration = response.duration ? Math.min(60, Math.round(response.duration)) : 15;

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
      reject(new Error('Network error uploading file to Cloudinary. Check connection.'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'reels');

    xhr.send(formData);
  });
}
