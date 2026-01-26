import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Lesson } from '@/services/courseService';

// Extend Lesson type with UI-specific fields
// UI-specific lesson shape: keep Lesson fields but override 'duration' to be a display string
type LessonWithUI = Omit<Partial<Lesson>, 'duration'> & {
  title: string;
  duration?: string; // formatted duration for display (e.g. '05:32')
  isLocked?: boolean;
};

// Define the type for the section
interface Section {
  id: string;
  title: string;
  lessons: LessonWithUI[];
  quizzes?: {
    id: number;
    title: string;
    description: string;
    is_mandatory?: boolean;
    created_at: string;
    updated_at: string;
  }[];
}

interface LessonAccordionItemProps {
  section: Section;
  index: number;
  onLessonClick?: (lesson: LessonWithUI) => void;
  // id of the currently selected/playing lesson so we can highlight it
  currentLessonId?: string | number | null;
  completedLessons?: number[];
}

const LessonAccordionItem: React.FC<LessonAccordionItemProps> = ({
  section,
  index,
  onLessonClick,
  currentLessonId,
  completedLessons = [],
}) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // If there's a currentLessonId, expand only the section that contains it.
    // Otherwise default to expanding the first section.
    if (currentLessonId != null) {
      const found = section.lessons.find(l => String(l.id) === String(currentLessonId));
      setActive(Boolean(found));
    } else {
      setActive(index === 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, currentLessonId]);

  const handleLessonClick = (e: React.MouseEvent, lesson: LessonWithUI) => {
    if (lesson.isLocked) {
      e.preventDefault();
      return;
    }
    if (onLessonClick) {
      e.preventDefault();
      onLessonClick(lesson);
    }
  };

  return (
    <>
      <div className={`accordion-item ${active ? 'active' : ''}`}>
        <h2 className="accordion-header" id={`heading${section.id}`}>
          <button
            className={`accordion-button ${active ? '' : 'collapsed'}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse${section.id}`}
            aria-expanded={active ? 'true' : 'false'}
            aria-controls={`collapse${section.id}`}
          >
            <span>Q.</span> {section.title}
          </button>
        </h2>
        <div
          id={`collapse${section.id}`}
          className={`accordion-collapse collapse ${active ? 'show' : ''}`}
          aria-labelledby={`heading${section.id}`}
          data-bs-parent="#accordionExample"
        >
          <div className="accordion-body">
            {section.lessons.map((lesson, idx) => {
              const isActive = currentLessonId && String(lesson.id) === String(currentLessonId);
              const isTextLesson = (lesson as any)?.content_type === 'text';
              return (
                <Link
                  href="#"
                  key={idx}
                  className={`bd-course-curriculum-content d-flex-between ${lesson.isLocked ? 'locked' : ''} ${isActive ? 'active' : ''}`}
                  onClick={e => handleLessonClick(e, lesson)}
                >
                  <div className="bd-course-curriculum-info d-flex-items gap-10">
                    <div className="icon">
                      <i className={`fa-solid ${isTextLesson ? 'fa-file-alt' : 'fa-video'}`}></i>
                    </div>
                    <p
                      className="title"
                      style={{
                        fontWeight: isActive ? 600 : undefined,
                        color: isActive ? '#28a745' : undefined,
                      }}
                    >
                      {lesson.title}
                    </p>
                  </div>
                  <div className="bd-course-curriculum-meta d-flex-items gap-10">
                    <span className="duration">{lesson.duration}</span>
                    <span className="status">
                      {completedLessons.includes(lesson.id as number) ? (
                        <i className="fa-solid fa-check-circle" style={{ color: '#28a745' }}></i>
                      ) : (
                        <i className={`fa-solid ${lesson.isLocked ? 'fa-lock' : 'fa-play'}`}></i>
                      )}
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* Display Quizzes if available */}
            {section.quizzes && section.quizzes.length > 0 && (
              <div
                className="quizzes-section"
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '2px solid #f0f0f0',
                }}
              >
                {section.quizzes.map((quiz, idx) => (
                  <Link
                    href={`/quizzes/attempt/${quiz.id}`}
                    key={`quiz-${idx}`}
                    className="bd-course-curriculum-content d-flex-between"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      padding: '14px 15px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      backgroundColor: '#fafbfd',
                      border: '1.5px solid #e8eef5',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const element = e.currentTarget;
                      element.style.backgroundColor = '#f0f8f5';
                      element.style.borderColor = '#07a169';
                      element.style.boxShadow = '0 4px 12px rgba(7, 161, 105, 0.1)';
                      element.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      const element = e.currentTarget;
                      element.style.backgroundColor = '#fafbfd';
                      element.style.borderColor = '#e8eef5';
                      element.style.boxShadow = 'none';
                      element.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="bd-course-curriculum-info d-flex-items gap-10">
                      <div
                        className="icon"
                        style={{
                          color: '#07a169',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          backgroundColor: 'rgba(7, 161, 105, 0.1)',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa-solid fa-file-lines"></i>
                      </div>
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          <p
                            className="title"
                            style={{
                              color: '#333',
                              fontWeight: 600,
                              fontSize: '14px',
                              margin: '0',
                            }}
                          >
                            {quiz.title}
                          </p>
                          {quiz.is_mandatory && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                backgroundColor: '#ffe8e8',
                                color: '#d32f2f',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                              title="Bài kiểm tra này là bắt buộc. Bạn phải hoàn thành để tiếp tục."
                            >
                              <i className="fa-solid fa-asterisk" style={{ fontSize: '9px' }}></i>
                              Bắt buộc
                            </span>
                          )}
                        </div>
                        {quiz.description && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: '#888',
                              margin: '0',
                              lineHeight: '1.4',
                            }}
                          >
                            {quiz.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="bd-course-curriculum-meta d-flex-items gap-10">
                      <span
                        className="status"
                        style={{
                          color: '#07a169',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        <i className="fa-solid fa-arrow-right"></i>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonAccordionItem;
