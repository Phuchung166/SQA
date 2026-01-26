'use client';
import React from 'react';
import { Progress } from 'antd';

interface ProgressBarProps {
  progress: number; // Progress percentage (0-100)
  showPercentage?: boolean;
  strokeColor?: string;
  format?: (percent?: number) => React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showPercentage = true,
  strokeColor = '#0d6efd',
  format,
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div style={{ marginBottom: '15px' }}>
      <Progress
        percent={clampedProgress}
        strokeColor={strokeColor}
        format={
          format
            ? format
            : showPercentage
              ? percent => `${Math.round((percent || 0) * 100) / 100}%`
              : () => null
        }
        status={clampedProgress === 100 ? 'success' : 'active'}
        size="small"
      />
    </div>
  );
};

export default ProgressBar;
