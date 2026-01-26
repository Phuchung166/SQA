package com.ptit.onlinelearning.service.course;

import com.ptit.onlinelearning.common.type.CourseStatus;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.request.CourseRequest;
import com.ptit.onlinelearning.request.UpdateCourseRequest;
import com.ptit.onlinelearning.request.UpdateCourseStatusRequest;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import org.springframework.data.domain.Page;

import java.io.IOException;


public interface ICourseService {
    Course createCourse(CourseRequest courseRequest, Instructor instructor);
    Course getCourseById(Long id);
    Course updateCourse(Long id, UpdateCourseRequest updateCourseRequest, Instructor instructor);
    void deleteCourse(Long id, User user);
    Page<Course> getCourses(int page, int pageSize,
                            Long categoryId, String search, CourseStatus status,
                            String sortBy, String sortOrder, EnrollmentType enrollmentType);

    Page<Course> getAllCourseOfInstructorBySlug(int page, int pageSize, String slug, Long categoryId);

    Page<Course> getAllCourseOfInstructorByInstructorId(int page, int pageSize, Long categoryId, Long instructorId, Boolean isGrouped);

    Course updateCourseStatus(Long id, UpdateCourseStatusRequest updateCourseStatusRequest) ;

    Course publishCourse(Long id) throws IOException;

    Integer getInstructorTotalCourses(Long instructorId);

    Page<Course> getPreOrderCourses(int page, int pageSize, String sortBy, String sortOrder);

}
