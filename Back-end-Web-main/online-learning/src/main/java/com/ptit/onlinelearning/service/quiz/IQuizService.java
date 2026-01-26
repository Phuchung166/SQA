package com.ptit.onlinelearning.service.quiz;

import com.ptit.onlinelearning.model.Quiz;
import com.ptit.onlinelearning.request.UpdateQuizRequest;
import com.ptit.onlinelearning.response.MessageResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.quiz.QuizDetailResponse;
import com.ptit.onlinelearning.response.quiz.QuizStatisticResponse;
import org.springframework.web.multipart.MultipartFile;

public interface IQuizService {
    MessageResponse importQuestions(String description, String title, Long moduleId, MultipartFile file, Boolean isMandatory);

    QuizDetailResponse getQuizById(Long id);

    QuizDetailResponse getQuizByIdForInstructor(Long id);

    PageableResponse<QuizStatisticResponse> getQuizStatisticsByModuleId(int page, int pageSize, Long courseId);


    String toggleQuizStatus(Long id);


    QuizDetailResponse updateQuiz(UpdateQuizRequest updateQuizRequest);
}
