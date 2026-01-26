/**
 * Share utilities for social media sharing
 */

export type SharePlatform = 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy';

export interface ShareConfig {
  url: string;
  title: string;
  text?: string;
  onSuccess?: () => void;
}

/**
 * Generate social media share links
 * @param platform - The platform to share to
 * @param config - Share configuration with url and title
 * @returns The share URL or performs copy action
 */
export const getShareLink = (platform: SharePlatform, config: ShareConfig): string | null => {
  const { url, title } = config;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    case 'copy':
      // Handle copy separately in the calling code
      return null;
    default:
      return null;
  }
};

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Open share link in new window
 * @param url - The URL to open
 * @param windowName - Window name (default: 'share')
 * @param width - Window width (default: 600)
 * @param height - Window height (default: 400)
 */
export const openShareWindow = (
  url: string,
  windowName: string = 'share',
  width: number = 600,
  height: number = 400,
): void => {
  if (url) {
    window.open(url, windowName, `width=${width},height=${height}`);
  }
};

/**
 * Handle sharing to a specific platform
 * @param platform - The platform to share to
 * @param config - Share configuration
 * @param notificationCallback - Optional callback for notifications
 */
export const handleShare = async (
  platform: SharePlatform,
  config: ShareConfig,
  notificationCallback?: (type: 'success' | 'error', message: string) => void,
): Promise<void> => {
  const { url, onSuccess } = config;

  if (platform === 'copy') {
    const copied = await copyToClipboard(url);
    if (copied) {
      if (notificationCallback) {
        notificationCallback('success', 'Link copied to clipboard');
      }
      if (onSuccess) {
        onSuccess();
      }
    } else {
      if (notificationCallback) {
        notificationCallback('error', 'Failed to copy link');
      }
    }
    return;
  }

  const shareLink = getShareLink(platform, config);
  if (shareLink) {
    openShareWindow(shareLink);
    if (onSuccess) {
      onSuccess();
    }
  }
};

/**
 * Get course detail URL
 * @param courseId - The course ID
 * @param courseType - The course type (e.g., 'program', 'specialization', or undefined for regular course)
 * @returns Full URL to course details
 */
export const getCourseShareUrl = (courseId: number, courseType?: string | null): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const type = typeof courseType === 'string' ? courseType.toLowerCase() : null;

  if (type === 'program' || type === 'specialization') {
    return `${baseUrl}/course-program/${courseId}`;
  }

  return `${baseUrl}/course-details/${courseId}`;
};
