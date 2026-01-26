'use client';
import { Empty } from 'antd';
import { useTranslations } from 'next-intl';
import { Course } from '@/services/courseService';

interface RemovedCoursesBoxProps {
  removedCourses: Course[];
  onRestoreCourse: (courseCode: string) => void;
}

const RemovedCoursesBox = ({ removedCourses, onRestoreCourse }: RemovedCoursesBoxProps) => {
  const t = useTranslations('CreateGroupCourse');

  if (removedCourses.length === 0) {
    return null;
  }

  return (
    <div
      onDragOver={e => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
      }}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        padding: '16px',
        border: '2px dashed #1890ff',
        borderRadius: '6px',
        backgroundColor: '#f0f5ff',
        minHeight: '100px',
        transition: 'all 0.2s',
        marginTop: '16px',
      }}
    >
      <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
        {t('courseSelection.removedCourses', { count: removedCourses.length })}
      </label>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginBottom: '12px' }}>
        {t('courseSelection.dragToRestore')}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {removedCourses.map((course: Course) => (
          <div
            key={course.code || course.id}
            draggable
            onDragStart={e => {
              e.dataTransfer!.effectAllowed = 'move';
              e.dataTransfer!.setData('removedCourseCode', String(course.code || course.id));
            }}
            style={{
              padding: '12px',
              border: '1px solid #1890ff',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'move',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 2px 8px rgba(24, 144, 255, 0.2)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: '14px' }}>{course.title}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {course.code} {course.currency && `- ${course.currency}`}
              </div>
              {course.category && (
                <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                  {course.category.name}
                </div>
              )}
            </div>
            <button
              onClick={() => onRestoreCourse(String(course.code || course.id))}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#0050b3';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#1890ff';
              }}
            >
              {t('courseSelection.restoreButton')}
            </button>
          </div>
        ))}
      </div>

      {removedCourses.length === 0 && (
        <Empty description={t('courseSelection.noRemovedCourses')} style={{ margin: 0 }} />
      )}
    </div>
  );
};

export default RemovedCoursesBox;
