package com.ptit.onlinelearning.service.coursemodule;

import com.ptit.onlinelearning.request.CourseModuleRequest;
import com.ptit.onlinelearning.request.CourseRequest;
import com.ptit.onlinelearning.request.UpdateCourseModuleRequest;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.response.course.CourseModuleResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import org.springframework.data.domain.Page;

public interface ICourseModuleService {
    CourseModule createCourseModule(CourseModuleRequest courseModuleRequest, Instructor instructor);
    CourseModule createCourseModule(Long courseId, CourseRequest.CourseModuleDTO courseModuleDTO);
    CourseModule getCourseModuleById(Long id);
    CourseModule updateCourseModule(Long id, UpdateCourseModuleRequest updateCourseModuleRequest, Instructor instructor);
    Page<CourseModule> getCourseModules(Long courseId, int page, int pageSize,
                                        Boolean isPreview, String search, String sortBy, String sortOrder);
    void deleteCourseModule(Long id, Instructor instructor);


    PageableResponse<CourseModuleResponse> getAllCourseModulesOfUserEnrolledInCourse(Long userId, Long enrollmentId,
                                                                                    Long courseId, int page, int pageSize,
                                                                                    String sortBy, String sortOrder);
}
