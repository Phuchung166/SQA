import { ST } from 'next/dist/shared/lib/utils';

/**
 * Course View Modes
 * Used to determine how course cards should be displayed based on user role
 */
export const COURSE_VIEW_MODE = {
  /** Default view for guest users - shows "Enroll Now" button */
  DEFAULT: 'default',
  /** Student view - shows "Go to Course" if enrolled, "Enroll Now" if not */
  STUDENT: 'student',
  /** Instructor view - shows "Update" and "Delete" buttons */
  INSTRUCTOR: 'instructor',
} as const;

export type CourseViewMode = (typeof COURSE_VIEW_MODE)[keyof typeof COURSE_VIEW_MODE];

/**
 * Course Status
 */
export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

/**
 * Course Level
 */
export const COURSE_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export type CourseLevel = (typeof COURSE_LEVEL)[keyof typeof COURSE_LEVEL];

/**
 * Course Sort Options
 */
export const COURSE_SORT = {
  NEWEST: 'createdAt',
  TITLE: 'title',
  PRICE: 'price',
  RATING: 'avgRating',
} as const;

export type CourseSortOption = (typeof COURSE_SORT)[keyof typeof COURSE_SORT];

/**
 * Course Sort Order
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

export const COURSE_TYPE = {
  STANDALONE: 'STANDALONE',
  SPECIALIZATION: 'SPECIALIZATION',
  PROGRAM: 'PROGRAM',
};
