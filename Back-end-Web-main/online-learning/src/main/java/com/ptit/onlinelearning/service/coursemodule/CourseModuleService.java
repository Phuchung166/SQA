package com.ptit.onlinelearning.service.coursemodule;

import com.ptit.onlinelearning.request.CourseModuleRequest;
import com.ptit.onlinelearning.request.CourseRequest;
import com.ptit.onlinelearning.request.UpdateCourseModuleRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Lesson;
import com.ptit.onlinelearning.repository.CourseModuleRepository;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.LessonProgressRepository;
import com.ptit.onlinelearning.response.course.CourseModuleResponse;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.service.lesson.ILessonService;
import com.ptit.onlinelearning.utility.SpecificationUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseModuleService implements ICourseModuleService {

    private final CourseModuleRepository courseModuleRepository;
    private final LessonProgressRepository lessonProgressRepository;

    private final CourseRepository courseRepository;

    private final ILessonService lessonService;

    @Override
    @Transactional
    public CourseModule createCourseModule(CourseModuleRequest courseModuleRequest, Instructor instructor) {
        Course course = courseRepository.findById(courseModuleRequest.getCourseId()).orElseThrow(() -> new DataNotFoundException("Course not found: " + courseModuleRequest.getCourseId()));
        if(!course.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to create course module with courseId: " + course.getId());
        }
        CourseModule courseModule = new CourseModule();
        courseModule.setTitle(courseModuleRequest.getTitle());
        courseModule.setDescription(courseModuleRequest.getDescription());
        courseModule.setSortOrder(courseModuleRequest.getSortOrder());
        courseModule.setCourseId(course.getId());
        CourseModule savedCourseModule = courseModuleRepository.save(courseModule);
        List<CourseModuleRequest.LessonDTO> lessonDTOs = courseModuleRequest.getLessonDTOs();
        if(lessonDTOs != null && !lessonDTOs.isEmpty()){
            List<Lesson> lessons = new ArrayList<>();
            for (CourseModuleRequest.LessonDTO lessonDTO : lessonDTOs) {
                Lesson lesson = lessonService.createLesson(savedCourseModule.getId(), lessonDTO);
                lessons.add(lesson);
            }
            savedCourseModule.setLessons(lessons);
        }
        return savedCourseModule;
    }

    @Override
    @Transactional
    public CourseModule createCourseModule(Long courseId, CourseRequest.CourseModuleDTO courseModuleDTO) {
        CourseModule courseModule = new CourseModule();
        courseModule.setTitle(courseModuleDTO.getTitle());
        courseModule.setDescription(courseModuleDTO.getDescription());
        courseModule.setSortOrder(courseModuleDTO.getSortOrder());
        courseModule.setCourseId(courseId);
        CourseModule savedCourseModule = courseModuleRepository.save(courseModule);
        List<CourseRequest.CourseModuleDTO.LessonDTO> lessonDTOs = courseModuleDTO.getLessonDTOs();
        if(lessonDTOs != null && !lessonDTOs.isEmpty()){
            List<Lesson> lessons = new ArrayList<>();
            for (CourseRequest.CourseModuleDTO.LessonDTO lessonDTO : lessonDTOs) {
                Lesson lesson = lessonService.createLesson(savedCourseModule.getId(), lessonDTO);
                lessons.add(lesson);
            }
            savedCourseModule.setLessons(lessons);
        }
        return savedCourseModule;
    }

    @Override
    public CourseModule getCourseModuleById(Long id) {
        return courseModuleRepository.findById(id).orElseThrow(()-> new RuntimeException("Course Module not found + "+ id));
    }

    @Override
    public CourseModule updateCourseModule(Long id, UpdateCourseModuleRequest updateCourseModuleRequest, Instructor instructor) {
        CourseModule courseModule = getCourseModuleById(id);
        Course course = courseModule.getCourse();
        if(!course.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to create course module with courseId: " + course.getId());
        }
        if(updateCourseModuleRequest.getTitle() != null) courseModule.setTitle(updateCourseModuleRequest.getTitle());
        if(updateCourseModuleRequest.getDescription() != null) courseModule.setDescription(updateCourseModuleRequest.getDescription());
        if(updateCourseModuleRequest.getSortOrder() != null) courseModule.setSortOrder(updateCourseModuleRequest.getSortOrder());
        if(updateCourseModuleRequest.getCourseId() != null) courseModule.setCourseId(updateCourseModuleRequest.getCourseId());
        return courseModuleRepository.save(courseModule);
    }

    @Override
    public Page<CourseModule> getCourseModules(
            Long courseId, int page, int pageSize,
            Boolean isPreview, String search,
            String sortBy, String sortOrder) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        Specification<CourseModule> spec = SpecificationUtils.filterCourseModules(courseId, isPreview, search);
        return courseModuleRepository.findAll(spec, pageable);

    }

    @Override
    public void deleteCourseModule(Long id, Instructor instructor) {
        CourseModule courseModule = getCourseModuleById(id);
        Course course = courseModule.getCourse();
        if(!course.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to delete course module with courseId: " + course.getId());
        }
        courseModuleRepository.delete(courseModule);
    }

    @Override
    public PageableResponse<CourseModuleResponse> getAllCourseModulesOfUserEnrolledInCourse(Long userId, Long enrollmentId, Long courseId,
                                                                                            int page, int pageSize, String sortBy, String sortOrder) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        
        Page<CourseModule> courseModulePage = courseModuleRepository.findAllByCourseId(courseId, pageable);
        
        List<CourseModuleResponse> courseModuleResponses = courseModulePage.getContent().stream()
            .map(courseModule -> {
                CourseModuleResponse response = CourseModuleResponse.fromEntity(courseModule);
                
                if (response.getLessons() != null && !response.getLessons().isEmpty()) {
                    response.getLessons().forEach(lessonResponse -> {
                        boolean isCompleted = lessonProgressRepository.existsByEnrollmentIdAndLessonIdAndUserId(
                            enrollmentId, 
                            lessonResponse.getId(), 
                            userId
                        );
                        lessonResponse.setIsCompleted(isCompleted);
                    });
                }
                
                return response;
            })
            .toList();
        
        return PageableResponse.<CourseModuleResponse>builder()
                .data(courseModuleResponses)
                .totalElements(courseModulePage.getTotalElements())
                .totalPages(courseModulePage.getTotalPages())
                .currentPage(page)
                .pageSize(pageSize)
                .hasNext(courseModulePage.hasNext())
                .hasPrevious(courseModulePage.hasPrevious())
                .build();
    }


}
