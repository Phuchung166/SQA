package com.ptit.onlinelearning.controller;


import com.ptit.onlinelearning.request.ImportQuestionRequest;
import com.ptit.onlinelearning.model.Quiz;
import com.ptit.onlinelearning.request.UpdateQuizRequest;
import com.ptit.onlinelearning.response.MessageResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.quiz.QuizDetailResponse;
import com.ptit.onlinelearning.response.quiz.QuizStatisticResponse;
import com.ptit.onlinelearning.service.quiz.IQuizService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("${api.prefix}/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final IQuizService quizService;


    @PostMapping(value = "/import-questions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Import questions from an Excel file",
            description = "Imports quiz questions from an uploaded Excel file (.xlsx or .xls format)")
    public ResponseEntity<MessageResponse> importQuestions(@ModelAttribute @Valid ImportQuestionRequest
                                                                   importQuestionRequest) {
        String fileName = importQuestionRequest.getFile().getOriginalFilename();
        assert fileName != null;
        if(!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Invalid file format. Only Excel files are allowed."));
        }
        MessageResponse result =  quizService.importQuestions(importQuestionRequest.getDescription(),
                importQuestionRequest.getTitle(), importQuestionRequest.getModuleId(), importQuestionRequest.getFile(), importQuestionRequest.getIsMandatory());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_INSTRUCTOR', 'ROLE_STUDENT')")
    @Operation(summary = "Get quiz by ID",
            description = "Retrieves the details of a quiz by its unique identifier.")
    public ResponseEntity<QuizDetailResponse> getQuizById(@PathVariable Long id){
        QuizDetailResponse result = quizService.getQuizById(id);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/instructor/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get quiz by ID for instructor",
            description = "Retrieves the details of a quiz including correct answers. Only accessible by instructors.")
    public ResponseEntity<QuizDetailResponse> getQuizByIdForInstructor(@PathVariable Long id){
        QuizDetailResponse result = quizService.getQuizByIdForInstructor(id);
        return ResponseEntity.ok(result);
    }



    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get quiz statistics by module ID",
            description = "Retrieves paginated quiz statistics for a specific course")
    public ResponseEntity<PageableResponse<QuizStatisticResponse>> getQuizStatisticsByModuleId(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam Long courseId) {
        PageableResponse<QuizStatisticResponse> response =
            quizService.getQuizStatisticsByModuleId(page, pageSize, courseId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/update")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Update quiz details",
            description = "Updates the details of an existing quiz")
    public ResponseEntity<QuizDetailResponse> updateQuiz(@RequestBody UpdateQuizRequest updateQuizRequest){
        QuizDetailResponse result = quizService.updateQuiz(updateQuizRequest);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Toggle quiz active status",
            description = "Toggles the isActive flag of a quiz between true and false")
    public ResponseEntity<MessageResponse> toggleQuizStatus(@PathVariable Long id) {
        String message = quizService.toggleQuizStatus(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }
}
