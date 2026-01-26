import { useState, useEffect, useCallback } from 'react';
import { ApiUtils } from '@/utils/apiUtils';
import { User, CoursesRequest } from '@/types/api';

// Generic API hook
export function useApi<T>(apiFunction: () => Promise<T>, dependencies: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(ApiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFunction, ...dependencies]);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

// Auth hooks
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.login(credentials);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser({
          email: credentials.email,
          roles: response.roles,
          account_name: credentials.email,
        } as any);
        return response;
      }
    } catch (err) {
      setError(ApiUtils.handleError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const register = async (userData: {
    account_name: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'INSTRUCTOR';
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { authService } = await import('@/services/authService');
      const response = await authService.register(userData);

      if (response) {
        return response;
      }
    } catch (err) {
      setError(ApiUtils.handleError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
  };
}

// Courses hooks
export function useCourses(params?: CoursesRequest) {
  return useApi(async () => {
    const { getCourses } = await import('@/services/courseService');
    const response = await getCourses(params as any);
    return response.data;
  }, [JSON.stringify(params)]);
}

export function useCourse(id: string) {
  return useApi(async () => {
    if (!id) return null;
    const { getCourseById } = await import('@/services/courseService');
    const response = await getCourseById(parseInt(id));
    return response;
  }, [id]);
}

// Mutation hook for async operations
export function useMutation<T, P>(mutationFn: (params: P) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(params);
        return result;
      } catch (err) {
        const errorMessage = ApiUtils.handleError(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn],
  );

  return { mutate, loading, error };
}
