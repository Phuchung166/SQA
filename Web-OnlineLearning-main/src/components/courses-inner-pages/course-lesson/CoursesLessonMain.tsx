'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import LogoImg from '../../../../public/assets/images/logo/logo.svg';
import Image from 'next/image';
import LessonTabSection from './LessonTabSection';
import LessonAccordionItem from './LessonAccordionItem';
import courseContentData from '@/data/header-menu/course-content-data';
import { Tab } from 'bootstrap';
import Link from 'next/link';
import {
  getCourseModules,
  CourseModule,
  Lesson,
  markLessonProgress,
  getCourseModulesByUser,
  getCourseProgress,
} from '@/services/courseService';
import { Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import ReactPlayer from 'react-player';
import { useRouter } from 'next/navigation';

interface CoursesLessonMainProps {
  courseId?: number;
  enrollmentId?: number;
}

const CoursesLessonMain: React.FC<CoursesLessonMainProps> = ({ courseId, enrollmentId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setIsCollapsed] = useState(false);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const router = useRouter();
  // UI-specific lesson shape: duration displayed as string (mm:ss)
  type LessonWithUI = Omit<Partial<Lesson>, 'duration'> & {
    title: string;
    duration?: string; // formatted duration for display
    isLocked?: boolean;
  };

  const [currentLesson, setCurrentLesson] = useState<LessonWithUI | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const playerRef = useRef<any>(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const notification = useNotification();
  const t = useTranslations('notification');
  const tLesson = useTranslations('CourseLesson');

  // Attach a <track> subtitle to the underlying HTML5 video element if possible
  const attachSubtitleTrack = () => {
    try {
      const subtitleUrl =
        (currentLesson as any)?.subtitle_url || (currentLesson as any)?.subtitleUrl;
      if (!subtitleUrl) return;
      const player = playerRef.current;
      if (!player || !player.getInternalPlayer) return;
      const internal = player.getInternalPlayer();
      // Only HTML5 <video> supports <track>
      if (internal && (internal as HTMLVideoElement).tagName === 'VIDEO') {
        const videoEl = internal as HTMLVideoElement;
        // remove previous injected tracks
        Array.from(videoEl.querySelectorAll('track[data-injected="true"]')).forEach(t =>
          t.remove(),
        );
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = 'CC';
        track.src = subtitleUrl;
        track.srclang = 'en';
        track.setAttribute('data-injected', 'true');
        videoEl.appendChild(track);
        // try to set mode after appended
        const _tk: any = track;
        if (_tk.track) _tk.track.mode = subtitleEnabled ? 'showing' : 'hidden';
      }
    } catch {
      // swallow errors — fallback is no subtitles
    }
  };

  // Update subtitle track visibility when toggled or when lesson changes
  useEffect(() => {
    attachSubtitleTrack();
    // also try to update existing track mode
    try {
      const player = playerRef.current;
      if (!player || !player.getInternalPlayer) return;
      const internal = player.getInternalPlayer();
      if (internal && (internal as HTMLVideoElement).tagName === 'VIDEO') {
        const videoEl = internal as HTMLVideoElement;
        const injected = Array.from(
          videoEl.querySelectorAll('track[data-injected="true"]'),
        ) as HTMLTrackElement[];
        injected.forEach(t => {
          const _t: any = t;
          if (_t.track) _t.track.mode = subtitleEnabled ? 'showing' : 'hidden';
        });
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitleEnabled, currentLesson]);

  // Load completed lessons from API response or getCourseProgress on mount
  useEffect(() => {
    try {
      if (!courseModules.length) return;

      // First, try to get completed lessons from API response (is_completed field)
      const completedFromAPI: number[] = [];
      courseModules.forEach(m => {
        if (Array.isArray(m.lessons)) {
          m.lessons.forEach(lesson => {
            if (lesson.is_completed) {
              completedFromAPI.push(lesson.id);
            }
          });
        }
      });

      // If we have enrollmentId, fetch course progress from API (only once on mount)
      if (enrollmentId && courseId && completedFromAPI.length === 0) {
        getCourseProgress(enrollmentId, courseId)
          .then(progress => {
            // API returns completed_lessons count, but we'll rely on is_completed field from modules
            // This is mainly for validation
            console.log('Course progress:', progress);
          })
          .catch(error => {
            console.error('Error fetching course progress:', error);
          });
      }

      setCompletedLessons(completedFromAPI);
    } catch {
      // ignore
    }
  }, [courseModules, enrollmentId, courseId]);

  // persist completed lessons
  const persistCompleted = (items: number[]) => {
    try {
      if (!courseId) return;
      // No longer persist to localStorage - rely on API is_completed field
    } catch {
      // ignore
    }
  };

  const markLessonComplete = (lessonId: number) => {
    if (!lessonId) return;

    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      const next = [...prev, lessonId];
      notification.success({ message: 'Đã đánh dấu là đã học' });

      // Call API to mark lesson progress if enrollmentId is available
      if (enrollmentId) {
        markLessonProgress({
          lesson_id: lessonId,
          enrollment_id: enrollmentId,
        }).catch(error => {
          console.error('Error marking lesson progress via API:', error);
          // Still show success in UI even if API fails
        });
      }

      return next;
    });
  };

  // Fetch course modules and lessons by course ID
  useEffect(() => {
    const fetchCourseModules = async () => {
      if (!courseId) {
        console.warn('No courseId provided');
        return;
      }

      console.log('Fetching modules for courseId:', courseId);
      setLoading(true);
      try {
        const response = await getCourseModulesByUser({
          page: 1,
          pageSize: 100,
          // courseId: courseId,
          courseId: courseId,
          enrollmentId: enrollmentId,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });

        // Modules already include lessons from the API response
        const modules = response.data || [];
        setCourseModules(modules);
        console.log('Course modules loaded (with lessons):', modules);
        console.log(
          'Total lessons:',
          modules.reduce(
            (acc: number, m: CourseModule) =>
              acc + (Array.isArray(m.lessons) ? m.lessons.length : 0),
            0,
          ),
        );
      } catch (error) {
        console.error('Error fetching course modules:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load course modules';
        notification.error({
          message: t('error') || 'Error',
          description:
            errorMessage || t('failedLoadCourseModules') || 'Failed to load course modules',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseModules();
  }, [courseId, notification, t]);

  useEffect(() => {
    // Initialize Bootstrap Tabs, checking if the element exists
    const tabElement = document.querySelector('#pills-tabTwo');
    if (tabElement) {
      new Tab(tabElement).show();
    }

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth <= 1199) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLessonClick = (lesson: LessonWithUI) => {
    console.log('Lesson clicked:', lesson);
    setCurrentLesson(lesson);
    // Close sidebar on mobile after selecting lesson
    if (typeof window !== 'undefined' && window.innerWidth <= 1199) {
      closeSidebar();
    }
  };

  // Flatten lessons into a single ordered list for prev/next navigation
  const flatLessons = useMemo(() => {
    const list: Array<any> = [];
    courseModules.forEach(m => {
      const lessons = Array.isArray(m.lessons) ? m.lessons : [];
      lessons.forEach(l => list.push({ ...l, moduleId: m.id }));
    });
    return list;
  }, [courseModules]);

  const findLessonIndex = (lesson: any) => {
    if (!lesson) return -1;
    return flatLessons.findIndex(l => String(l.id) === String((lesson as any).id));
  };

  const goToLessonAtIndex = (index: number) => {
    if (index < 0 || index >= flatLessons.length) {
      notification.info({ message: 'Không còn bài tiếp theo' });
      return;
    }
    const lesson = flatLessons[index];
    // set current and reset player state
    setCurrentLesson(prev => ({ ...(lesson as any), duration: prev?.duration }));
    // seek to start when switching
    try {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(0, 'seconds');
      }
    } catch {
      // ignore
    }
    setPlayedSeconds(0);
    setDurationSeconds(0);
    setIsPlaying(true);
  };

  const goToNextLesson = () => {
    if (!currentLesson) {
      notification.info({ message: 'Chọn một bài học để bắt đầu' });
      return;
    }
    const idx = findLessonIndex(currentLesson);
    const nextIdx = idx + 1;
    if (nextIdx >= flatLessons.length) {
      notification.info({ message: 'Bạn đã ở bài học cuối.' });
      return;
    }

    // Check requirement: if current or next is marked mandatory, show warning if not 70% watched
    const cur = currentLesson as any;
    const next = flatLessons[nextIdx] as any;

    // Determine if either current or next lesson is mandatory (supports several flag names)
    const isMandatory = (item: any) => {
      return Boolean(item && (item.is_required || item.isMandatory || item.required));
    };

    // compute watched percent for current lesson
    const total = durationSeconds || Number((cur && (cur.video_duration ?? cur.duration)) || 0);
    const watched = playedSeconds || 0;
    const pct = total > 0 ? watched / total : 0;

    // Show warning if mandatory but not 70% watched, but still allow navigation
    if (isMandatory(cur) && pct < 0.7) {
      notification.warning({
        message: 'Bạn chưa hoàn thành 70% bài học này. Hãy tiếp tục học để đạt yêu cầu.',
        duration: 3,
      });
    }

    // Allow navigation regardless of completion
    goToLessonAtIndex(nextIdx);
  };

  const goToPrevLesson = () => {
    if (!currentLesson) {
      notification.info({ message: 'Chọn một bài học để bắt đầu' });
      return;
    }
    const idx = findLessonIndex(currentLesson);
    const prevIdx = idx - 1;
    if (prevIdx < 0) {
      notification.info({ message: 'Bạn đang ở bài học đầu tiên.' });
      return;
    }
    goToLessonAtIndex(prevIdx);
  };

  const nextDisabled = useMemo(() => {
    if (!currentLesson) return true;
    // Allow moving to next lesson - never disable the button
    // Just check if there's a next lesson to show
    const idx = flatLessons.findIndex(l => String(l.id) === String((currentLesson as any).id));
    return idx >= flatLessons.length - 1; // Only disable if at the last lesson
  }, [currentLesson, flatLessons]);

  // Helper to format seconds into mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const h = Math.floor(seconds / 3600).toString();
    return h && Number(h) > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  return (
    <>
      {/* -- course lesson area start -- */}
      <section className="bd-lesson-area p-relative">
        <div className="bd-lesson-wrapper">
          <div className={`bd-lesson-content ${isSidebarOpen ? 'collapsed' : ''}`}>
            <div className="bd-lesson-logo">
              <Link href="/">
                <Image src={LogoImg} alt="logo" />
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="title" style={{ fontSize: 24, padding: '20px 30px' }}>
                {tLesson('courseContent')}
              </h2>
              <div style={{ fontSize: 14, color: '#444', paddingRight: 30 }}>
                {completedLessons.length}/{flatLessons.length} bài đã học
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <div className="accordion-common-style accordion-transparent">
                <div className="accordion" id="accordionExample">
                  {courseModules.length > 0
                    ? courseModules.map((module, index) => (
                        <LessonAccordionItem
                          key={module.id}
                          section={{
                            id: module.id.toString(),
                            title: module.title,
                            quizzes: module.quizzes,
                            lessons: (Array.isArray(module.lessons) ? module.lessons : []).map(
                              lesson => {
                                // lesson.duration stored in milliseconds; video_duration may be seconds
                                const raw = Number(
                                  lesson.duration ??
                                    (lesson.video_duration ? lesson.video_duration * 1000 : 0),
                                );
                                const secs = Math.floor(raw / 1000);
                                const mmss = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
                                return {
                                  ...lesson,
                                  duration: mmss,
                                  isLocked: false,
                                };
                              },
                            ),
                          }}
                          index={index}
                          onLessonClick={handleLessonClick}
                          currentLessonId={currentLesson?.id}
                          completedLessons={completedLessons}
                        />
                      ))
                    : courseContentData.map((section, index) => (
                        <LessonAccordionItem key={section.id} section={section} index={index} />
                      ))}
                </div>
                {/* Lesson resources moved into LessonTabSection */}
              </div>
            )}
          </div>
          <div
            className={`app-offcanvas-overlay ${isSidebarOpen ? 'overlay-open' : ''}`}
            onClick={closeSidebar}
          ></div>
          <div className={`bd-lesson-player ${isSidebarOpen ? 'collapsed' : ''}`}>
            <div className="bd-lesson-video-wrap">
              <div className="bd-lesson-video-title-wrap">
                <div className="bd-lesson-video-title-wrap-left">
                  <button type="button" onClick={toggleSidebar}>
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                  <span>{currentLesson?.title || tLesson('selectLesson')}</span>
                </div>
                <div className="bd-lesson-video-title-wrap-right">
                  <Link href="#" onClick={() => router.back()}>
                    <i className="fas fa-times"></i>
                  </Link>
                </div>
              </div>
              {(currentLesson as any)?.content_type === 'video' && currentLesson?.video_url ? (
                // Constrain the player to a fixed lesson frame so it doesn't overflow the page header
                <div
                  style={{ width: '100%', height: '600px', maxHeight: '60vh', overflow: 'hidden' }}
                >
                  {/* Fill the parent height so ReactPlayer controls remain visible */}
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <ReactPlayer
                      ref={playerRef}
                      url={currentLesson.video_url as string}
                      playing={isPlaying}
                      controls
                      width="100%"
                      height="100%"
                      style={{ position: 'absolute', top: 0, left: 0 }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onProgress={(state: {
                        played: number;
                        playedSeconds: number;
                        loaded: number;
                        loadedSeconds?: number;
                      }) => {
                        setPlayedSeconds(state.playedSeconds);
                        try {
                          const total =
                            durationSeconds ||
                            (currentLesson as any)?.video_duration ||
                            ((currentLesson as any)?.duration
                              ? (currentLesson as any).duration / 1000
                              : 0);
                          const pct = total > 0 ? state.playedSeconds / total : 0;
                          if (
                            pct >= 0.7 &&
                            currentLesson &&
                            !completedLessons.includes((currentLesson as any).id)
                          ) {
                            markLessonComplete((currentLesson as any).id);
                          }
                        } catch {
                          // ignore
                        }
                      }}
                      onDuration={(d: number) => setDurationSeconds(d)}
                      onReady={() => {
                        // attempt to attach subtitle track when player ready
                        attachSubtitleTrack();
                      }}
                      onEnded={() => setIsPlaying(false)}
                      config={{
                        file: {
                          attributes: {
                            controlsList: 'nodownload',
                          },
                        },
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 6,
                          background: '#e9ecef',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: durationSeconds
                              ? `${(playedSeconds / durationSeconds) * 100}%`
                              : '0%',
                            height: '100%',
                            background: '#0d6efd',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ minWidth: 90, textAlign: 'right', fontSize: 12, color: '#666' }}>
                      {formatTime(playedSeconds)} / {formatTime(durationSeconds)}
                    </div>
                    <div style={{ marginLeft: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      {/* Subtitle toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          setSubtitleEnabled(v => !v);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#333',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                        aria-pressed={subtitleEnabled}
                        title={subtitleEnabled ? 'Turn off subtitles' : 'Turn on subtitles'}
                      >
                        CC {subtitleEnabled ? 'On' : 'Off'}
                      </button>

                      {/* Mark as learned */}
                      <button
                        type="button"
                        onClick={() =>
                          currentLesson && markLessonComplete((currentLesson as any).id)
                        }
                        disabled={
                          !currentLesson || completedLessons.includes((currentLesson as any).id)
                        }
                        style={{
                          background: completedLessons.includes((currentLesson as any).id)
                            ? '#e9ecef'
                            : '#0d6efd',
                          color: completedLessons.includes((currentLesson as any).id)
                            ? '#666'
                            : '#fff',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 18,
                          cursor: 'pointer',
                        }}
                        title={
                          completedLessons.includes((currentLesson as any).id)
                            ? 'Đã đánh dấu'
                            : 'Đánh dấu là đã học'
                        }
                      >
                        {completedLessons.includes((currentLesson as any).id)
                          ? 'Đã học'
                          : 'Đánh dấu'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (currentLesson as any)?.content_type === 'text' && currentLesson?.content ? (
                <div
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    background: '#fff',
                    padding: '40px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '900px',
                      margin: '0 auto',
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: '#333',
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <button
                      type="button"
                      onClick={() => currentLesson && markLessonComplete((currentLesson as any).id)}
                      disabled={
                        !currentLesson || completedLessons.includes((currentLesson as any).id)
                      }
                      style={{
                        background: completedLessons.includes((currentLesson as any).id)
                          ? '#e9ecef'
                          : '#0d6efd',
                        color: completedLessons.includes((currentLesson as any).id)
                          ? '#666'
                          : '#fff',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: 20,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                      title={
                        completedLessons.includes((currentLesson as any).id)
                          ? 'Đã đánh dấu'
                          : 'Đánh dấu là đã học'
                      }
                    >
                      {completedLessons.includes((currentLesson as any).id)
                        ? 'Đã học'
                        : 'Đánh dấu là đã học'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    background: '#f5f5f5',
                    padding: '40px',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <i
                      className="fa-solid fa-book-open"
                      style={{ fontSize: '64px', color: '#ccc', marginBottom: '20px' }}
                    ></i>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
                      {currentLesson
                        ? tLesson('noContentAvailable')
                        : tLesson('selectLessonPrompt')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="bd-lesson-about">
              <div className="bd-lesson-next-prev-button">
                <button className="prev-button" onClick={goToPrevLesson} title="Previous lesson">
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <button
                  className="next-button"
                  title={
                    nextDisabled ? 'Bạn cần hoàn thành 70% bài học nếu là bắt buộc' : 'Next lesson'
                  }
                  onClick={goToNextLesson}
                  disabled={nextDisabled}
                  style={nextDisabled ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                >
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
              <LessonTabSection
                currentLesson={currentLesson}
                completedLessons={completedLessons}
                markLessonComplete={markLessonComplete}
                courseId={courseId}
              />
            </div>
          </div>
        </div>
      </section>
      {/* -- course lesson area end -- */}
    </>
  );
};

export default CoursesLessonMain;
