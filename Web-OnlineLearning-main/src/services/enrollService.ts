import axios from '@/config/axios';
import { parseApiError } from './apiError';
import { GroupCourse } from './courseService';

export interface EnrollmentUser {
  id: number;
  email: string;
  account_name: string;
  avatar?: string | null;
}

export interface EnrollmentCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string | null;
  course_type?: string | null;
}

export interface EnrollmentItem {
  id: number;
  user: EnrollmentUser;
  course: EnrollmentCourse;
  enrollment_date?: string | null;
  completed_at?: string | null;
  certificate_issued?: boolean;
  certificate_url?: string | null;
  last_accessed?: string | null;
  course_group?: GroupCourse;
}

// New response interfaces for user enrollments
export interface UserCourseEnrollment {
  id: number;
  total_progress: number;
  enrollment_date: string;
  completed_at: string | null;
  last_accessed: string | null;
  course_id: number;
  title: string;
  thumbnail: string;
  slug: string;
  course_type: 'STANDALONE' | 'GROUP';
}

export interface UserCourseGroupEnrollment {
  id: number;
  total_progress: number;
  enrollment_date: string;
  completed_at: string | null;
  last_accessed: string | null;
  course_id: number;
  title: string;
  thumbnail: string;
  slug: string;
  course_type: 'GROUP';
}

export interface PagedUserCoursesResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: UserCourseEnrollment[];
}

export interface PagedUserCourseGroupsResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: UserCourseGroupEnrollment[];
}

export interface MyPaidPreOrderCourse {
  slot_number: number;
  price_paid: number;
  status: 'RESERVED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  pre_order_date: string;
  course_title: string;
  course_id: number;
  course_thumbnail: string;
}

export interface PagedMyPaidPreOrderCoursesResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: MyPaidPreOrderCourse[];
}

export interface EnrollmentCourseResponse {
  id: number;
  total_progress: number;
  enrollment_date: string;
  completed_at: string | null;
  last_accessed: string | null;
  course_id: number;
  title: string;
  thumbnail: string;
  slug: string;
  course_type: 'STANDALONE' | 'GROUP';
}

export interface CourseGroupEnrollmentDetail {
  course_group_id: number;
  course_group_description: string;
  course_group_title: string;
  what_you_learn: string;
  enrollment_type: string;
  enrollment_course_responses: EnrollmentCourseResponse[];
  course_group_thumbnail: string;
}

export interface EnrollmentCheckResponse {
  courseId: number;
  isEnrolled: boolean;
  courseType: 'STANDALONE' | 'GROUP';
  enrollmentId?: number | null;
  hasPreOrder?: boolean;
}

export interface PagedEnrollmentResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: EnrollmentItem[];
}

export interface EnrollmentListParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: number | string;
  courseId?: number | string;
  search?: string;
}

/**
 * List enrollments with optional filters
 * GET /enrollments?page=&pageSize=&sortBy=&sortOrder=&search=&userId=&courseId=
 */
export const getEnrollments = async (
  params: EnrollmentListParams,
): Promise<PagedEnrollmentResponse> => {
  try {
    const query = new URLSearchParams();

    query.append('page', params.page.toString());
    query.append('pageSize', params.pageSize.toString());

    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.search) query.append('search', params.search);
    if (params.userId !== undefined && params.userId !== null)
      query.append('userId', String(params.userId));
    if (params.courseId !== undefined && params.courseId !== null)
      query.append('courseId', String(params.courseId));

    const response = await axios.get(`/enrollments?${query.toString()}`);
    return response.data as PagedEnrollmentResponse;
  } catch (error: unknown) {
    console.error('Error fetching enrollments:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Create an enrollment (register for a course)
 * POST /enrollments
 * body: { course_id }
 */
export const createEnrollment = async (course_id: number): Promise<EnrollmentItem> => {
  try {
    const response = await axios.post(`/enrollments`, { course_id });
    return response.data as EnrollmentItem;
  } catch (error: unknown) {
    console.error('Error creating enrollment:', error);
    return Promise.reject(parseApiError(error));
  }
};

export const createGroupCourseEnrollment = async (
  courseGroupId: number,
): Promise<EnrollmentItem> => {
  try {
    const response = await axios.post(`/enrollments/group/${courseGroupId}`, {});
    return response.data as EnrollmentItem;
  } catch (error: unknown) {
    console.error('Error creating enrollment:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get enrollment detail by id
 * GET /enrollments/{id}
 */
export const getEnrollment = async (id: number): Promise<EnrollmentItem> => {
  try {
    const response = await axios.get(`/enrollments/${id}`);
    return response.data as EnrollmentItem;
  } catch (error: unknown) {
    console.error(`Error fetching enrollment ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete enrollment by id
 * DELETE /enrollments/{id}
 */
export const deleteEnrollment = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/enrollments/${id}`);
  } catch (error: unknown) {
    console.error(`Error deleting enrollment ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * List enrollments for current user (legacy endpoint)
 * GET /enrollments/user?page=&pageSize=&sortBy=&sortOrder=&search=
 */
export const getEnrollmentsByUser = async (
  params: Omit<EnrollmentListParams, 'userId' | 'courseId'>,
): Promise<PagedEnrollmentResponse> => {
  try {
    const query = new URLSearchParams();

    query.append('page', params.page.toString());
    query.append('pageSize', params.pageSize.toString());

    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.search) query.append('search', params.search);

    const response = await axios.get(`/enrollments/user?${query.toString()}`);
    return response.data as PagedEnrollmentResponse;
  } catch (error: unknown) {
    console.error('Error fetching enrollments for user:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get current user's enrolled standalone courses
 * GET /enrollments/user-courses?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&search
 */
export const getUserCourses = async (params: {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}): Promise<PagedUserCoursesResponse> => {
  try {
    const query = new URLSearchParams();

    query.append('page', params.page.toString());
    query.append('pageSize', params.pageSize.toString());

    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.search) query.append('search', params.search);

    const response = await axios.get(`/enrollments/user-courses?${query.toString()}`);
    return response.data as PagedUserCoursesResponse;
  } catch (error: unknown) {
    console.error('Error fetching user courses:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get current user's enrolled group courses
 * GET /enrollments/user-courses-groups?page=1&pageSize=10&search
 */
export const getUserCourseGroups = async (params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PagedUserCourseGroupsResponse> => {
  try {
    const query = new URLSearchParams();

    query.append('page', params.page.toString());
    query.append('pageSize', params.pageSize.toString());

    if (params.search) query.append('search', params.search);

    const response = await axios.get(`/enrollments/user-courses-groups?${query.toString()}`);
    return response.data as PagedUserCourseGroupsResponse;
  } catch (error: unknown) {
    console.error('Error fetching user course groups:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get enrollment detail for a course group
 * GET /enrollments/course-group/{courseGroupId}
 */
export const getCourseGroupEnrollmentDetail = async (
  courseGroupId: number,
): Promise<CourseGroupEnrollmentDetail> => {
  try {
    const response = await axios.get(`/enrollments/course-group/${courseGroupId}`);
    return response.data as CourseGroupEnrollmentDetail;
  } catch (error: unknown) {
    console.error(`Error fetching course group enrollment detail ${courseGroupId}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Check if user is enrolled in a course
 * GET /enrollments/check-enrollment?courseId=&courseType=STANDALONE|GROUP
 */
export const checkEnroll = async (
  courseId: number,
  courseType: 'STANDALONE' | 'GROUP',
  checkPreOrder: boolean,
): Promise<EnrollmentCheckResponse> => {
  try {
    const query = new URLSearchParams();
    query.append('courseId', courseId.toString());
    query.append('courseType', courseType);
    if (checkPreOrder !== undefined && checkPreOrder !== null) {
      query.append('checkPreOrder', checkPreOrder.toString());
    }

    const response = await axios.get(`/enrollments/check-enrollment?${query.toString()}`);
    return response.data as EnrollmentCheckResponse;
  } catch (error: unknown) {
    console.error('Error checking enrollment:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get current user's paid pre-order courses
 * GET /pre-order-enrollments/my-paid-courses?page=1&pageSize=10
 */
export const getMyPaidPreOrderCourses = async (params: {
  page: number;
  pageSize: number;
}): Promise<PagedMyPaidPreOrderCoursesResponse> => {
  try {
    const query = new URLSearchParams();

    query.append('page', params.page.toString());
    query.append('pageSize', params.pageSize.toString());

    const response = await axios.get(`/pre-order-enrollments/my-paid-courses?${query.toString()}`);
    return response.data as PagedMyPaidPreOrderCoursesResponse;
  } catch (error: unknown) {
    console.error('Error fetching my paid pre-order courses:', error);
    return Promise.reject(parseApiError(error));
  }
};
