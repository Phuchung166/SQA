package com.ptit.onlinelearning.controller;


import com.fasterxml.jackson.annotation.JsonView;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.response.course.CourseModuleResponse;
import com.ptit.onlinelearning.response.instructor.InstructorAdminResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.SystemStatisticsResponse;
import com.ptit.onlinelearning.response.UserResponse;
import com.ptit.onlinelearning.response.view.Views;
import com.ptit.onlinelearning.service.admin.IAdminService;
import com.ptit.onlinelearning.service.coursemodule.ICourseModuleService;
import com.ptit.onlinelearning.service.instructor.IInstructorService;
import com.ptit.onlinelearning.service.user.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("${api.prefix}/admin")
@RequiredArgsConstructor
public class AdminController {

    private final IInstructorService instructorService;
    private final IUserService userService;
    private final IAdminService adminService;
    private final ICourseModuleService courseModuleService;



    @GetMapping("/instructors")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<PageableResponse<InstructorAdminResponse>> getAllInstructorsForAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        int zeroBasedPage = Math.max(0, page - 1);
        
        Page<InstructorAdminResponse> instructorsPage = instructorService.getAllInstructorsForAdmin(
            zeroBasedPage, pageSize, search, sortBy, sortOrder
        );
        
        PageableResponse<InstructorAdminResponse> response = new PageableResponse<>();
        response.setCurrentPage(page);
        response.setTotalPages(instructorsPage.getTotalPages());
        response.setTotalElements(instructorsPage.getTotalElements());
        response.setPageSize(instructorsPage.getSize());
        response.setHasNext(instructorsPage.hasNext());
        response.setHasPrevious(instructorsPage.hasPrevious());
        response.setData(instructorsPage.getContent());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @JsonView(Views.Admin.class)
    public ResponseEntity<PageableResponse<UserResponse>> getAllStudentsForAdmin(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        int zeroBasedPage = Math.max(0, page - 1);
        
        Page<UserResponse> studentsPage = userService.getAllStudentsForAdmin(
            zeroBasedPage, pageSize, search, sortBy, sortOrder
        );
        
        PageableResponse<UserResponse> response = new PageableResponse<>();
        response.setCurrentPage(page);
        response.setTotalPages(studentsPage.getTotalPages());
        response.setTotalElements(studentsPage.getTotalElements());
        response.setPageSize(studentsPage.getSize());
        response.setHasNext(studentsPage.hasNext());
        response.setHasPrevious(studentsPage.hasPrevious());
        response.setData(studentsPage.getContent());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics-system")
    @Operation(summary = "Get system statistics",
               description = "Retrieve overall system statistics including total users, instructors, courses, orders, " +
                             "successful orders, total revenue and system income (30% commission from successful orders)")
    public ResponseEntity<SystemStatisticsResponse> systemStatistics() {
        SystemStatisticsResponse statistics = adminService.getSystemStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/course-modules")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_INSTRUCTOR')")
    @Operation(summary = "Get paginated list of course modules with courseId for admin or instructor",
            description = "Retrieve a paginated list of course modules with optional filtering and sorting")
    public ResponseEntity<PageableResponse<CourseModuleResponse>> getCourseModulesForAdminOrInstructor(
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
                .map(CourseModuleResponse::fromEntityForAdmin)
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

}
