package com.ptit.onlinelearning.service.quizattempt;

import com.ptit.onlinelearning.request.SubmitAnswerRequest;
import com.ptit.onlinelearning.model.QuizAttempt;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.quiz.QuizAttemptResponse;
import com.ptit.onlinelearning.response.quiz.UserAttemptQuizResponse;
import org.springframework.data.domain.Pageable;

public interface IQuizAttemptService {
    QuizAttempt createQuizAttempt(Long quizId, User user);
    QuizAttemptResponse submitQuizAttempt(SubmitAnswerRequest submitAnswerRequest);
    PageableResponse<UserAttemptQuizResponse> getQuizAttemptStatisticsByInstructor(User instructor, Pageable pageable);
}
