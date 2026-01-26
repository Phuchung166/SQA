package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.request.EnrollmentRequest;
import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseGroupResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.enrollment.IEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final IEnrollmentService enrollmentService;

//    @GetMapping
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    public ResponseEntity<PageableResponse<EnrollmentResponse>> getEnrollments(
//            @RequestParam(defaultValue = "1") int page,
//            @RequestParam(defaultValue = "10") int pageSize,
//            @RequestParam(defaultValue = "createdAt") String sortBy,
//            @RequestParam(defaultValue = "desc") String sortOrder,
//            @RequestParam(required = false) String search,
//            @RequestParam(required = false) Long userId,
//            @RequestParam(required = false) Long courseId
//    ){
//        Page<Enrollment> enrollmentPage = enrollmentService.getEnrollments(page, pageSize, sortBy, sortOrder, search, userId, courseId);
//        List<EnrollmentResponse> data = enrollmentPage.getContent()
//                .stream()
//                .map(EnrollmentResponse::fromEntity)
//                .toList();
//        PageableResponse<EnrollmentResponse> response = new PageableResponse<>(
//                enrollmentPage.getNumber() + 1,
//                enrollmentPage.getTotalPages(),
//                enrollmentPage.getTotalElements(),
//                enrollmentPage.getSize(),
//                enrollmentPage.hasNext(),
//                enrollmentPage.hasPrevious(),
//                data
//        );
//        return ResponseEntity.ok(response);
//    }

//    @GetMapping("{id}")
//    @PreAuthorize("hasRole('ROLE_STUDENT')")
//    public ResponseEntity<EnrollmentResponse> getEnrollmentById(
//            @PathVariable Long id,
//            @AuthenticationPrincipal User user
//    ){
//        Enrollment enrollment =  enrollmentService.getEnrollmentById(id, user);
//        return ResponseEntity.ok(EnrollmentResponse.fromEntity(enrollment));
//    }


    @GetMapping("/user")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<PageableResponse<EnrollmentResponse>> getUserEnrollments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User user
    ) {
        PageableResponse<EnrollmentResponse> response = enrollmentService.getEnrollmentsByUserId(page, pageSize, sortBy, sortOrder, search, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-courses")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Get all courses standalone enrolled by user",
            description = "Retrieve a paginated and sorted list of all courses that the authenticated user is enrolled in.")
    public ResponseEntity<PageableResponse<EnrollmentCourseResponse>> getAllCoursesEnrolledByUser(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User user
    ) {
        PageableResponse<EnrollmentCourseResponse> response = enrollmentService.getAllCoursesEnrolledByUser(page, pageSize, sortBy, sortOrder, search, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-courses-groups")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Get all courses groups enrolled by user",
            description = "Retrieve a paginated and sorted list of all courses groups that the authenticated user is enrolled in.")
    public ResponseEntity<PageableResponse<EnrollmentCourseResponse>> getAllCoursesGroupsEnrolledByUser(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User user
    ) {
        PageableResponse<EnrollmentCourseResponse> response = enrollmentService.getAllCourseGroupsEnrolledByUser(page, pageSize, search, user.getId());
        return ResponseEntity.ok(response);
    }



    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Enrollment> createEnrollment(
            @Valid @RequestBody EnrollmentRequest enrollmentRequest,
            @AuthenticationPrincipal User user
    ){
        Enrollment enrollment = enrollmentService.createEnrollment(user, enrollmentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @PostMapping("/group/{courseGroupId}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Map<String, Object>> createEnrollmentGroup(
            @PathVariable Long courseGroupId,
            @AuthenticationPrincipal User user){
        enrollmentService.createEnrollment(user, courseGroupId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Enroll success with course group id: " + courseGroupId));
    }

    @GetMapping("/course-group/{courseGroupId}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<EnrollmentCourseGroupResponse> getEnrollmentCourseGroupDetail(@PathVariable Long courseGroupId,
                                                                                        @AuthenticationPrincipal User user){
        EnrollmentCourseGroupResponse response = enrollmentService.getEnrollmentCourseGroupDetail(courseGroupId, user.getId());
        return ResponseEntity.ok(response);
    }


    @GetMapping("/check-enrollment")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Check user enrollment course",
            description = "Check if the authenticated user is enrolled in a specific course or course group. " +
                    "Returns enrollmentId for STANDALONE courses if enrolled.")
    ResponseEntity<Map<String, Object>> checkUserEnrollmentCourse(
            @RequestParam(required = true) Long courseId,
            @RequestParam(required = true) CourseType courseType,
            @RequestParam(required = false) Boolean checkPreOrder,
            @AuthenticationPrincipal User user
            ){
        Map<String, Object> result = enrollmentService.checkEnrollmentCourse(courseId, courseType, user.getId(), checkPreOrder);
        return ResponseEntity.ok(result);
    }

}
