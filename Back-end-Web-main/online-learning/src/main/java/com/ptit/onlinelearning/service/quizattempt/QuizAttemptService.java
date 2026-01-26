package com.ptit.onlinelearning.service.quizattempt;


import com.ptit.onlinelearning.request.SubmitAnswerRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.*;
import com.ptit.onlinelearning.repository.AnswerRepository;
import com.ptit.onlinelearning.repository.OptionRepository;
import com.ptit.onlinelearning.repository.QuizAttemptRepository;
import com.ptit.onlinelearning.repository.QuizRepository;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.quiz.QuizAttemptResponse;
import com.ptit.onlinelearning.response.quiz.UserAttemptQuizResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuizAttemptService implements IQuizAttemptService {
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final AnswerRepository answerRepository;
    private final OptionRepository optionRepository;


    @Override
    public QuizAttempt createQuizAttempt(Long quizId, User user) {
        Optional<Quiz> quizResult = quizRepository.findById(quizId);
        if(quizResult.isEmpty()){
            throw  new DataNotFoundException("Quiz not found with id: " + quizId);
        }
        QuizAttempt quizAttempt = QuizAttempt.builder()
                .quiz(quizResult.get())
                .user(user)
                .build();
        quizAttemptRepository.saveAndFlush(quizAttempt);
        return quizAttempt;
    }

    @Override
    public QuizAttemptResponse submitQuizAttempt(SubmitAnswerRequest submitAnswerRequest) {
        Optional<QuizAttempt> quizAttemptResult = quizAttemptRepository.findById(submitAnswerRequest.getQuizAttemptId());
        if(quizAttemptResult.isEmpty()){
            throw new DataNotFoundException("QuizAttempt not found with id: " + submitAnswerRequest.getQuizAttemptId());
        }

        List<Long> optionIds = submitAnswerRequest.getOptionIds();
        boolean isCheckOptionIds = !optionIds.isEmpty() &&
                optionRepository.countByIdIn(optionIds) == optionIds.size();

        if(!isCheckOptionIds){
            throw new DataNotFoundException("One or more Option IDs are invalid.");
        }
        List<Option> optionList = optionRepository.findAllById(submitAnswerRequest.getOptionIds());
        List<Answer> answerList = new ArrayList<>();
        for(Option option : optionList){
            Answer answer = Answer.builder()
                    .option(option)
                    .quizAttempt(quizAttemptResult.get())
                    .build();
            answerList.add(answer);
        }
        answerRepository.saveAll(answerList);
        Integer correctAnswers = (int) optionList.stream()
                .filter(Option::getIsCorrect)
                .count();
        QuizAttempt quizAttempt = quizAttemptResult.get();
        quizAttempt.setCorrectAnswers(correctAnswers);
        quizAttempt.setCompletedAt(java.time.LocalDateTime.now());
        quizAttemptRepository.saveAndFlush(quizAttempt);
        return QuizAttemptResponse.builder()
                .id(quizAttempt.getId())
                .quizId(quizAttempt.getQuiz().getId())
                .completedAt(quizAttempt.getCompletedAt().toString())
                .correctAnswer(quizAttempt.getCorrectAnswers())
                .totalQuestion(quizAttempt.getQuiz().getQuestions().size())
                .createdAt(quizAttempt.getCreatedAt().toString())
                .updatedAt(quizAttempt.getUpdatedAt().toString())
                .build();
    }

    @Override
    public PageableResponse<UserAttemptQuizResponse> getQuizAttemptStatisticsByInstructor(User instructor, Pageable pageable) {
        Page<UserAttemptQuizResponse> page = quizAttemptRepository.findQuizAttemptStatisticsByInstructorId(
                instructor.getId(), 
                pageable
        );
        
        return PageableResponse.<UserAttemptQuizResponse>builder()
                .currentPage(page.getNumber() + 1)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .data(page.getContent())
                .build();
    }
}
