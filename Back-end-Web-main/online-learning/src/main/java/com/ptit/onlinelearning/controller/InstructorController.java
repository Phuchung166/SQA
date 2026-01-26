package com.ptit.onlinelearning.controller;


import com.fasterxml.jackson.annotation.JsonView;
import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.type.EarningStatus;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.*;
import com.ptit.onlinelearning.response.course.CourseResponse;
import com.ptit.onlinelearning.response.instructor.InstructorCurrentMonthEarning;
import com.ptit.onlinelearning.response.instructor.InstructorIncomeDetailResponse;
import com.ptit.onlinelearning.response.instructor.InstructorMonthlyEarningResponse;
import com.ptit.onlinelearning.response.instructor.InstructorUserResponse;
import com.ptit.onlinelearning.response.instructor.TopInstructorResponse;
import com.ptit.onlinelearning.response.view.Views;
import com.ptit.onlinelearning.request.UpdatePaymentStatusRequest;
import com.ptit.onlinelearning.service.course.ICourseService;
import com.ptit.onlinelearning.service.instructor.IInstructorService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/instructors")
@RequiredArgsConstructor
public class InstructorController {
   private final ICourseService courseService;
   private final IInstructorService instructorService;


   @GetMapping("/courses")
   @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
   @Operation(summary = "Get all courses of instructor", 
              description = "Retrieve all courses created by the authenticated instructor with pagination, sorted by updated_at DESC")
   public ResponseEntity<PageableResponse<CourseResponse>> getAllCourseOfInstructor(
           @RequestParam(defaultValue = "1") int page,
           @RequestParam(defaultValue = "10") int pageSize,
           @RequestParam(required  = false) Boolean isGrouped,
           @RequestParam(required = false) Long categoryId,
           @AuthenticationPrincipal User user
   ) {
       
       Page<Course> coursePage = courseService.getAllCourseOfInstructorByInstructorId(page, pageSize, categoryId , user.getInstructor().getId(), isGrouped);
       List<CourseResponse> data = coursePage.getContent()
               .stream()
               .map(CourseResponse::fromEntity)
               .toList();
       return ResponseEntity.ok(
               new PageableResponse<>(
                         coursePage.getNumber()+1,
                         coursePage.getTotalPages(),
                         coursePage.getTotalElements(),
                         coursePage.getSize(),
                          coursePage.hasNext(),
                          coursePage.hasPrevious(),
                          data
               )
       );

   }

    @GetMapping("/courses/{slug}")
//    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get all courses of instructor",
            description = "Retrieve all courses created by the authenticated instructor with pagination, sorted by updated_at DESC")
    public ResponseEntity<PageableResponse<CourseResponse>> getAllCourseOfInstructorBySlug(
            @PathVariable String slug,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId
          ) {

        Page<Course> coursePage = courseService.getAllCourseOfInstructorBySlug(page, pageSize, slug, categoryId);
        List<CourseResponse> data = coursePage.getContent()
                .stream()
                .map(CourseResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(
                new PageableResponse<>(
                        coursePage.getNumber()+1,
                        coursePage.getTotalPages(),
                        coursePage.getTotalElements(),
                        coursePage.getSize(),
                        coursePage.hasNext(),
                        coursePage.hasPrevious(),
                        data
                )
        );

    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get authenticated instructor profile", description = "Retrieve the profile information of the authenticated instructor")
    public ResponseEntity<InstructorUserResponse> getInstructorProfile(@AuthenticationPrincipal User user){
        InstructorUserResponse instructorUserResponse = instructorService.getInstructorById(user.getInstructor().getId());
        return ResponseEntity.ok(instructorUserResponse);
    }


    @GetMapping("/profile/{slug}")
    @Operation(summary = "Get instructor profile by slug", description = "Retrieve the profile information of an instructor using their slug")
    public ResponseEntity<InstructorUserResponse> getInstructorProfileBySlug(@PathVariable String slug) {
        InstructorUserResponse instructorUserResponse = instructorService.getInstructorBySlug(slug);
        return ResponseEntity.ok(instructorUserResponse);
    }

    @GetMapping("/top")
    @Operation(summary = "Get top 10 instructors", description = "Retrieve top 10 instructors based on total students and courses")
    public ResponseEntity<List<TopInstructorResponse>> getTopInstructors() {
        List<TopInstructorResponse> topInstructors = instructorService.getTopInstructors();
        return ResponseEntity.ok(topInstructors);
    }

    @GetMapping("/courses/{courseId}/students")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get all students enrolled in a course", 
               description = "Retrieve all students who have enrolled in a specific course or course group. Supports both STANDALONE and GROUP course types.")
    @JsonView(Views.Instructor.class)
    public ResponseEntity<PageableResponse<UserResponse>> getAllStudentsEnrolledInCourse(
            @PathVariable Long courseId,
            @RequestParam CourseType courseType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "enrollmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String search
    ) {
        PageableResponse<UserResponse> students = instructorService.getAllStudentOfInstructor(
                courseId, courseType, page, pageSize, sortBy, sortOrder, search
        );
        return ResponseEntity.ok(students);
    }

    @GetMapping("/income")
    @PreAuthorize("hasRole('ROLE_INSTRUCTOR')")
    @Operation(summary = "Get instructor's course income with commission", 
               description = "Retrieve income data for all courses taught by the instructor with commission rate applied (default 70%). " +
                             "Returns total income (sum of all course income after commission) and paginated course list. " +
                             "Only includes successful orders. Results are sorted by income descending.")
    public ResponseEntity<InstructorIncomeDetailResponse> getInstructorIncome(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @AuthenticationPrincipal User user
    ) {
        InstructorIncomeDetailResponse income = instructorService.getInstructorIncome(
                user.getInstructor().getId(), page, pageSize
        );
        return ResponseEntity.ok(income);
    }

    @GetMapping("/admin/current-month-earnings")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Get all instructors' current month earnings (Admin only)", 
               description = "Retrieve earnings data for all instructors from the beginning of the current month to now. " +
                             "Only includes successful orders. Earnings are calculated with each instructor's commission rate (default 70%). " +
                             "Supports search by email, first name, last name, or account name. " +
                             "Results can be sorted by currentMonthEarning (default DESC) or other fields.")
    public ResponseEntity<PageableResponse<InstructorCurrentMonthEarning>> getAllInstructorsCurrentMonthEarning(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "currentMonthEarning") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        Page<InstructorCurrentMonthEarning> earningsPage = instructorService.getAllInstructorsCurrentMonthEarning(
                page, pageSize, search, sortBy, sortOrder
        );
        
        return ResponseEntity.ok(
                new PageableResponse<>(
                        earningsPage.getNumber() + 1,
                        earningsPage.getTotalPages(),
                        earningsPage.getTotalElements(),
                        earningsPage.getSize(),
                        earningsPage.hasNext(),
                        earningsPage.hasPrevious(),
                        earningsPage.getContent()
                )
        );
    }

    @GetMapping("/admin/monthly-earnings")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Get instructors' monthly earnings settlement (Admin only)", 
               description = "Retrieve settlement data for all instructors for a specific month from InstructorMonthlyEarning table. " +
                             "This API is used for monthly payment settlement. Results include payment status and can be sorted by totalEarning. " +
                             "Can be filtered by payment status (PENDING or PAID).")
    public ResponseEntity<PageableResponse<InstructorMonthlyEarningResponse>> getInstructorsMonthlyEarnings(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false) EarningStatus paymentStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "totalEarning") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        Page<InstructorMonthlyEarningResponse> earningsPage = instructorService.getInstructorsMonthlyEarnings(
                year, month, paymentStatus, page, pageSize, sortBy, sortOrder
        );
        
        return ResponseEntity.ok(
                new PageableResponse<>(
                        earningsPage.getNumber() + 1,
                        earningsPage.getTotalPages(),
                        earningsPage.getTotalElements(),
                        earningsPage.getSize(),
                        earningsPage.hasNext(),
                        earningsPage.hasPrevious(),
                        earningsPage.getContent()
                )
        );
    }

    @PutMapping("/admin/monthly-earnings/{id}/payment-status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Update payment status of instructor monthly earning (Admin only)", 
               description = "Update the payment status of an instructor's monthly earning. " +
                             "When status is updated to PAID, the instructor will receive a payment success email notification. " +
                             "The paidAt timestamp will be automatically set when status changes to PAID.")
    public ResponseEntity<InstructorMonthlyEarningResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody UpdatePaymentStatusRequest request
    ) {
        InstructorMonthlyEarningResponse response = instructorService.updatePaymentStatus(id, request.getPaymentStatus());
        return ResponseEntity.ok(response);
    }

}
