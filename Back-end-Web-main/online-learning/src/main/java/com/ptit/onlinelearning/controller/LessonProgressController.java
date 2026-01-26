package com.ptit.onlinelearning.controller;


import com.ptit.onlinelearning.request.CreateLessonProgressRequest;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.ProgressCourseResponse;
import com.ptit.onlinelearning.service.lessonprogress.ILessonProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/lesson-progress")
@RequiredArgsConstructor
public class LessonProgressController {
    private final ILessonProgressService lessonProgressService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<?> createLessonProgress(@Valid @RequestBody CreateLessonProgressRequest createLessonProgressRequest,
                                                  @AuthenticationPrincipal User user) {
        lessonProgressService.createLessonProgress(user.getId(), createLessonProgressRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Lesson progress created successfully"));
    }

    @GetMapping("/course-progress")
    public ResponseEntity<ProgressCourseResponse> viewUserCourseProgress(
            @RequestParam(required = true) Long enrollmentId,
            @RequestParam(required = true) Long courseId,
            @AuthenticationPrincipal User user
    ) {
        ProgressCourseResponse progressCourseResponse = lessonProgressService.viewUserCourseProgress(user.getId(), courseId, enrollmentId);
        return ResponseEntity.status(HttpStatus.OK).body(progressCourseResponse);
    }
}
