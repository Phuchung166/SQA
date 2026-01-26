package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.CreateQuizAttemptRequest;
import com.ptit.onlinelearning.request.SubmitAnswerRequest;
import com.ptit.onlinelearning.model.QuizAttempt;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.quiz.QuizAttemptResponse;
import com.ptit.onlinelearning.response.quiz.UserAttemptQuizResponse;
import com.ptit.onlinelearning.service.quizattempt.IQuizAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/quiz-attempts")
@RequiredArgsConstructor
public class QuizAttemptController {
    private final IQuizAttemptService quizAttemptService;


    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Create a new quiz attempt for the authenticated user")
    public ResponseEntity<QuizAttempt> createQuizAttempt(@Valid @RequestBody CreateQuizAttemptRequest createQuizAttemptRequest,
                                                         @AuthenticationPrincipal User user) {
        QuizAttempt result = quizAttemptService.createQuizAttempt(createQuizAttemptRequest.getQuizId(), user);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit answers for a quiz attempt")
    public ResponseEntity<QuizAttemptResponse> submitQuizAttempt(@Valid @RequestBody SubmitAnswerRequest submitAnswerRequest,
                                                                 @AuthenticationPrincipal User user) {
        QuizAttemptResponse result = quizAttemptService.submitQuizAttempt(submitAnswerRequest);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/instructor/statistics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Get quiz attempt statistics for instructor's quizzes with pagination")
    public ResponseEntity<PageableResponse<UserAttemptQuizResponse>> getQuizAttemptStatistics(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        PageableResponse<UserAttemptQuizResponse> statistics = quizAttemptService.getQuizAttemptStatisticsByInstructor(user, pageable);
        return ResponseEntity.ok(statistics);
    }
}
