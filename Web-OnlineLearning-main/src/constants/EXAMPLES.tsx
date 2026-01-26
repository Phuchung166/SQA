/* eslint-disable */
// @ts-nocheck
/**
 * Example Usage of CourseConstants
 *
 * This file demonstrates how to use the constants in different scenarios
 * DO NOT import this file - it's for documentation only
 */

import { COURSE_VIEW_MODE, type CourseViewMode } from '@/constants';
import CommonCourseSingleCard from '@/components/common/course-card/CommonCourseSingleCard';

// ============================================
// Example 1: Default View (Guest User)
// ============================================
function GuestCourseList({ courses }: { courses: Course[] }) {
  return (
    <div>
      {courses.map(course => (
        <CommonCourseSingleCard
          key={course.id}
          course={course}
          // No viewMode specified - uses DEFAULT automatically
        />
      ))}
    </div>
  );
}

// ============================================
// Example 2: Student View (Enrolled Courses)
// ============================================
function StudentEnrolledCourses({ enrolledCourses }: { enrolledCourses: Course[] }) {
  return (
    <div>
      {enrolledCourses.map(course => (
        <CommonCourseSingleCard
          key={course.id}
          course={course}
          viewMode={COURSE_VIEW_MODE.STUDENT}
          isEnrolled={true}
          // Shows "Go to Course" button
        />
      ))}
    </div>
  );
}

// ============================================
// Example 3: Student View (Browse Courses)
// ============================================
function StudentBrowseCourses({ courses }: { courses: Course[] }) {
  return (
    <div>
      {courses.map(course => (
        <CommonCourseSingleCard
          key={course.id}
          course={course}
          viewMode={COURSE_VIEW_MODE.STUDENT}
          isEnrolled={false}
          // Shows "Enroll Now" button
        />
      ))}
    </div>
  );
}

// ============================================
// Example 4: Instructor View (Manage Courses)
// ============================================
function InstructorCourseManagement({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const { notification } = useNotification();

  const handleUpdateCourse = (courseId: number) => {
    router.push(`/update-course/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: number) => {
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
  };

  return (
    <div>
      {courses.map(course => (
        <CommonCourseSingleCard
          key={course.id}
          course={course}
          viewMode={COURSE_VIEW_MODE.INSTRUCTOR}
          onUpdate={handleUpdateCourse}
          onDelete={handleDeleteCourse}
          // Shows "Update" and "Delete" buttons
        />
      ))}
    </div>
  );
}

// ============================================
// Example 5: Dynamic View Based on User Role
// ============================================
function DynamicCourseView({
  courses,
  userRole,
  enrolledCourseIds,
}: {
  courses: Course[];
  userRole: 'guest' | 'student' | 'instructor';
  enrolledCourseIds: number[];
}) {
  const getViewMode = (): CourseViewMode => {
    switch (userRole) {
      case 'instructor':
        return COURSE_VIEW_MODE.INSTRUCTOR;
      case 'student':
        return COURSE_VIEW_MODE.STUDENT;
      default:
        return COURSE_VIEW_MODE.DEFAULT;
    }
  };

  const viewMode = getViewMode();

  return (
    <div>
      {courses.map(course => (
        <CommonCourseSingleCard
          key={course.id}
          course={course}
          viewMode={viewMode}
          isEnrolled={enrolledCourseIds.includes(course.id)}
          onUpdate={userRole === 'instructor' ? handleUpdateCourse : undefined}
          onDelete={userRole === 'instructor' ? handleDeleteCourse : undefined}
        />
      ))}
    </div>
  );
}

// ============================================
// Example 6: Type-Safe Function Parameter
// ============================================
function getCourseCardConfig(viewMode: CourseViewMode) {
  switch (viewMode) {
    case COURSE_VIEW_MODE.DEFAULT:
      return {
        showPrice: true,
        showInstructor: true,
        buttonText: 'Enroll Now',
      };
    case COURSE_VIEW_MODE.STUDENT:
      return {
        showPrice: false,
        showInstructor: true,
        buttonText: 'Go to Course',
      };
    case COURSE_VIEW_MODE.INSTRUCTOR:
      return {
        showPrice: true,
        showInstructor: false,
        buttonText: 'Manage',
      };
  }
}
