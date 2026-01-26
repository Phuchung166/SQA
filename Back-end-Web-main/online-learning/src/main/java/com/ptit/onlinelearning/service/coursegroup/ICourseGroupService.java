package com.ptit.onlinelearning.service.coursegroup;

import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.request.CreateCourseGroupRequest;
import com.ptit.onlinelearning.request.UpdateCourseGroupRequest;
import com.ptit.onlinelearning.model.CourseGroup;
import org.springframework.data.domain.Page;

public interface ICourseGroupService {

    CourseGroup createCourseGroup(CreateCourseGroupRequest createCourseGroupRequest, Long instructorId);


    CourseGroup updateCourseGroup(Long id, UpdateCourseGroupRequest updateCourseGroupRequest, Long instructorId);


    CourseGroup getCourseGroupById(Long id);

    Page<CourseGroup> getAllCourseGroupsOfInstructor(int page, int pageSize, String search, EnrollmentType enrollmentType, Long instructorId);

    Page<CourseGroup> getAllCourseGroups(int page, int pageSize, String search, EnrollmentType enrollmentType, Long categoryId, String sortBy, String sortOrder);

    Page<CourseGroup> getPreOrderCourseGroups(int page, int pageSize, String sortBy, String sortOrder);

    void deleteCourseGroup(Long id, Long instructorId);
}
