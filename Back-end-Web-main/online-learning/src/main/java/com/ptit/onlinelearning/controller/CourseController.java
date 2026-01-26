package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.common.type.CourseStatus;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.request.CourseRequest;
import com.ptit.onlinelearning.request.UpdateCourseRequest;
import com.ptit.onlinelearning.request.UpdateCourseStatusRequest;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.PublishCourseResponse;
import com.ptit.onlinelearning.response.course.CoursePreOrderResponse;
import com.ptit.onlinelearning.response.course.CourseResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.course.ICourseService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;


@RestController
@RequestMapping("${api.prefix}/courses")
@RequiredArgsConstructor
public class CourseController {

    private final ICourseService courseService;

    @GetMapping
    public ResponseEntity<PageableResponse<CourseResponse>> getCourses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CourseStatus status,
            @RequestParam(required = false) EnrollmentType enrollmentType,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ){
        Page<Course> coursePage = courseService.getCourses(
                page, pageSize, categoryId,
                search, status,
                sortBy, sortOrder, enrollmentType
        );
        List<CourseResponse> data = coursePage.getContent()
                .stream()
                .map(CourseResponse::fromEntity)
                .toList();

        PageableResponse<CourseResponse> pageableResponse = new PageableResponse<>(
                coursePage.getNumber() + 1,
                coursePage.getTotalPages(),
                coursePage.getTotalElements(),
                coursePage.getSize(),
                coursePage.hasNext(),
                coursePage.hasPrevious(),
                data
        );

        return ResponseEntity.ok(pageableResponse);
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Create a new course", description = "Creates a new course. Instructor role required.")
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CourseRequest courseRequest,
            @AuthenticationPrincipal User user
    ){
        Course course = courseService.createCourse(courseRequest, user.getInstructor());
        return ResponseEntity.status(HttpStatus.CREATED).body(CourseResponse.fromEntity(course));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest updateCourseRequest,
            @AuthenticationPrincipal User user
    ){
        Course course = courseService.updateCourse(id, updateCourseRequest, user.getInstructor());
        return ResponseEntity.ok(CourseResponse.fromEntity(course));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id){
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(CourseResponse.fromEntity(course));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ){
        courseService.deleteCourse(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Approve or reject a course", description = "Approves or rejects a course. Admin role required.")
    public ResponseEntity<CourseResponse> updateCourseStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseStatusRequest updateCourseStatusRequest)  {
        Course updatedCourse = courseService.updateCourseStatus(id, updateCourseStatusRequest);
        return ResponseEntity.ok(CourseResponse.fromEntity(updatedCourse));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Publish a course", description = "Publishes a course for admin approval. Instructor role required.")
    public ResponseEntity<PublishCourseResponse> publishCourse(@PathVariable Long id) throws IOException {
        Course course = courseService.publishCourse(id);
        PublishCourseResponse response  = PublishCourseResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .instructorId(course.getInstructorId())
                .instructorAccountName(course.getInstructor().getUser().getAccountName())
                .submittedAt(course.getPublishedAt().toString())
                .message("Course published successfully, waiting for admin approval.")
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pre-order")
    @Operation(summary = "Get pre-order courses", description = "Returns a pageable list of courses currently in pre-order status.")
    public ResponseEntity<PageableResponse<CoursePreOrderResponse>> getPreOrderCourses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "preOrderStartDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        Page<Course> coursePage = courseService.getPreOrderCourses(page, pageSize, sortBy, sortOrder);
        List<CoursePreOrderResponse> data = coursePage.getContent()
                .stream()
                .map(CoursePreOrderResponse::fromEntity)
                .toList();

        PageableResponse<CoursePreOrderResponse> pageableResponse = new PageableResponse<>(
                coursePage.getNumber() + 1,
                coursePage.getTotalPages(),
                coursePage.getTotalElements(),
                coursePage.getSize(),
                coursePage.hasNext(),
                coursePage.hasPrevious(),
                data
        );

        return ResponseEntity.ok(pageableResponse);
    }
}
