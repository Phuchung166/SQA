'use client';

import { useEffect, useState } from 'react';
// Link intentionally not used here
import { useTranslations } from 'next-intl';
import CourseReviewForm from '@/form/CourseReviewForm';
import { Modal } from 'antd';
import LessonReviewsList from './LessonReviewsList';
import StudentFeedback from '@/components/courses-inner-pages/course-details/StudentFeedback';

type LessonTabSectionProps = {
  currentLesson?: any;
  courseId?: number;
  completedLessons?: number[];
  markLessonComplete?: (id: number) => void;
};

const LessonTabSection = ({
  currentLesson,
  courseId,
  completedLessons = [],
  markLessonComplete,
}: LessonTabSectionProps) => {
  const [activeTab, setActiveTab] = useState('pills-homeTwo');
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [rating, setRating] = useState(5);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const t = useTranslations('CourseLesson');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    // Ensure window.bootstrap is available (only on browser)
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const tabElement = document.querySelector('#pills-tabTwo');
      if (tabElement) {
        const tabs = new (window as any).bootstrap.Tab(tabElement);
        tabs.show();
      }
    }
  }, []);

  return (
    <>
      <div className="tab-style-two">
        <ul className="nav nav-pills" id="pills-tabTwo" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'pills-homeTwo' ? 'active' : ''}`}
              id="pills-homeTwo-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-homeTwo"
              type="button"
              role="tab"
              aria-controls="pills-homeTwo"
              aria-selected={activeTab === 'pills-homeTwo' ? 'true' : 'false'}
              onClick={() => handleTabChange('pills-homeTwo')}
            >
              {t('aboutLesson')}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'pills-profileTwo' ? 'active' : ''}`}
              id="pills-profileTwo-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-profileTwo"
              type="button"
              role="tab"
              aria-controls="pills-profileTwo"
              aria-selected={activeTab === 'pills-profileTwo' ? 'true' : 'false'}
              onClick={() => handleTabChange('pills-profileTwo')}
            >
              {t('lessonResource')}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'pills-reviewsTwo' ? 'active' : ''}`}
              id="pills-reviewsTwo-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-reviewsTwo"
              type="button"
              role="tab"
              aria-controls="pills-reviewsTwo"
              aria-selected={activeTab === 'pills-reviewsTwo' ? 'true' : 'false'}
              onClick={() => handleTabChange('pills-reviewsTwo')}
            >
              {t('reviews') || 'Đánh giá'}
            </button>
          </li>
        </ul>
        <div className="tab-content" id="pills-tabTwoContent">
          <div
            className={`tab-pane fade ${activeTab === 'pills-homeTwo' ? 'show active' : ''}`}
            id="pills-homeTwo"
            role="tabpanel"
            aria-labelledby="pills-homeTwo-tab"
            tabIndex={0}
          >
            {currentLesson ? (
              <div>
                {currentLesson.description ? (
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.description }} />
                ) : (
                  <div>{t('aboutLessonContent')}</div>
                )}

                {/* Render content field below description if present */}
                {currentLesson.content && (
                  <div style={{ marginTop: 12 }}>
                    <h4 style={{ marginBottom: 8 }}>{t('lessonContent') || 'Nội dung bài học'}</h4>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>{t('aboutLessonContent')}</div>
            )}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'pills-profileTwo' ? 'show active' : ''}`}
            id="pills-profileTwo"
            role="tabpanel"
            aria-labelledby="pills-profileTwo-tab"
            tabIndex={0}
          >
            {currentLesson ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  {currentLesson.document_url || currentLesson.documentUrl ? (
                    <a
                      href={currentLesson.document_url || currentLesson.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bd-lesson-materials"
                    >
                      <i className="fa-sharp fa-solid fa-file-zip"></i>
                      {t('downloadMaterials')}
                    </a>
                  ) : (
                    <div style={{ color: '#888' }}>
                      {t('noResources') || 'Không có tài nguyên đính kèm'}
                    </div>
                  )}
                </div>

                {currentLesson.content && (
                  <div style={{ marginTop: 10, background: '#fff', padding: 10, borderRadius: 6 }}>
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </div>
                )}

                {markLessonComplete && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => markLessonComplete(currentLesson.id)}
                      disabled={completedLessons?.includes(currentLesson.id)}
                      style={{
                        background: completedLessons?.includes(currentLesson.id)
                          ? '#e9ecef'
                          : '#07a169',
                        color: completedLessons?.includes(currentLesson.id) ? '#666' : '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: 18,
                        cursor: 'pointer',
                      }}
                    >
                      {completedLessons?.includes(currentLesson.id)
                        ? t('marked') || 'Đã học'
                        : t('markAsLearned') || 'Đánh dấu là đã học'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#888' }}>{t('selectLessonPrompt')}</div>
            )}
          </div>
          <div
            className={`tab-pane fade ${activeTab === 'pills-reviewsTwo' ? 'show active' : ''}`}
            id="pills-reviewsTwo"
            role="tabpanel"
            aria-labelledby="pills-reviewsTwo-tab"
            tabIndex={0}
          >
            <div style={{ paddingTop: 20 }}>
              {!courseId ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
                  {t('noCourseSelected') || 'Vui lòng chọn khóa học để xem đánh giá'}
                </div>
              ) : (
                <>
                  {/* Reviews header with filter and write review button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 30,
                      flexWrap: 'wrap',
                      gap: '15px',
                    }}
                  >
                    {/* Rating filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {t('filterByRating') || 'Lọc theo sao'}:
                      </span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => setFilterRating(null)}
                          style={{
                            background: filterRating === null ? '#07a169' : '#e9ecef',
                            color: filterRating === null ? '#fff' : '#333',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                          }}
                        >
                          Tất cả
                        </button>
                        {[5, 4, 3, 2, 1].map(star => (
                          <button
                            key={star}
                            onClick={() => setFilterRating(star)}
                            style={{
                              background: filterRating === star ? '#ffc107' : '#f5f5f5',
                              color: filterRating === star ? '#fff' : '#333',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s',
                            }}
                          >
                            {star} <i className="fas fa-star" style={{ marginLeft: '3px' }}></i>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Write review button */}
                    <button
                      onClick={() => {
                        setIsReviewModalOpen(true);
                        setFormRating(5);
                      }}
                      style={{
                        background: '#07a169',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                      }}
                    >
                      <i className="fas fa-star" style={{ marginRight: '5px' }}></i>
                      {t('writeReview') || 'Viết đánh giá'}
                    </button>
                  </div>

                  {/* Existing reviews section */}
                  <div data-reviews-section>
                    {/* Student Feedback Statistics */}
                    <div style={{ marginBottom: '40px' }}>
                      <StudentFeedback courseId={courseId} />
                    </div>

                    {/* Reviews List */}
                    <LessonReviewsList
                      courseId={courseId}
                      filterRating={filterRating}
                      refreshKey={refreshReviews}
                    />
                  </div>

                  {/* Review form modal */}
                  <Modal
                    title={
                      <span style={{ fontSize: '18px', fontWeight: '600' }}>
                        {t('writeReview') || 'Viết đánh giá'}
                      </span>
                    }
                    open={isReviewModalOpen}
                    onCancel={() => setIsReviewModalOpen(false)}
                    footer={null}
                    width={600}
                    centered
                  >
                    <div style={{ paddingTop: '20px' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ marginBottom: '10px', fontWeight: '500' }}>
                          {t('reviewDisclaimer') || 'Đánh giá của bạn'}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            marginBottom: 15,
                          }}
                        >
                          {[0, 1, 2, 3, 4].map(index => (
                            <i
                              key={index}
                              className={`fa ${index < formRating ? 'fas fa-star' : 'far fa-star'}`}
                              onClick={() => setFormRating(index + 1)}
                              style={{
                                cursor: 'pointer',
                                color: index < formRating ? '#ffc107' : '#ccc',
                                fontSize: '24px',
                                transition: 'color 0.2s ease, transform 0.2s ease',
                                transform: index < formRating ? 'scale(1.1)' : 'scale(1)',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.color = '#ffc107';
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.color =
                                  index < formRating ? '#ffc107' : '#ccc';
                                (e.currentTarget as HTMLElement).style.transform =
                                  index < formRating ? 'scale(1.1)' : 'scale(1)';
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={`Rate ${index + 1} stars`}
                            ></i>
                          ))}
                          <span style={{ marginLeft: 10, color: '#666', fontSize: '14px' }}>
                            {formRating} / 5 {t('stars') || 'stars'}
                          </span>
                        </div>
                      </div>

                      <CourseReviewForm
                        courseId={courseId}
                        rating={formRating}
                        onReviewSubmitted={() => {
                          setIsReviewModalOpen(false);
                          setFormRating(5);
                          setFilterRating(null);
                          setRefreshReviews(prev => prev + 1);
                        }}
                      />
                    </div>
                  </Modal>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonTabSection;
