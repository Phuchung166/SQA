import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import cookies from 'js-cookie';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (only on browser)
    try {
      const token =
        typeof window !== 'undefined' && typeof localStorage !== 'undefined'
          ? localStorage.getItem('token')
          : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently ignore localStorage errors on SSR
    }

    // Add language header (only on browser)
    try {
      const locale =
        typeof window !== 'undefined' && typeof localStorage !== 'undefined'
          ? localStorage.getItem('locale') || 'en'
          : 'en';
      if (config.headers) {
        config.headers['Accept-Language'] = locale;
      }
    } catch {
      // Silently ignore localStorage errors on SSR
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  error => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
        case 403:
          // Unauthorized or Forbidden - redirect to login
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              // Clear localStorage completely
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('persist:root');
              
              // Clear cookies
              cookies.remove('user');
              cookies.remove('token');
              
              window.location.href = '/sign-in';
            } catch {
              // Silently handle SSR errors
            }
          }
          break;
        case 404:
          // Not found
          console.error('❌ Resource not found');
          break;
        case 422:
          // Validation error
          console.error('❌ Validation error:', data);
          break;
        case 500:
          // Server error
          console.error('❌ Server error');
          break;
        default:
          console.error('❌ API Error:', error.response);
      }
    } else if (error.request) {
      // Network error
      console.error('❌ Network Error:', error.request);
    } else {
      // Other error
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  },
);

// Create separate axios instance for file uploads
export const axiosUpload: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for file uploads
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Add request interceptor for axiosUpload to include Bearer token
axiosUpload.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (only on browser)
    try {
      const token =
        typeof window !== 'undefined' && typeof localStorage !== 'undefined'
          ? localStorage.getItem('token')
          : null;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silently ignore localStorage errors on SSR
    }

    // Add language header (only on browser)
    try {
      const locale =
        typeof window !== 'undefined' && typeof localStorage !== 'undefined'
          ? localStorage.getItem('locale') || 'en'
          : 'en';
      if (config.headers) {
        config.headers['Accept-Language'] = locale;
      }
    } catch {
      // Silently ignore localStorage errors on SSR
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Upload Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  error => {
    console.error('❌ Upload Request Error:', error);
    return Promise.reject(error);
  },
);

// Add response interceptor for axiosUpload
axiosUpload.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Upload Response:', {
        status: response.status,
        url: response.config.url,
      });
    }

    return response;
  },
  error => {
    // Handle upload errors
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
        case 403:
          // Unauthorized or Forbidden - redirect to login
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              // Clear localStorage completely
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('persist:root');
              
              // Clear cookies
              cookies.remove('user');
              cookies.remove('token');
              
              window.location.href = '/sign-in';
            } catch {
              // Silently handle SSR errors
            }
          }
          break;
          // Payload too large
          console.error('❌ File too large');
          break;
        default:
          console.error('❌ Upload Error:', error.response);
      }
    } else {
      console.error('❌ Upload Network Error:', error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
