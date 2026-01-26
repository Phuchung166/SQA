'use client';

import { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';

// Define proper types for error handling
interface ErrorResponse {
  message?: string;
  details?: unknown;
}

interface ErrorWithResponse extends Error {
  response?: {
    data?: ErrorResponse;
    status: number;
  };
}

// Define types for form data values
type FormDataValue = string | number | boolean | File | null | undefined;
type FormDataRecord = Record<string, FormDataValue | FormDataValue[]>;

// Define types for query parameters
type QueryParamValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryParamValue>;

// API utility functions
export class ApiUtils {
  // Handle API errors with proper typing
  static handleError(error: unknown): string {
    // Handle Axios errors
    if (this.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'An unexpected error occurred';
    }

    // Handle custom error with response
    if (this.isErrorWithResponse(error)) {
      return error.response?.data?.message || error.message || 'An unexpected error occurred';
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }

  // Type guards
  private static isAxiosError(error: unknown): error is AxiosError<ErrorResponse> {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
  }

  private static isErrorWithResponse(error: unknown): error is ErrorWithResponse {
    return typeof error === 'object' && error !== null && 'response' in error;
  }

  // Format query parameters with proper typing
  static formatParams(params: QueryParams): QueryParams {
    const formatted: QueryParams = {};

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        formatted[key] = value;
      }
    });

    return formatted;
  }

  // Create FormData for file uploads with proper typing
  static createFormData(data: FormDataRecord): FormData {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item !== undefined && item !== null) {
              formData.append(`${key}[${index}]`, String(item));
            }
          });
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  // Parse error response with proper typing
  static parseErrorResponse(error: unknown): ApiError {
    if (this.isAxiosError(error)) {
      const response = error.response;

      if (!response) {
        return {
          message: 'Network error',
          statusCode: 0,
          details: undefined,
        };
      }

      const details = response.data?.details;
      return {
        message: response.data?.message || 'An error occurred',
        statusCode: response.status,
        details:
          details && typeof details === 'object' ? (details as Record<string, unknown>) : undefined,
      };
    }

    if (this.isErrorWithResponse(error)) {
      const response = error.response;

      if (!response) {
        return {
          message: 'Network error',
          statusCode: 0,
          details: undefined,
        };
      }

      const details = response.data?.details;
      return {
        message: response.data?.message || 'An error occurred',
        statusCode: response.status,
        details:
          details && typeof details === 'object' ? (details as Record<string, unknown>) : undefined,
      };
    }

    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 0,
      details: undefined,
    };
  }

  // Check if response is successful with proper typing
  static isSuccessResponse<T>(response: ApiResponse<T> | AxiosResponse<T>): boolean {
    // Check for custom ApiResponse format
    if ('success' in response) {
      return response.success === true;
    }

    // Check for Axios response format
    if ('status' in response) {
      return response.status >= 200 && response.status < 300;
    }

    return false;
  }
}

// JWT payload interface for token validation
interface JWTPayload {
  exp: number;
  [key: string]: unknown;
}

// Token management utilities
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
      } catch (error) {
        // Silently handle localStorage errors
        return null;
      }
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
      } catch (error) {
        // Silently handle localStorage errors
        return null;
      }
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      } catch (error) {
        // Silently handle localStorage errors
      }
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload: JWTPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export default ApiUtils;
