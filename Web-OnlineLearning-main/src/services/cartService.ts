import axios from '@/config/axios';
import { parseApiError } from './apiError';

export interface CartItemResponse {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  price: number;
  currency: 'USD' | 'VND';
  course_type: 'GROUP' | 'STANDALONE';
}

export interface PagedCartResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: CartItemResponse[];
}

export interface CreateCartItemRequest {
  course_id?: number;
  course_group_id?: number;
}

export interface CartListParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get cart items for current user
 * GET /cart_items?page=&pageSize=&sortBy=&sortOrder=
 */
export const getCartItemsByUser = async (params: CartListParams): Promise<PagedCartResponse> => {
  try {
    const query = new URLSearchParams();

    query.append('page', params.page.toString());
    query.append('pageSize', params.pageSize.toString());

    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const response = await axios.get(`/cart_items/user?${query.toString()}`);
    return response.data as PagedCartResponse;
  } catch (error: unknown) {
    console.error('Error fetching cart items for user:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Create a cart item (add to cart)
 * POST /cart_items
 * body: { course_id?: number, course_group_id?: number }
 * Note: One of course_id or course_group_id must be provided
 */
export const createCartItem = async (data: CreateCartItemRequest): Promise<CartItemResponse> => {
  try {
    const response = await axios.post(`/cart_items`, data);
    return response.data as CartItemResponse;
  } catch (error: unknown) {
    console.error('Error creating cart item:', error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete cart item by id
 * DELETE /cart_items/{id}
 */
export const deleteCartItem = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/cart_items/${id}`);
  } catch (error: unknown) {
    console.error(`Error deleting cart item ${id}:`, error);
    return Promise.reject(parseApiError(error));
  }
};

/**
 * Delete cart item by id
 * DELETE /cart_items/{id}
 */
export const deleteAllCartItem = async (): Promise<void> => {
  try {
    await axios.delete(`/cart_items/user`);
  } catch (error: unknown) {
    console.error(`Error deleting all cart items:`, error);
    return Promise.reject(parseApiError(error));
  }
};

// Helper function to determine if a cart item is a group course
export const isGroupCourseItem = (item: CartItemResponse): boolean => {
  // First check if course_type is explicitly set
  if (item.course_type) {
    return item.course_type === 'GROUP';
  }
  
  // Fallback: In case course_type is missing from API response,
  // we can't reliably determine type. Return false by default (treat as standalone)
  // The backend should always return course_type, so this is just a safety fallback
  return false;
};

/**
 * Helper to ensure course_type is set (with fallback)
 */
export const ensureCourseType = (item: any): 'GROUP' | 'STANDALONE' => {
  if (item.course_type === 'GROUP' || item.course_type === 'STANDALONE') {
    return item.course_type;
  }
  // Default fallback
  return 'STANDALONE';
};
