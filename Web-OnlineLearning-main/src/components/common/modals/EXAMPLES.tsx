/* eslint-disable */
// @ts-nocheck
/**
 * Example Usage of ConfirmModal
 *
 * This file demonstrates various ways to use the ConfirmModal component
 * DO NOT import this file - it's for documentation only
 */

import {
  showConfirmModal,
  showDangerConfirmModal,
  showDeleteConfirmModal,
} from '@/components/common/modals';
import { useNotification } from '@/hooks/useMessage';
import { useTranslations } from 'next-intl';
import { deleteCourse, archiveCourse, publishCourse } from '@/services/courseService';

// ============================================
// Example 1: Basic Confirmation
// ============================================
function BasicConfirmExample() {
  const handleAction = () => {
    showConfirmModal({
      title: 'Confirm Action',
      content: 'Are you sure you want to proceed with this action?',
      okText: 'Yes, Proceed',
      cancelText: 'Cancel',
      onOk: () => {
        console.log('User confirmed');
      },
      onCancel: () => {
        console.log('User cancelled');
      },
    });
  };

  return <button onClick={handleAction}>Show Confirmation</button>;
}

// ============================================
// Example 2: Danger/Destructive Action
// ============================================
function DangerConfirmExample() {
  const notification = useNotification();

  const handleDelete = (courseId: number) => {
    showDangerConfirmModal({
      title: 'Delete Course',
      content: 'This action cannot be undone. All course data will be permanently deleted.',
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCourse(courseId);
          notification.success({
            message: 'Success',
            description: 'Course deleted successfully',
          });
        } catch (error) {
          notification.error({
            message: 'Error',
            description: 'Failed to delete course',
          });
        }
      },
    });
  };

  return <button onClick={() => handleDelete(123)}>Delete Course</button>;
}

// ============================================
// Example 3: Simplified Delete Confirmation
// ============================================
function SimpleDeleteExample() {
  const notification = useNotification();

  const handleDelete = (courseId: number, courseName: string) => {
    showDeleteConfirmModal({
      itemName: courseName,
      itemType: 'Course',
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteCourse(courseId);
          notification.success({
            message: 'Success',
            description: 'Course deleted successfully',
          });
        } catch (error) {
          notification.error({
            message: 'Error',
            description: 'Failed to delete course',
          });
        }
      },
    });
  };

  return <button onClick={() => handleDelete(123, 'Introduction to React')}>Delete</button>;
}

// ============================================
// Example 4: With Translations (i18n)
// ============================================
function TranslatedConfirmExample() {
  const t = useTranslations('instructorDashboard');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  const handleDelete = (courseId: number, courseName: string) => {
    showDangerConfirmModal({
      title: t('deleteCourseTitle'), // "Delete Course"
      content: t('deleteCourseConfirm', { courseName }), // "Are you sure you want to delete "{courseName}"?"
      okText: t('confirmDelete'), // "Yes, Delete"
      cancelText: t('cancel'), // "Cancel"
      onOk: async () => {
        try {
          await deleteCourse(courseId);
          notification.success({
            message: tNotif('success'),
            description: t('deleteCourseSuccess'),
          });
        } catch (error) {
          notification.error({
            message: tNotif('error'),
            description: t('deleteCourseError'),
          });
        }
      },
    });
  };

  return <button onClick={() => handleDelete(123, 'React Course')}>Delete Course</button>;
}

// ============================================
// Example 5: Async Operation with Loading State
// ============================================
function AsyncConfirmExample() {
  const notification = useNotification();

  const handlePublish = async (courseId: number) => {
    showConfirmModal({
      title: 'Publish Course',
      content:
        'Are you ready to publish this course? Students will be able to enroll after publishing.',
      okText: 'Publish Now',
      cancelText: 'Not Yet',
      okType: 'primary',
      onOk: async () => {
        try {
          // Long async operation
          await publishCourse(courseId);
          await sendNotificationToStudents(courseId);

          notification.success({
            message: 'Published',
            description: 'Course published successfully and students notified',
          });
        } catch (error) {
          notification.error({
            message: 'Error',
            description: error.message || 'Failed to publish course',
          });
          throw error; // Re-throw to prevent modal from closing
        }
      },
    });
  };

  return <button onClick={() => handlePublish(123)}>Publish Course</button>;
}

// ============================================
// Example 6: Multiple Confirmations in Sequence
// ============================================
function SequentialConfirmExample() {
  const notification = useNotification();

  const handleArchiveWithWarning = (courseId: number) => {
    // First confirmation
    showConfirmModal({
      title: 'Archive Course?',
      content: 'Archived courses will be hidden from students but can be restored later.',
      okText: 'Archive',
      cancelText: 'Cancel',
      onOk: () => {
        // Second confirmation (more serious)
        showDangerConfirmModal({
          title: 'Final Confirmation',
          content: 'This will immediately hide the course from all enrolled students. Continue?',
          okText: 'Yes, Archive Now',
          cancelText: 'Cancel',
          onOk: async () => {
            try {
              await archiveCourse(courseId);
              notification.success({
                message: 'Archived',
                description: 'Course archived successfully',
              });
            } catch (error) {
              notification.error({
                message: 'Error',
                description: 'Failed to archive course',
              });
            }
          },
        });
      },
    });
  };

  return <button onClick={() => handleArchiveWithWarning(123)}>Archive Course</button>;
}

// ============================================
// Example 7: Custom Icon
// ============================================
function CustomIconExample() {
  const handleSpecialAction = () => {
    showConfirmModal({
      title: 'Special Action',
      content: 'This action requires special permissions.',
      okText: 'Proceed',
      cancelText: 'Cancel',
      icon: <i className="fa-solid fa-shield-check" style={{ color: '#1890ff' }} />,
      onOk: () => {
        console.log('Special action confirmed');
      },
    });
  };

  return <button onClick={handleSpecialAction}>Special Action</button>;
}

// ============================================
// Example 8: Wide Modal
// ============================================
function WideModalExample() {
  const handleShowDetails = () => {
    showConfirmModal({
      title: 'Course Details',
      content: (
        <div>
          <p>Course Name: Introduction to React</p>
          <p>Students: 150</p>
          <p>Rating: 4.8/5</p>
          <p>Last Updated: 2025-01-15</p>
          <br />
          <p>Are you sure you want to delete this popular course?</p>
        </div>
      ),
      okText: 'Delete',
      cancelText: 'Keep Course',
      okType: 'danger',
      width: 600,
      onOk: () => {
        console.log('Course deleted');
      },
    });
  };

  return <button onClick={handleShowDetails}>Delete with Details</button>;
}

// ============================================
// Example 9: No Cancel Button (Force Decision)
// ============================================
function ForcedDecisionExample() {
  const handleForceDecision = () => {
    showConfirmModal({
      title: 'Terms & Conditions',
      content: 'You must agree to the terms and conditions to continue.',
      okText: 'I Agree',
      cancelText: '', // Hide cancel button
      onOk: () => {
        console.log('Terms accepted');
      },
    });
  };

  return <button onClick={handleForceDecision}>Show Terms</button>;
}

// ============================================
// Example 10: Real-world Component Integration
// ============================================
function InstructorCourseCard({ course }) {
  const t = useTranslations('instructorDashboard');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  const handleDeleteCourse = () => {
    showDangerConfirmModal({
      title: t('deleteCourseTitle'),
      content: t('deleteCourseConfirm', { courseName: course.title }),
      okText: t('confirmDelete'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await deleteCourse(course.id);

          notification.success({
            message: tNotif('success'),
            description: t('deleteCourseSuccess'),
            placement: 'topRight',
            duration: 3,
          });

          // Refresh course list
          window.location.reload();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : t('deleteCourseError');

          notification.error({
            message: tNotif('error'),
            description: errorMsg,
            placement: 'topRight',
            duration: 5,
          });
        }
      },
    });
  };

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <button onClick={handleDeleteCourse} className="btn-danger">
        Delete Course
      </button>
    </div>
  );
}
