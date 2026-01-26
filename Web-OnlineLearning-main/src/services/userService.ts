import axios from '@/config/axios';
import { parseApiError } from './apiError';
import { ReviewStatistics } from './reviewService';

export interface BecomeInstructorResponse {
  message: string;
  success: boolean;
}

export interface InstructorReview {
  instructor_id: number;
  total_reviews: number;
  avg_rating: number;
  total_rating1: number;
  total_rating2: number;
  total_rating3: number;
  total_rating4: number;
  total_rating5: number;
}

export interface UserProfile {
  createdAt?: string;
  updatedAt?: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  avatar: string;
  date_of_birth?: string;
  gender?: string;
  bio: string;
  account_name?: string;
  roles?: string[];
}

export interface InstructorProfile {
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  slug: string;
  socialLinks?: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram?: string;
  };
  first_name: string;
  last_name: string;
  expertise: string;
  experience_years: string;
  qualification: string;
  total_courses: string;
  total_students: string;
}

export interface InstructorDetailProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string;
  bio: string;
  slug?: string;
  socialLinks?: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram?: string;
  };
  expertise: string;
  experience_years: string;
  qualification: string;
  total_courses: number;
  total_students: number;
  bank_account?: string;
  bank_name?: string;
  review?: InstructorReview;
}

export interface UpdateInstructorProfileRequest {
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  expertise?: string;
  gender?: string;
  date_of_birth?: string;
  experience_years?: number;
  qualifications?: string;
  bank_account?: string;
  bank_name?: string;
  tax_code?: string;
  commission_rate?: number;
}

export interface CourseIncomeData {
  course_title: string;
  income: number;
  thumbnail: string;
  course_type: 'STANDALONE' | 'GROUP';
  total_sales: number;
}

export interface PagedCourseIncomeResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: CourseIncomeData[];
}

export interface InstructorIncomeResponse {
  total_income: number;
  commission_rate: number;
  courses: PagedCourseIncomeResponse;
}

export interface IncomeParams {
  page?: number;
  pageSize?: number;
}

export interface InstructorDetailProfileOther {
  avatar: string;
  bio: string;
  expertise: string;
  experience_years: string;
  qualification: string;
  total_courses?: number;
  total_students?: string;
  review?: ReviewStatistics;
}

export interface InstructorCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
  course_type: 'STANDALONE' | 'SPECIALIZATION' | 'PROGRAM';
}

export interface InstructorCoursesResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: InstructorCourse[];
}

export interface UpdateStudentProfileRequest {
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  gender?: string;
  account_name?: string;
  date_of_birth?: string;
  bio?: string;
}

export interface UpdateInstructorProfileRequest {
  first_name?: string;
  avatar?: string;
  last_name?: string;
  bio?: string;
  expertise?: string;
  gender?: string;
  date_of_birth?: string;
  experience_years?: number;
  qualifications?: string;
  bank_account?: string;
  bank_name?: string;
  tax_code?: string;
  commission_rate?: number;
  phone?: string;
}

class UserService {
  private baseUrl = 'users';

  private instructorBaseUrl = 'instructors';

  /**
   * Request to become an instructor (requires Bearer token)
   * GET /api/v1/users/become-to-instructor
   * @returns Promise<BecomeInstructorResponse>
   */
  async becomeToInstructor(): Promise<BecomeInstructorResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/become-to-instructor`);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get current user profile (student/instructor)
   * GET /api/v1/users/profile
   * @returns Promise<UserProfile>
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await axios.get(`${this.baseUrl}/profile`);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get instructor profile
   * GET /api/v1/users/instructor-profile
   * @returns Promise<InstructorDetailProfile>
   */
  async getInstructorProfile(): Promise<InstructorDetailProfile> {
    try {
      const response = await axios.get(`/instructors/profile`);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  async getTopInstructors(): Promise<InstructorProfile[]> {
    try {
      const response = await axios.get(`${this.instructorBaseUrl}/top`);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get instructor detail by slug
   * GET /api/v1/instructor/profile/{slug}
   * @param slug - instructor slug
   * @returns Promise<InstructorDetailProfile>
   */
  async getInstructorDetailBySlug(slug: string): Promise<InstructorDetailProfile> {
    try {
      const response = await axios.get(`/instructors/profile/${slug}`);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get instructor's courses by slug with pagination
   * GET /api/v1/instructor/course/{slug}?page=&pageSize=
   * @param slug - instructor slug
   * @param page - page number (default 1)
   * @param pageSize - page size (default 10)
   * @returns Promise<InstructorCoursesResponse>
   */
  async getInstructorCoursesBySlug(
    slug: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<InstructorCoursesResponse> {
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('pageSize', pageSize.toString());
      const response = await axios.get(`/instructors/courses/${slug}?${query.toString()}`);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Update student profile
   * PATCH /api/v1/users
   * @param data - UpdateStudentProfileRequest
   * @returns Promise<UserProfile>
   */
  async updateStudentProfile(data: UpdateStudentProfileRequest): Promise<UserProfile> {
    try {
      const response = await axios.patch(`${this.baseUrl}`, data);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Update instructor profile
   * PATCH /api/v1/users/instructor-profile
   * @param data - UpdateInstructorProfileRequest
   * @returns Promise<InstructorDetailProfile>
   */
  async updateInstructorProfile(
    data: UpdateInstructorProfileRequest,
  ): Promise<InstructorDetailProfile> {
    try {
      const response = await axios.patch(`${this.baseUrl}/instructor-profile`, data);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get instructor income
   * GET /instructors/income?page={page}&pageSize={pageSize}
   * @param params - IncomeParams (page, pageSize)
   * @returns Promise<InstructorIncomeResponse>
   */
  async getInstructorIncome(params?: IncomeParams): Promise<InstructorIncomeResponse> {
    try {
      const query = new URLSearchParams();

      if (params?.page !== undefined) {
        query.append('page', params.page.toString());
      }
      if (params?.pageSize !== undefined) {
        query.append('pageSize', params.pageSize.toString());
      }

      const url = query.toString()
        ? `/instructors/income?${query.toString()}`
        : '/instructors/income';
      const response = await axios.get(url);
      return response.data as InstructorIncomeResponse;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }
}

export const userService = new UserService();
export default userService;
