import axios from '@/config/axios';
import { parseApiError } from './apiError';

export interface User {
  id: number;
  account_name: string;
  avatar: string;
}

export interface Review {
  id: number;
  course_id: number;
  user: User;
  rating: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: number;
  courseId?: number;
  rating?: number;
}

export interface ReviewResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: Review[];
}

export interface CreateReviewRequest {
  comment: string;
  course_id: number;
  rating: number;
}

export interface ReviewStatistics {
  course_id: number;
  total_reviews: number;
  avg_rating: number;
  total_rating1: number;
  total_rating2: number;
  total_rating3: number;
  total_rating4: number;
  total_rating5: number;
}

/**
 * Get all reviews with pagination and filters
 * GET /api/v1/reviews
 */
export const getReviews = async (params: ReviewRequest): Promise<ReviewResponse> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params.rating) queryParams.append('rating', params.rating.toString());

    const response = await axios.get(`/reviews?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching reviews:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get review by ID
 * GET /api/v1/reviews/{id}
 */
export const getReviewById = async (id: number): Promise<Review> => {
  try {
    const response = await axios.get(`/reviews/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching review with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Create a new review
 * POST /api/v1/reviews
 * Requires authentication
 */
export const createReview = async (reviewData: CreateReviewRequest): Promise<Review> => {
  try {
    const response = await axios.post(`/reviews`, reviewData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating review:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete a review
 * DELETE /api/v1/reviews/{id}
 * Requires authentication
 */
export const deleteReview = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/reviews/${id}`);
  } catch (error: unknown) {
    console.error(`Error deleting review with id ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Get review statistics for a course
 * GET /api/v1/reviews/statistics/course/{courseId}
 */
export const getReviewStatistics = async (courseId: number): Promise<ReviewStatistics> => {
  try {
    const response = await axios.get(`/reviews/statistics/course/${courseId}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching review statistics for course ${courseId}:`, error);
    return Promise.reject(parseApiError(error));
  }
};
