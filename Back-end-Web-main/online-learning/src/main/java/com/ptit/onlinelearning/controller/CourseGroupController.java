package com.ptit.onlinelearning.controller;


import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.request.CreateCourseGroupRequest;
import com.ptit.onlinelearning.request.UpdateCourseGroupRequest;
import com.ptit.onlinelearning.model.CourseGroup;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.course.CourseGroupDetailResponse;
import com.ptit.onlinelearning.response.course.CourseGroupResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.coursegroup.ICourseGroupService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/course-groups")
public class CourseGroupController {

    private final ICourseGroupService courseGroupService;


    @PostMapping
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Create a new course group from courses", description = "Creates a new course group by combining multiple courses")
    public ResponseEntity<CourseGroup> createCourseGroup(@RequestBody
                                                             CreateCourseGroupRequest createCourseGroupRequest,
                                                         @AuthenticationPrincipal User user) {
        CourseGroup courseGroup = courseGroupService.createCourseGroup(createCourseGroupRequest, user.getInstructor().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(courseGroup);
    }


    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Update an existing course group", description = "Updates the details of an existing course group by its ID")
    public ResponseEntity<CourseGroupResponse> updateCourseGroup(@PathVariable Long id,
                                                                       @RequestBody UpdateCourseGroupRequest updateCourseGroupRequest,
                                                                       @AuthenticationPrincipal User user) {
        CourseGroup updatedCourseGroup = courseGroupService.updateCourseGroup(id, updateCourseGroupRequest, user.getInstructor().getId());
        return ResponseEntity.ok(CourseGroupResponse.fromEntity(updatedCourseGroup));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course group by ID", description = "Retrieves the details of a course group by its ID")
    public ResponseEntity<CourseGroupDetailResponse> getCourseGroupById(@PathVariable Long id) {
        CourseGroup courseGroup = courseGroupService.getCourseGroupById(id);
        return ResponseEntity.ok(CourseGroupDetailResponse.fromEntity(courseGroup));
    }


    @GetMapping("/instructor")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get all course groups of instructor",
            description = "Retrieve all course groups created by the authenticated instructor with pagination")
    public ResponseEntity<PageableResponse<CourseGroupResponse>> getAllCourseGroupsOfInstructor(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EnrollmentType enrollmentType,
            @AuthenticationPrincipal User user
    ) {
        Page<CourseGroup> courseGroupPage = courseGroupService.getAllCourseGroupsOfInstructor(
                page, 
                pageSize, 
                search, 
                enrollmentType, 
                user.getInstructor().getId()
        );
        
        List<CourseGroupResponse> data = courseGroupPage.getContent().stream().map(CourseGroupResponse::fromEntity).toList();
        
        return ResponseEntity.ok(
                new PageableResponse<>(
                        courseGroupPage.getNumber() + 1,
                        courseGroupPage.getTotalPages(),
                        courseGroupPage.getTotalElements(),
                        courseGroupPage.getSize(),
                        courseGroupPage.hasNext(),
                        courseGroupPage.hasPrevious(),
                        data
                )
        );
    }
    
    @GetMapping
    @Operation(summary = "Get all course groups (non-pre-order)",
            description = "Retrieve all non-pre-order course groups with pagination, filtering, and sorting options")
    public ResponseEntity<PageableResponse<CourseGroupResponse>> getAllCourseGroup(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EnrollmentType enrollmentType,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ){
        Page<CourseGroup> courseGroupPage = courseGroupService.getAllCourseGroups(
                page,
                pageSize,
                search,
                enrollmentType,
                categoryId,
                sortBy,
                sortOrder
        );

        List<CourseGroupResponse> data = courseGroupPage.getContent().stream().map(CourseGroupResponse::fromEntity).toList();
        
        return ResponseEntity.ok(
                new PageableResponse<>(
                        courseGroupPage.getNumber() + 1,
                        courseGroupPage.getTotalPages(),
                        courseGroupPage.getTotalElements(),
                        courseGroupPage.getSize(),
                        courseGroupPage.hasNext(),
                        courseGroupPage.hasPrevious(),
                        data
                )
        );
    }

    @GetMapping("/pre-order")
    @Operation(summary = "Get all pre-order course groups",
            description = "Retrieve all active pre-order course groups with pagination and sorting options")
    public ResponseEntity<PageableResponse<CourseGroupResponse>> getPreOrderCourseGroups(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ){
        Page<CourseGroup> courseGroupPage = courseGroupService.getPreOrderCourseGroups(
                page,
                pageSize,
                sortBy,
                sortOrder
        );

        List<CourseGroupResponse> data = courseGroupPage.getContent().stream().map(CourseGroupResponse::fromEntity).toList();
        
        return ResponseEntity.ok(
                new PageableResponse<>(
                        courseGroupPage.getNumber() + 1,
                        courseGroupPage.getTotalPages(),
                        courseGroupPage.getTotalElements(),
                        courseGroupPage.getSize(),
                        courseGroupPage.hasNext(),
                        courseGroupPage.hasPrevious(),
                        data
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Delete course group by ID", 
            description = "Delete a course group by its ID. Only the instructor who owns the courses in the group can delete it. " +
                    "Courses will not be deleted, only the group association.")
    public ResponseEntity<java.util.Map<String, String>> deleteCourseGroup(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        courseGroupService.deleteCourseGroup(id, user.getInstructor().getId());
        return ResponseEntity.ok(java.util.Map.of("message", "Delete success"));
    }
}
