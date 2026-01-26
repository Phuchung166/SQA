'use client';
import React from 'react';
import { InstructorDetailProfile } from '@/services/userService';

// Define an interface for the progress item
interface ProgressItem {
  title: string;
  percentage: number;
  bgClass: string; // CSS class for background color
}

// Array of progress items - default if no instructor data
const defaultProgressData: ProgressItem[] = [
  { title: 'Python', percentage: 95, bgClass: 'bg-1' },
  { title: 'Machine Learning', percentage: 90, bgClass: 'bg-2' },
  { title: 'Data Analysis', percentage: 85, bgClass: 'bg-3' },
  { title: 'SQL', percentage: 88, bgClass: 'bg-4' },
  { title: 'Artificial Intelligence', percentage: 80, bgClass: 'bg-5' },
];

interface InstructorProgressProps {
  instructor?: InstructorDetailProfile | null;
}

const InstructorProgress: React.FC<InstructorProgressProps> = ({ instructor }) => {
  // Parse expertise string if available (assuming comma-separated skills)
  const skills = instructor?.expertise
    ? instructor.expertise.split(',').map((skill, index) => ({
        title: skill.trim(),
        percentage: 80 + Math.random() * 20, // Random percentage 80-100
        bgClass: `bg-${(index % 5) + 1}`,
      }))
    : defaultProgressData;

  return (
    <div className="bd-instructor-progress">
      <div className="progress-wrapper">
        {skills.map((item, index) => (
          <div className="progress-item" key={index}>
            <div className="d-flex justify-content-between">
              <span className="title">{item.title}</span>
              <span className="title">{item.percentage.toFixed(0)}%</span>
            </div>
            <div className="progress">
              <div
                className={`progress-bar progress-bar-striped ${item.bgClass}`}
                role="progressbar"
                style={{ width: `${item.percentage}%` }}
                aria-valuenow={Math.round(item.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorProgress;
