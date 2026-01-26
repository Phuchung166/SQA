// Common API response types
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface CategoryResponse {
  data: Category[];
  page: number;
  pageSize: number;
  totalElements: number;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  instructor: User;
  duration: number; // in minutes
  lessonsCount: number;
  rating: number;
  studentsCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CoursesRequest {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  sortBy?: 'created' | 'rating' | 'price' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  isFree: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
