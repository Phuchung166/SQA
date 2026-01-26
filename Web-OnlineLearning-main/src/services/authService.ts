import axios from '@/config/axios';
import { parseApiError } from './apiError';
import { User } from '@/redux/slices/authSlice';

export interface RegisterPayload {
  account_name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface VerifyEmailPayload {
  code: string;
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyForgotPasswordPayload {
  email: string;
  code: string;
}

export interface ChangePasswordPayload {
  email: string;
  reset_token: string;
  new_password: string;
  retype_password: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

export interface LoginResponse {
  tokenType: string;
  id: number;
  username: string;
  roles: string[];
  token: string;
}

export interface UserResponse {
  phone: string;
  first_name: string;
  last_name: string;
  avatar: string;
  gender: string;
  account_name: string;
  date_of_birth: string;
  bio: string;
}

class AuthService {
  private baseUrl = 'auth';

  /**
   * Register a new user
   * @param payload - RegisterPayload
   * @returns Promise<AuthResponse>
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/register`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Login user
   * @param payload - LoginPayload
   * @returns Promise<LoginResponse>
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Resend OTP to email
   * @param payload - ResendOtpPayload
   * @returns Promise<{ message: string }>
   */
  async resendOtp(payload: ResendOtpPayload): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/resend-otp`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Verify email with code
   * @param payload - VerifyEmailPayload
   * @returns Promise<{ message: string }>
   */
  async verifyEmail(payload: VerifyEmailPayload): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/verify-email`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Get current user info (requires Bearer token)
   * @returns Promise<UserResponse>
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await axios.get('users/profile');
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Request forgot password - Step 1
   * @param payload - ForgotPasswordPayload
   * @returns Promise<{ message: string }>
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/forgot-password`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Verify forgot password code - Step 2
   * @param payload - VerifyForgotPasswordPayload
   * @returns Promise<{ message: string; resetToken: string }>
   */
  async verifyForgotPassword(
    payload: VerifyForgotPasswordPayload,
  ): Promise<{ message: string; resetToken: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/verify-forgot-password`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }

  /**
   * Change password with reset token - Step 3
   * @param payload - ChangePasswordPayload
   * @returns Promise<{ message: string }>
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    try {
      const response = await axios.patch(`${this.baseUrl}/change-password`, payload);
      return response.data;
    } catch (error: unknown) {
      return Promise.reject(parseApiError(error));
    }
  }
}

export const authService = new AuthService();
export default authService;
