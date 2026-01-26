package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.LessonRequest;
import com.ptit.onlinelearning.request.UpdateLessonRequest;
import com.ptit.onlinelearning.model.Lesson;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.LessonResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.lesson.ILessonService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/lessons")
@RequiredArgsConstructor
public class LessonController {
    private final ILessonService lessonService;

    @GetMapping
    @Operation(summary = "Get paginated list of lessons with moduleId",
            description = "Retrieve a paginated list of lessons with optional filtering and sorting")
    public ResponseEntity<PageableResponse<LessonResponse>> getLessons(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) Boolean isMandatory,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        Page<Lesson> lessonPage = lessonService.getLessons(
                page, pageSize, moduleId, search, contentType, isMandatory, sortBy, sortOrder
        );
        List<LessonResponse> data = lessonPage.getContent()
                .stream()
                .map(LessonResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(
                new PageableResponse<>(
                        lessonPage.getNumber() + 1,
                        lessonPage.getTotalPages(),
                        lessonPage.getTotalElements(),
                        lessonPage.getSize(),
                        lessonPage.hasNext(),
                        lessonPage.hasPrevious(),
                        data
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lesson by ID", description = "Retrieve a specific lesson by its ID")
    public ResponseEntity<LessonResponse> getLessonById(
            @PathVariable Long id
    ) {
        Lesson lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(LessonResponse.fromEntity(lesson));
    }


    @PostMapping
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<LessonResponse> createLesson(
            @Valid @RequestBody LessonRequest lessonRequest,
            @AuthenticationPrincipal User user
    ) {
        Lesson lesson = lessonService.createLesson(lessonRequest, user.getInstructor());
        return ResponseEntity.status(HttpStatus.CREATED).body(LessonResponse.fromEntity(lesson));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLessonRequest updateLessonRequest,
            @AuthenticationPrincipal User user
    ) {
        Lesson lesson = lessonService.updateLesson(id, updateLessonRequest, user.getInstructor());
        return ResponseEntity.ok(LessonResponse.fromEntity(lesson));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        lessonService.deleteLesson(id, user.getInstructor());
        return ResponseEntity.noContent().build();
    }
}
