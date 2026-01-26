import axios from '@/config/axios';
import { parseApiError } from './apiError';

// Interface cho Category (Response/Request body uses snake_case)
export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image?: string;
  total_courses?: number;
}

// Interface cho query parameters (URL params use camelCase)
export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
}

// Interface cho response (Response body uses snake_case)
export interface CategoryResponse {
  data: Category[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// CategoryService class
class CategoryService {
  private baseUrl = '/categories';

  /**
   * Get categories with pagination and filters
   * @param params - Query parameters
   * @returns Promise<CategoryResponse>
   */
  async getCategories(params: CategoryQueryParams = {}): Promise<CategoryResponse> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      isActive,
    } = params;

    const queryParams = new URLSearchParams();

    // Add pagination parameters
    queryParams.append('page', page.toString());
    queryParams.append('pageSize', pageSize.toString());

    // Add sorting parameters
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    // Add optional search parameter
    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }

    // Add optional isActive filter
    if (typeof isActive === 'boolean') {
      queryParams.append('isActive', isActive.toString());
    }

    try {
      const response = await axios.get(`${this.baseUrl}?${queryParams.toString()}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get category by ID
   * @param id - Category ID
   * @returns Promise<Category>
   */
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching category with id ${id}:`, error);
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Create new category
   * @param categoryData - Category data
   * @returns Promise<Category>
   */
  async createCategory(
    categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Category> {
    try {
      const response = await axios.post(this.baseUrl, categoryData);
      return response.data;
    } catch (error: unknown) {
      console.error('Error creating category:', error);
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Update category
   * @param id - Category ID
   * @param categoryData - Updated category data
   * @returns Promise<Category>
   */
  async updateCategory(
    id: string,
    categoryData: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Category> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, categoryData);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error updating category with id ${id}:`, error);
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Delete category
   * @param id - Category ID
   * @returns Promise<void>
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error: unknown) {
      console.error(`Error deleting category with id ${id}:`, error);
      return Promise.reject(parseApiError(error));
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
