import axios from '@/config/axios';
import { parseApiError } from './apiError';
import { Review, ReviewStatistics } from './reviewService';

export interface GroupCourseRequest {
  page: number;
  pageSize: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enrollmentType?: 'LIFETIME';
}

export interface GroupCourseInstructorRequest {
  page: number;
  pageSize: number;
  search?: string;
  enrollmentType?: 'LIFETIME';
}

export interface GroupCourseInstructorResponse {
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
  total_elements: number;
  total_pages: number;
  data: GroupCourse[];
}

export interface CreateGroupCourse {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  enrollment_type: 'LIFETIME';
  what_you_learn: string;
  currency?: string;
  course_codes: string[]; // list of course codes
  is_pre_order?: boolean;
  bundle_preorder_start_date?: string;
  bundle_preorder_end_date?: string;
  pre_order_price?: number;
  bundle_total_slots?: number;
}

export interface UpdateGroupCourse {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  enrollment_type: 'LIFETIME';
  what_you_learn: string;
  currency?: string;
  course_codes: string[]; // list of course codes
  removed_course_codes: string[]; // list of course codes to be removed
}

export interface GroupCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  enrollment_type: 'LIFETIME';
  whatYouLearn: string;
  slug: string;
  currency: string;
  course?: Course[];
  list_of_courses?: Course[]; // Added: actual response field name from API
  category?: { id: number; name: string };
  instructor?: InstructorResponse;
  total_courses?: number;
  is_pre_order?: boolean;
  bundle_preorder_start_date?: string;
  bundle_preorder_end_date?: string;
  pre_order_price?: number;
  bundle_total_slots?: number;
  bundle_remaining_slots?: number;
}

export interface PreOrderCourseRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PreOrderCourse {
  id: number;
  code: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  preview_video: string;
  level: string;
  language: string;
  price: number;
  currency: string;
  what_you_learn: string;
  target_audiences: string;
  pre_order_price: number;
  pre_order_total_slots: number;
  pre_order_remaining_slots: number;
  pre_order_start_date: string;
  pre_order_end_date: string;
  total_lessons?: number;
  instructor: {
    first_name: string;
    last_name: string;
    account_name: string;
    total_courses: number;
    slug: string;
    avatar: string;
    expertise: string;
    qualification: string;
    bio: string;
  };
  category: { id: number; name: string };
  status?: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'DEACTIVATED';
}

export interface PreOrderListResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: PreOrderCourse[];
}

export interface Lesson {
  created_at: string;
  updated_at: string;
  id: number;
  module_id: number;
  title: string;
  description: string;
  content_type: 'video' | 'text';
  video_url?: string;
  video_duration?: number;
  // duration derived from video metadata (in milliseconds)
  duration?: number;
  document_url?: string;
  content?: string;
  sort_order: number;
  is_preview: boolean;
  is_mandatory: boolean;
  is_completed?: boolean;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  sort_order: number;
  course_id: number;
  lessons?: Lesson[];
  created_at?: string;
  updated_at?: string;
  duration?: number;
  total_lessons?: number;
  is_preview?: boolean;
  is_completed?: boolean;
  quizzes?: {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
  }[];
}

export interface InstructorResponse {
  id: number;
  name: string;
  avatar: string;
  first_name?: string;
  last_name?: string;
  qualification?: string;
  total_courses?: number;
  total_students?: number;
  expertise?: string;
  bio?: string;
  slug?: string;
}

export interface Course {
  id: number;
  code: string; // Course code (e.g., ONL12345678)
  title: string; // [0, 255] characters
  description: string;
  short_description: string;
  thumbnail: string; // matches ^(https?://).*$
  preview_video: string; // matches ^(https?://).*$
  instructor: InstructorResponse;
  category: { id: number; name: string };
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language: string; // [0, 10] characters
  price: number; // ≥ 0
  currency: string; // [0, 3] characters
  is_free: boolean;
  enrollment_type?: 'LIFETIME';
  expired_days?: number | null;
  what_you_learn: string[];
  target_audiences: string[];
  course_modules: CourseModule[];
  created_at: string;
  updated_at: string;
  // Additional fields for computed values
  total_students?: number;
  total_lessons?: number;
  total_duration?: number;
  avg_rating?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'DEACTIVATED';
  total_reviews?: number;
  published_at: string;
  course_type: 'STANDALONE' | 'SPECIALIZATION' | 'PROGRAM';
  duration?: number;
  review?: ReviewStatistics;
  // Pre-order fields
  is_pre_order?: boolean;
  pre_order_start_date?: string;
  pre_order_end_date?: string;
  pre_order_price?: number;
  pre_order_total_slots?: number;
  pre_order_remaining_slots?: number;
}

// Query params use camelCase
export interface CourseRequest {
  page: number;
  pageSize: number;
  instructorId?: string;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  enrollmentType?: 'LIFETIME';
}

// Query params use camelCase
export interface InstructorCoursesRequest {
  page: number;
  pageSize: number;
  categoryId?: number;
  isGrouped?: boolean;
}

export interface InstructorCoursesResponse {
  data: Course[];
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
  page_size: number;
  total_elements: number;
  total_pages: number;
}

export interface CreateCourseRequest {
  code: string;
  title: string;
  description: string;
  short_description: string;
  thumbnail: string;
  preview_video: string;
  category_id: number;
  language: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  currency: string;
  is_free: boolean;
  expired_days?: number | null; // Optional
  enrollment_type?: 'LIFETIME';
  what_you_learn: string[];
  target_audiences: string[];
  course_modules?: CreateCourseModuleRequest[];
  is_pre_order?: boolean;
  pre_order_start_date?: string;
  pre_order_end_date?: string;
  pre_order_price?: number;
  pre_order_total_slots?: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  preview_video?: string;
  category_id?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language?: string;
  price?: number;
  currency?: string;
  is_free?: boolean;
  what_you_learn?: string[];
  target_audiences?: string[];
}

export interface CreateCourseModuleRequest {
  title: string;
  description: string;
  sort_order: number;
  course_id?: number; // Optional when creating as part of sub-course
  lessons: CreateLessonRequest[];
}

export interface CreateLessonRequest {
  module_id?: number; // Optional when creating as part of module
  title: string;
  description: string;
  content_type: 'video' | 'text';
  video_url?: string;
  document_url?: string;
  content?: string;
  sort_order: number;
  is_mandatory: boolean;
  duration?: number;
}

// Standalone module creation request
export interface CreateModuleRequest {
  title: string;
  description: string;
  sort_order: number;
  sub_course_id: number;
  lessons: CreateLessonRequest[];
}

// Standalone lesson creation request
export interface CreateLessonStandaloneRequest {
  module_id: number;
  title: string;
  description: string;
  content_type: 'video' | 'text';
  video_url?: string;
  document_url?: string;
  content?: string;
  sort_order: number;
  is_mandatory: boolean;
  duration?: number;
}

// Request interfaces for listing - Query params use camelCase
export interface CourseModuleListRequest {
  page: number;
  pageSize: number;
  courseId?: number;
  enrollmentId?: number;
  isPreview?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Query params use camelCase
export interface LessonListRequest {
  page: number;
  pageSize: number;
  moduleId?: number;
  search?: string;
  contentType?: 'video' | 'text';
  isMandatory?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CourseModuleDetailResponse extends CourseModule {
  create_at: string;
  update_at: string;
  is_preview: boolean;
}

export interface UpdateCourseModuleRequest {
  title?: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  content_type?: 'video' | 'text';
  video_url?: string;
  document_url?: string;
  content?: string;
  sort_order?: number;
  is_mandatory?: boolean;
  duration?: number;
}

export interface LessonDetailResponse extends Lesson {
  is_preview: boolean;
}

/**
 * Create a new course with modules and lessons
 * POST /api/v1/courses
 */
export const createCourse = async (courseData: CreateCourseRequest): Promise<Course> => {
  try {
    const response = await axios.post(`/courses`, courseData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Create a new course module with lessons
 * POST /api/v1/course-modules
 */
export const createCourseModule = async (
  moduleData: CreateModuleRequest,
): Promise<CourseModule> => {
  try {
    const response = await axios.post(`/course-modules`, moduleData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating course module:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Create a new lesson
 * POST /api/v1/lessons
 */
export const createLesson = async (lessonData: CreateLessonStandaloneRequest): Promise<Lesson> => {
  try {
    const response = await axios.post(`/lessons`, lessonData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating lesson:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get courses with pagination and filters
 */
export const getCourses = async (
  params: CourseRequest,
): Promise<{ data: Course[]; total: number; page: number; pageSize: number }> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.status) queryParams.append('status', params.status);

    if (params.instructorId) queryParams.append('instructorId', params.instructorId);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/courses?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching courses:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get pre-order courses with pagination and filters
 * GET /api/v1/courses/pre-order
 */
export const getPreOrderCourses = async (
  params: PreOrderCourseRequest,
): Promise<PreOrderListResponse> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/courses/pre-order?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching pre-order courses:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get instructor's courses with pagination and filters
 * Requires authentication token
 * GET /api/v1/instructors/courses
 */
export const getInstructorCourses = async (
  params: InstructorCoursesRequest,
): Promise<InstructorCoursesResponse> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    if (params.isGrouped !== undefined)
      queryParams.append('isGrouped', params.isGrouped.toString());

    const response = await axios.get(`/instructors/courses?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching instructor courses:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (id: number): Promise<Course> => {
  try {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching course with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Update course
 */
export const updateCourse = async (
  id: number,
  courseData: Partial<CreateCourseRequest>,
): Promise<Course> => {
  try {
    const response = await axios.patch(`/courses/${id}`, courseData);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error updating course with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/courses/${id}`);
  } catch (error: unknown) {
    console.error(`Error deleting course with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get list of course modules with pagination
 * GET /api/v1/course-module
 */
export const getCourseModules = async (
  params: CourseModuleListRequest,
): Promise<{ data: CourseModule[]; page: number; pageSize: number; totalElements: number }> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.courseId !== undefined) queryParams.append('courseId', params.courseId.toString());
    if (params.isPreview !== undefined)
      queryParams.append('isPreview', params.isPreview.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/course-modules?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching course modules:', error);
    return Promise.reject(parseApiError(error));
  }
};

export const getCourseModulesByUser = async (
  params: CourseModuleListRequest,
): Promise<{ data: CourseModule[]; page: number; pageSize: number; totalElements: number }> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.courseId !== undefined) queryParams.append('courseId', params.courseId.toString());
    if (params.enrollmentId !== undefined)
      queryParams.append('enrollmentId', params.enrollmentId.toString());
    if (params.isPreview !== undefined)
      queryParams.append('isPreview', params.isPreview.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/course-modules/enrolled-user?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching course modules:', error);
    return Promise.reject(parseApiError(error));
  }
};

export const getCourseModulesByInstructor = async (
  params: CourseModuleListRequest,
): Promise<{ data: CourseModule[]; page: number; pageSize: number; totalElements: number }> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.courseId !== undefined) queryParams.append('courseId', params.courseId.toString());
    if (params.isPreview !== undefined)
      queryParams.append('isPreview', params.isPreview.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/admin/course-modules?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching course modules:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get course module by ID
 * GET /api/v1/course-module/{id}
 */
export const getCourseModuleById = async (id: number): Promise<CourseModuleDetailResponse> => {
  try {
    const response = await axios.get(`/course-modules/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching course module with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Update course module
 * PATCH /api/v1/course-module/{id}
 */
export const updateCourseModule = async (
  id: number,
  moduleData: UpdateCourseModuleRequest,
): Promise<CourseModule> => {
  try {
    const response = await axios.patch(`/course-modules/${id}`, moduleData);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error updating course module with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete course module
 * DELETE /api/v1/course-module/{id}
 */
export const deleteCourseModule = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/course-modules/${id}`);
  } catch (error: unknown) {
    console.error(`Error deleting course module with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get list of lessons with pagination
 * GET /api/v1/lessons
 */
export const getLessons = async (
  params: LessonListRequest,
): Promise<{ data: Lesson[]; page: number; pageSize: number; totalElements: number }> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.moduleId !== undefined) queryParams.append('moduleId', params.moduleId.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.contentType) queryParams.append('contentType', params.contentType);
    if (params.isMandatory !== undefined)
      queryParams.append('isMandatory', params.isMandatory.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/lessons?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching lessons:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Update lesson
 * PATCH /api/v1/lessons/{id}
 */
export const updateLesson = async (
  id: number,
  lessonData: UpdateLessonRequest,
): Promise<LessonDetailResponse> => {
  try {
    const response = await axios.patch(`/lessons/${id}`, lessonData);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error updating lesson with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete lesson
 * DELETE /api/v1/lessons/{id}
 */
export const deleteLesson = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/lessons/${id}`);
  } catch (error: unknown) {
    console.error(`Error deleting lesson with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

// ==================== GROUP COURSE APIs ====================

export const getGroupCourses = async (
  params: GroupCourseRequest,
): Promise<{ data: GroupCourse[]; page: number; pageSize: number; totalElements: number }> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.enrollmentType) queryParams.append('enrollmentType', params.enrollmentType);

    const response = await axios.get(`/course-groups?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching sub courses:', error);
    return Promise.reject(parseApiError(error));
  }
};

export const getGroupCoursesInstructor = async (
  params: GroupCourseInstructorRequest,
): Promise<GroupCourseInstructorResponse> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.search) queryParams.append('search', params.search);
    if (params.enrollmentType) queryParams.append('enrollmentType', params.enrollmentType);

    const response = await axios.get(`/course-groups/instructor?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching sub courses:', error);
    return Promise.reject(parseApiError(error));
  }
};

export const createGroupCourse = async (
  groupCourseData: CreateGroupCourse,
): Promise<GroupCourse> => {
  try {
    const response = await axios.post(`/course-groups`, groupCourseData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating group course:', error);
    return Promise.reject(parseApiError(error));
  }
};

export const updateGroupCourse = async (
  groupCourseId: number,
  groupCourseData: UpdateGroupCourse,
): Promise<GroupCourse> => {
  try {
    const response = await axios.patch(`/course-groups/${groupCourseId}`, groupCourseData);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error updating group course with id ${groupCourseId}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

export const getGroupCourseById = async (groupCourseId: number): Promise<GroupCourse> => {
  try {
    const response = await axios.get(`/course-groups/${groupCourseId}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching group course with id ${groupCourseId}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

export const deleteGroupCourse = async (groupCourseId: number): Promise<void> => {
  try {
    await axios.delete(`/course-groups/${groupCourseId}`);
  } catch (error: unknown) {
    console.error(`Error deleting group course with id ${groupCourseId}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Create a new sub course with modules and lessons
 * POST /api/v1/sub-courses
 */

// /**
//  * Get list of sub courses with pagination
//  * GET /api/v1/courses/{courseId}/sub-courses
//  */
// export const getSubCourses = async (
//   params: SubCourseListRequest,
// ): Promise<{ data: SubCourse[]; page: number; pageSize: number; totalElements: number }> => {
//   try {
//     const queryParams = new URLSearchParams();

//     queryParams.append('page', params.page.toString());
//     queryParams.append('pageSize', params.pageSize.toString());

//     if (params.search) queryParams.append('search', params.search);
//     if (params.sortBy) queryParams.append('sortBy', params.sortBy);
//     if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
//     if (params.courseId !== undefined) queryParams.append('courseId', params.courseId.toString());

//     const response = await axios.get(`/sub-courses?${queryParams.toString()}`);
//     return response.data;
//   } catch (error: unknown) {
//     console.error('Error fetching sub courses:', error);
//     return Promise.reject(parseApiError(error));
//   }
// };

// /**
//  * Get sub course by ID
//  * GET /api/v1/courses/{courseId}/sub-courses/{id}
//  */

export const publishCourse = async (courseId: number): Promise<void> => {
  try {
    await axios.patch(`/courses/${courseId}/publish`);
  } catch (error: unknown) {
    console.error(`Error publishing course with id ${courseId}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

// ==================== LESSON PROGRESS APIs ====================

export interface LessonProgressRequest {
  lesson_id: number;
  enrollment_id: number;
}

export interface CourseProgressResponse {
  total_lessons: number;
  completed_lessons: number;
}

/**
 * Mark a lesson as completed
 * POST /api/v1/lesson-progress
 */
export const markLessonProgress = async (
  data: LessonProgressRequest,
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`/lesson-progress`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error marking lesson progress:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get course progress for an enrollment
 * GET /api/v1/lesson-progress/course-progress
 * @param enrollmentId - Enrollment ID
 * @param courseId - Course ID
 */
export const getCourseProgress = async (
  enrollmentId: number,
  courseId: number,
): Promise<CourseProgressResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('enrollmentId', enrollmentId.toString());
    queryParams.append('courseId', courseId.toString());

    const response = await axios.get(`/lesson-progress/course-progress?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching course progress:', error);
    return Promise.reject(parseApiError(error));
  }
};

// ===== Pre-Order Enrollment APIs =====

export interface PreOrderEnrollmentRequest {
  course_id: number;
  course_group_id?: number;
}

export interface PaymentResponse {
  payment_url: string;
  provider: string;
}

export interface PreOrderEnrollmentResponse {
  course_id: number;
  course_title: string;
  course_type: 'GROUP' | 'SINGLE';
  slot_number: number;
  pre_order_date: string;
  pride_paid: number;
  payment_response: PaymentResponse;
}

export interface PreOrderEnrollmentStatusResponse {
  id: number;
  slotNumber: number;
  preOrderDate: string;
  pricePaid: number;
  status: 'RESERVED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paymentId: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a pre-order enrollment for a course
 * POST /api/v1/pre-order-enrollments
 * @param data - Pre-order enrollment request data
 */
export const createPreOrderEnrollment = async (
  data: PreOrderEnrollmentRequest,
): Promise<PreOrderEnrollmentResponse> => {
  try {
    const response = await axios.post('/pre-order-enrollments', data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating pre-order enrollment:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get pre-order enrollment status by payment ID
 * GET /api/v1/pre-order-enrollments/{paymentId}/status
 * @param paymentId - Payment ID from enrollment response
 */
export const getPreOrderEnrollmentStatus = async (
  paymentId: string,
): Promise<PreOrderEnrollmentStatusResponse> => {
  try {
    const response = await axios.get(`/pre-order-enrollments/${paymentId}/status`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching pre-order enrollment status:', error);
    return Promise.reject(parseApiError(error));
  }
};
