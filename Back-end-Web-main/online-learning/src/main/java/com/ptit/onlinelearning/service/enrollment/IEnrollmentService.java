package com.ptit.onlinelearning.service.enrollment;

import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.request.CreateEnrollment;
import com.ptit.onlinelearning.request.EnrollmentRequest;
import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseGroupResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentCourseResponse;
import com.ptit.onlinelearning.response.enrollment.EnrollmentResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface IEnrollmentService {
    Enrollment createEnrollment(User user, EnrollmentRequest enrollmentRequest);
    List<Enrollment> createEnrollment(User user, Long courseGroupId);
    Page<Enrollment> getEnrollments(int page, int pageSize, String sortBy, String sortOrder, String search, Long courseId, Long userId);
    PageableResponse<EnrollmentResponse> getEnrollmentsByUserId(int page, int pageSize, String sortBy,
                                                                String sortOrder, String search, @NotNull Long userId);
    Enrollment getEnrollmentById(Long id, User user);
    void deleteEnrollment(Long id, User user);

    PageableResponse<EnrollmentCourseResponse> getAllCoursesEnrolledByUser(int page, int pageSize, String sortBy, String sortOrder,
                                                                           String search, @NotNull Long userId);
    PageableResponse<EnrollmentCourseResponse> getAllCourseGroupsEnrolledByUser(int page, int pageSize,
                                                                                String search, @NotNull Long userId);

    List<Enrollment> studentEnroll(List<CreateEnrollment> createEnrollments);


    EnrollmentCourseGroupResponse getEnrollmentCourseGroupDetail(Long courseGroupId, @NotNull Long userId);

    Map<String, Object> checkEnrollmentCourse(Long courseId, CourseType courseType, Long userId, Boolean checkPreOrder);
}
