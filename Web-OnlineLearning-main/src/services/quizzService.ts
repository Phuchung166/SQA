import axiosInstance from '@/config/axios';

// ==================== Types ====================

export interface QuizOption {
  id: number;
  option_text: string;
  sort_order: number;
  is_correct: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuizOptionInput {
  id?: number;
  option_text: string;
  order: number;
  is_correct: boolean;
  is_deleted?: boolean;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  options: QuizOption[];
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestionInput {
  id?: number;
  question_text: string;
  options: QuizOptionInput[];
  is_deleted?: boolean;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
  is_mandatory: boolean;
}

export interface QuizAttempt {
  id: number;
  correctAnswers: number | null;
  completedAt: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizSubmitRequest {
  option_ids: number[];
  quiz_attempt_id: number;
}

export interface QuizSubmitResponse {
  id: number;
  quiz_id: number;
  correct_answer: number;
  total_question: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
  passed?: boolean;
}

export interface ImportQuestionsRequest {
  description: string;
  title: string;
  moduleId: number;
  file: File;
  isMandatory: boolean;
}

export interface ImportQuestionsResponse {
  message: string;
}

export interface UpdateQuizRequest {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestionInput[];
}

export interface UpdateQuizResponse {
  id: number;
  title: string;
  description: string;
  is_mandatory: boolean;
  questions: QuizQuestion[];
}

export interface UpdateStatusQuizResponse {
  message: string;
}

export interface InstructorQuizzesResponse {
  id: number;
  title: string;
  description: string;
  is_mandatory: boolean;
  questions: QuizQuestion[];
}

export interface QuizStatisticItem {
  quiz_id: number;
  quiz_title: string;
  total_attempts: number;
  course_module_id: number;
  course_module_name: string;
  course_name: string;
  is_active?: boolean;
}

export interface QuizStatisticResponse {
  current_page: number;
  total_pages: number;
  total_elements: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  data: QuizStatisticItem[];
}

// ==================== Quiz Attempts ====================

/**
 * Tạo một lần attempt khi bắt đầu làm bài quiz
 * POST /quiz-attempts
 * @param quiz_id - ID của quiz
 * @returns QuizAttempt object
 */
export const createQuizAttempt = async (quiz_id: number): Promise<QuizAttempt> => {
  try {
    const response = await axiosInstance.post<QuizAttempt>('/quiz-attempts', {
      quiz_id,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create quiz attempt');
  }
};

/**
 * Submit đáp án của quiz
 * POST /quiz-attempts/submit
 * @param option_ids - Danh sách ID của các option được chọn
 * @param quiz_attempt_id - ID của quiz attempt
 * @returns QuizSubmitResponse object
 */
export const submitQuizAnswers = async (
  payload: QuizSubmitRequest,
): Promise<QuizSubmitResponse> => {
  try {
    const response = await axiosInstance.post<QuizSubmitResponse>('/quiz-attempts/submit', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to submit quiz answers');
  }
};

// ==================== Quiz Management ====================

/**
 * Lấy thông tin chi tiết của một quiz kèm theo tất cả các câu hỏi và đáp án
 * GET /quizzes/{id}
 * @param id - ID của quiz
 * @returns Quiz object
 */
export const getQuizById = async (id: number): Promise<Quiz> => {
  try {
    const response = await axiosInstance.get<Quiz>(`/quizzes/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch quiz');
  }
};

/**
 * Cập nhật trạng thái is_active của quiz (toggle active/inactive)
 * PATCH /quizzes/{id}
 * @param id - ID của quiz
 * @returns UpdateStatusQuizResponse object
 */
export const updateStatusQuiz = async (id: number): Promise<UpdateStatusQuizResponse> => {
  try {
    const response = await axiosInstance.patch<UpdateStatusQuizResponse>(`/quizzes/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update quiz status');
  }
};

/**
 * Import các câu hỏi từ file Excel vào quiz
 * POST /quizzes/import-questions
 * @param payload - FormData object chứa title, description, moduleId và file
 * @returns ImportQuestionsResponse object
 */
export const importQuizQuestions = async (
  payload: ImportQuestionsRequest,
): Promise<ImportQuestionsResponse> => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('moduleId', payload.moduleId.toString());
    formData.append('file', payload.file);
    formData.append('isMandatory', payload.isMandatory ? 'true' : 'false');

    const response = await axiosInstance.post<ImportQuestionsResponse>(
      '/quizzes/import-questions',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to import quiz questions');
  }
};

/**
 * Cập nhật một quiz (các câu hỏi và tùy chọn)
 * PATCH /quizzes/update
 * @param payload - UpdateQuizRequest object chứa id, title, description và questions
 *                  - Nếu question/option có is_deleted: true => xóa
 *                  - Nếu question/option không có id và is_deleted không phải true => tạo mới
 * @returns UpdateQuizResponse object
 */
export const updateQuiz = async (payload: UpdateQuizRequest): Promise<UpdateQuizResponse> => {
  try {
    const response = await axiosInstance.patch<UpdateQuizResponse>('/quizzes/update', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update quiz');
  }
};

/**
 * Lấy danh sách bài kiểm tra của giảng viên
 * GET /quizzes/instructor/{id}
 * @param id - ID của quiz
 * @returns Danh sách quizzes của giảng viên
 */
export const getInstructorQuizzes = async (id: number): Promise<InstructorQuizzesResponse[]> => {
  try {
    const response = await axiosInstance.get<InstructorQuizzesResponse[]>(
      `/quizzes/instructor/${id}`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch instructor quizzes');
  }
};

/**
 * Lấy danh sách thống kê quiz của giảng viên
 * GET /quiz-attempts/instructor/statistic
 * @param page - Trang hiện tại (bắt đầu từ 0)
 * @param size - Số lượng items mỗi trang
 * @returns QuizStatisticResponse object chứa danh sách thống kê quiz
 */
export const getInstructorQuizStatistic = async (
  page: number = 1,
  size: number = 10,
): Promise<QuizStatisticResponse> => {
  try {
    const response = await axiosInstance.get<QuizStatisticResponse>(
      '/quiz-attempts/instructor/statistics',
      {
        params: {
          page,
          size,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch quiz statistics');
  }
};

export default {
  createQuizAttempt,
  submitQuizAnswers,
  getQuizById,
  updateStatusQuiz,
  importQuizQuestions,
  updateQuiz,
  getInstructorQuizzes,
  getInstructorQuizStatistic,
};
