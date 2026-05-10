package com.ptit.onlinelearning.service.quizattempt;

import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.AnswerRepository;
import com.ptit.onlinelearning.repository.OptionRepository;
import com.ptit.onlinelearning.repository.QuizAttemptRepository;
import com.ptit.onlinelearning.repository.QuizRepository;
import com.ptit.onlinelearning.request.SubmitAnswerRequest;
import com.ptit.onlinelearning.response.quiz.QuizAttemptResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho QuizAttemptService
 * Technique: EP + CheckDB
 */
@ExtendWith(MockitoExtension.class)
class QuizAttemptServiceTest {

    @Mock private QuizAttemptRepository quizAttemptRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private AnswerRepository answerRepository;
    @Mock private OptionRepository optionRepository;

    @InjectMocks
    private QuizAttemptService quizAttemptService;

    private User mockUser;
    private Quiz mockQuiz;
    private QuizAttempt mockAttempt;
    private Option opt1;
    private Option opt2;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).build();
        mockQuiz = Quiz.builder().id(10L).questions(new HashSet<>()).build();
        
        Question q1 = new Question(); q1.setId(100L);
        Question q2 = new Question(); q2.setId(101L);
        mockQuiz.getQuestions().add(q1);
        mockQuiz.getQuestions().add(q2);

        mockAttempt = QuizAttempt.builder().id(99L).quiz(mockQuiz).user(mockUser).build();
        mockAttempt.setCreatedAt(java.time.LocalDateTime.now());
        mockAttempt.setUpdatedAt(java.time.LocalDateTime.now());

        opt1 = new Option(); opt1.setId(50L); opt1.setIsCorrect(true);
        opt2 = new Option(); opt2.setId(51L); opt2.setIsCorrect(false);
    }

    // TC-QAT-001: createQuizAttempt - Success
    @Test
    @DisplayName("TC-QAT-001: Tạo QuizAttempt thành công -> CheckDB save")
    void createQuizAttempt_success() {
        when(quizRepository.findById(10L)).thenReturn(Optional.of(mockQuiz));
        when(quizAttemptRepository.saveAndFlush(any(QuizAttempt.class))).thenAnswer(i -> {
            QuizAttempt qa = i.getArgument(0);
            qa.setId(99L);
            return qa;
        });

        QuizAttempt result = quizAttemptService.createQuizAttempt(10L, mockUser);

        verify(quizAttemptRepository, times(1)).saveAndFlush(any(QuizAttempt.class));
        assertThat(result.getQuiz().getId()).isEqualTo(10L);
        assertThat(result.getUser().getId()).isEqualTo(1L);
    }

    // TC-QAT-002: createQuizAttempt - Not Found
    @Test
    @DisplayName("TC-QAT-002: Tạo QuizAttempt cho Quiz không tồn tại -> DataNotFoundException")
    void createQuizAttempt_notFound() {
        when(quizRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizAttemptService.createQuizAttempt(10L, mockUser))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-QAT-003: submitQuizAttempt - Success
    @Test
    @DisplayName("TC-QAT-003: Nộp bài Quiz thành công -> CheckDB lưu câu trả lời, tính đúng điểm")
    void submitQuizAttempt_success() {
        SubmitAnswerRequest req = new SubmitAnswerRequest();
        req.setQuizAttemptId(99L);
        req.setOptionIds(List.of(50L, 51L));

        when(quizAttemptRepository.findById(99L)).thenReturn(Optional.of(mockAttempt));
        when(optionRepository.countByIdIn(anyList())).thenReturn(2L);
        when(optionRepository.findAllById(anyList())).thenReturn(List.of(opt1, opt2));
        
        when(answerRepository.saveAll(anyList())).thenReturn(new ArrayList<>());
        when(quizAttemptRepository.saveAndFlush(any(QuizAttempt.class))).thenAnswer(i -> i.getArgument(0));

        QuizAttemptResponse res = quizAttemptService.submitQuizAttempt(req);

        // Verify save Answer
        verify(answerRepository, times(1)).saveAll(anyList());
        verify(quizAttemptRepository, times(1)).saveAndFlush(mockAttempt);
        
        // 1 correct out of 2 submitted options
        assertThat(res.getCorrectAnswer()).isEqualTo(1);
        assertThat(res.getTotalQuestion()).isEqualTo(2); // as defined in mockQuiz
    }
    // TC-QAT-004: submitQuizAttempt - Toàn bộ câu trả lời đều sai
    @Test
    @DisplayName("TC-QAT-004: Nộp bài với tất cả câu trả lời đều sai -> CorrectAnswer = 0")
    void submitQuizAttempt_allWrong_returnsZeroCorrect() {
        SubmitAnswerRequest req = new SubmitAnswerRequest();
        req.setQuizAttemptId(99L);
        req.setOptionIds(List.of(51L)); // opt2 là sai

        when(quizAttemptRepository.findById(99L)).thenReturn(Optional.of(mockAttempt));
        when(optionRepository.countByIdIn(anyList())).thenReturn(1L);
        when(optionRepository.findAllById(anyList())).thenReturn(List.of(opt2));
        
        QuizAttemptResponse res = quizAttemptService.submitQuizAttempt(req);

        assertThat(res.getCorrectAnswer()).isEqualTo(0);
        assertThat(res.getTotalQuestion()).isEqualTo(2);
    }

    // TC-QAT-005: submitQuizAttempt - Nộp danh sách option rỗng (bỏ bài)
    @Test
    @DisplayName("TC-QAT-005: Nộp bài không chọn đáp án nào -> DataNotFoundException")
    void submitQuizAttempt_emptyOptions_throwsException() {
        SubmitAnswerRequest req = new SubmitAnswerRequest();
        req.setQuizAttemptId(99L);
        req.setOptionIds(List.of());

        when(quizAttemptRepository.findById(99L)).thenReturn(Optional.of(mockAttempt));
        
        assertThatThrownBy(() -> quizAttemptService.submitQuizAttempt(req))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-QAT-006: submitQuizAttempt - OptionId không tồn tại
    @Test
    @DisplayName("TC-QAT-006: Nộp OptionId không tồn tại -> DataNotFoundException")
    void submitQuizAttempt_optionIdNotFound_throwsException() {
        SubmitAnswerRequest req = new SubmitAnswerRequest();
        req.setQuizAttemptId(99L);
        req.setOptionIds(List.of(999L));

        when(quizAttemptRepository.findById(99L)).thenReturn(Optional.of(mockAttempt));
        when(optionRepository.countByIdIn(anyList())).thenReturn(0L);

        assertThatThrownBy(() -> quizAttemptService.submitQuizAttempt(req))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-QAT-007: submitQuizAttempt - AttemptId không tồn tại
    @Test
    @DisplayName("TC-QAT-007: Nộp bài cho attemptId không tồn tại -> DataNotFoundException")
    void submitQuizAttempt_attemptIdNotFound_throwsException() {
        SubmitAnswerRequest req = new SubmitAnswerRequest();
        req.setQuizAttemptId(888L);

        when(quizAttemptRepository.findById(888L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizAttemptService.submitQuizAttempt(req))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-QAT-008: submitQuizAttempt - Kiểm tra điểm số multi-choice
    @Test
    @DisplayName("TC-QAT-008: Nộp nhiều option đúng -> CorrectAnswer tăng tương ứng")
    void submitQuizAttempt_multipleCorrectOptions_calculatesCorrectly() {
        SubmitAnswerRequest req = new SubmitAnswerRequest();
        req.setQuizAttemptId(99L);
        
        Option opt3 = new Option(); opt3.setId(52L); opt3.setIsCorrect(true);
        req.setOptionIds(List.of(50L, 52L)); // 2 đáp án đúng

        when(quizAttemptRepository.findById(99L)).thenReturn(Optional.of(mockAttempt));
        when(optionRepository.countByIdIn(anyList())).thenReturn(2L);
        when(optionRepository.findAllById(anyList())).thenReturn(List.of(opt1, opt3));
        
        QuizAttemptResponse res = quizAttemptService.submitQuizAttempt(req);

        assertThat(res.getCorrectAnswer()).isEqualTo(2);
    }
}



