'use client';
import { useVideoModal } from '@/contextApi/VideoProvider';
import VideoModal from './VideoModal';

export default function GlobalVideoModal() {
  const { isVideoOpen, videoUrl, videoType, closeVideo } = useVideoModal();

  return (
    <VideoModal
      isOpen={isVideoOpen}
      videoUrl={videoUrl}
      videoType={videoType}
      onClose={closeVideo}
    />
  );
}
