'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoContextType {
  isVideoOpen: boolean;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'mp4';
  playVideo: (videoId: string, platform?: 'youtube' | 'vimeo' | 'mp4') => void;
  closeVideo: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'mp4'>('youtube');

  // Helper function to detect video type from URL
  const detectVideoType = (url: string): 'youtube' | 'vimeo' | 'mp4' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.includes('.mp4') || url.includes('cloudfront.net')) {
      return 'mp4';
    }
    return 'mp4'; // Default to mp4 for direct video URLs
  };

  // Extract video ID from different URL formats
  const extractVideoId = (url: string, platform: 'youtube' | 'vimeo' | 'mp4'): string => {
    if (platform === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : url;
    } else if (platform === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : url;
    }
    return url; // For MP4, return the full URL
  };

  const playVideo = (videoIdOrUrl: string, platform?: 'youtube' | 'vimeo' | 'mp4') => {
    let detectedType: 'youtube' | 'vimeo' | 'mp4';
    let finalUrl: string;

    if (platform) {
      detectedType = platform;
    } else {
      detectedType = detectVideoType(videoIdOrUrl);
    }

    if (detectedType === 'youtube') {
      const videoId = extractVideoId(videoIdOrUrl, 'youtube');
      finalUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (detectedType === 'vimeo') {
      const videoId = extractVideoId(videoIdOrUrl, 'vimeo');
      finalUrl = `https://player.vimeo.com/video/${videoId}`;
    } else {
      // For MP4 videos, use the URL directly
      finalUrl = videoIdOrUrl;
    }

    setVideoType(detectedType);
    setVideoUrl(finalUrl);
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
    setVideoUrl('');
  };

  return (
    <VideoContext.Provider value={{ isVideoOpen, videoUrl, videoType, playVideo, closeVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoModal = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoModal must be used within a VideoProvider');
  }
  return context;
};
