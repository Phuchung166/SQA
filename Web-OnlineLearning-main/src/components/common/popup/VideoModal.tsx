import React from 'react';

interface IProps {
  isOpen: boolean;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'mp4';
  onClose: () => void;
}

const VideoModal: React.FC<IProps> = ({ isOpen, videoUrl, videoType, onClose }) => {
  if (!isOpen) return null;

  const renderVideoPlayer = () => {
    const centerStyle = {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-50%)',
      zIndex: 1000,
    };

    if (videoType === 'mp4') {
      return (
        <video
          src={videoUrl}
          controls
          autoPlay
          className="video-player"
          style={{
            ...centerStyle,
            width: '80%',
            maxWidth: '800px',
            height: 'auto',
            maxHeight: '80vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else {
      // YouTube and Vimeo use iframe - let existing CSS handle centering
      return (
        <iframe
          src={videoUrl}
          frameBorder="0"
          allowFullScreen
          className="video-iframe"
          onClick={e => e.stopPropagation()}
        />
      );
    }
  };

  return (
    <div id="video-overlay" className="video-overlay open" onClick={onClose}>
      {renderVideoPlayer()}
    </div>
  );
};

export default VideoModal;
