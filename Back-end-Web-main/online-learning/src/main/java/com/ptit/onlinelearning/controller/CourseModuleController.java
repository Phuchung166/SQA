package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.CourseModuleRequest;
import com.ptit.onlinelearning.request.UpdateCourseModuleRequest;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.course.CourseModuleResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.coursemodule.ICourseModuleService;
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
@RequestMapping("${api.prefix}/course-modules")
@RequiredArgsConstructor
public class CourseModuleController {

    private final ICourseModuleService courseModuleService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<CourseModuleResponse> createCourseModule(
            @Valid @RequestBody CourseModuleRequest courseModuleRequest,
            @AuthenticationPrincipal User user
    ){
        CourseModule courseModule = courseModuleService.createCourseModule(courseModuleRequest, user.getInstructor());
        return ResponseEntity.status(HttpStatus.CREATED).body(CourseModuleResponse.fromEntity(courseModule));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<CourseModuleResponse> updateCourseModule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseModuleRequest updateCourseModuleRequest,
            @AuthenticationPrincipal User user
    ){
        CourseModule courseModule = courseModuleService.updateCourseModule(id, updateCourseModuleRequest, user.getInstructor());
        return ResponseEntity.ok(CourseModuleResponse.fromEntity(courseModule));
    }

    @GetMapping
    @Operation(summary = "Get paginated list of course modules with courseId",
               description = "Retrieve a paginated list of course modules with optional filtering and sorting")
    public ResponseEntity<PageableResponse<CourseModuleResponse>> getCourseModules(
            @RequestParam(required = false) Long courseId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Boolean isPreview,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ){
        Page<CourseModule> courseModulePage = courseModuleService.getCourseModules(
                courseId, page , pageSize,
                isPreview, search,
                sortBy, sortOrder
        );
        List<CourseModuleResponse> data = courseModulePage.getContent()
                .stream()
                .map(CourseModuleResponse::fromEntityForPublic)
                .toList();

        PageableResponse<CourseModuleResponse> pageableResponse = new PageableResponse<>(
                courseModulePage.getNumber() + 1,
                courseModulePage.getTotalPages(),
                courseModulePage.getTotalElements(),
                courseModulePage.getSize(),
                courseModulePage.hasNext(),
                courseModulePage.hasPrevious(),
                data
        );

        return ResponseEntity.ok(pageableResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseModuleResponse> getCourseModuleById(@PathVariable Long id){
        CourseModule courseModule = courseModuleService.getCourseModuleById(id);
        return ResponseEntity.ok(CourseModuleResponse.fromEntityForPublic(courseModule));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourseModule(@PathVariable Long id, @AuthenticationPrincipal User user){
        courseModuleService.deleteCourseModule(id, user.getInstructor());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/enrolled-user")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "get course modules of enrolled user in a course",
            description = "Retrieve a paginated and sorted list of course modules for a user enrolled in a specific course.")
    public ResponseEntity<PageableResponse<CourseModuleResponse>> getCourseModulesOfEnrolledUser(
            @RequestParam(required = true) Long courseId,
            @RequestParam(required = true) Long enrollmentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @AuthenticationPrincipal User user
    ){
        PageableResponse<CourseModuleResponse> result = courseModuleService.getAllCourseModulesOfUserEnrolledInCourse(
                user.getId(),
                enrollmentId,
                courseId,
                page,
                pageSize,
                sortBy,
                sortOrder
        );
        return  ResponseEntity.ok(result);
    }


}
