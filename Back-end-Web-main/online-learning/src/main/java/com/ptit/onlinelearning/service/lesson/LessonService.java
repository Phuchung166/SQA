package com.ptit.onlinelearning.service.lesson;

import com.ptit.onlinelearning.request.CourseRequest;
import com.ptit.onlinelearning.request.CourseModuleRequest;
import com.ptit.onlinelearning.request.LessonRequest;
import com.ptit.onlinelearning.request.UpdateLessonRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.CourseModule;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Lesson;
import com.ptit.onlinelearning.repository.CourseModuleRepository;
import com.ptit.onlinelearning.repository.LessonRepository;
import com.ptit.onlinelearning.utility.SpecificationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LessonService implements ILessonService{

    private final LessonRepository lessonRepository;

    private final CourseModuleRepository courseModuleRepository;

    @Override
    public Page<Lesson> getLessons(int page, int pageSize,
                                   Long moduleId, String search,
                                   String contentType, Boolean isMandatory,
                                   String sortBy, String sortOrder) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        Specification<Lesson> lessonSpecification = SpecificationUtils.filterLessons(moduleId, search, contentType, isMandatory);
        return lessonRepository.findAll(lessonSpecification, pageable);
    }

    @Override
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id).orElseThrow(()-> new DataNotFoundException("Course Module not found " + id));
    }

    @Override
    public Lesson createLesson(LessonRequest lessonRequest, Instructor instructor) {
        CourseModule courseModule = courseModuleRepository.findById(lessonRequest.getModuleId()).orElseThrow(()-> new RuntimeException("Course Module not found + "+ lessonRequest.getModuleId()));
        Course course = courseModule.getCourse();
        if(!course.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to create lesson with id: " + instructor.getId());
        }
        if(courseModule.getLessons().size() >= 50){
            throw new InvalidParamException("A course module cannot contain more than 50 lessons");
        }
        Lesson lesson = new Lesson();
        lesson.setModuleId(lessonRequest.getModuleId());
        lesson.setTitle(lessonRequest.getTitle());
        lesson.setDescription(lessonRequest.getDescription());
        lesson.setContentType(lessonRequest.getContentType());
        lesson.setVideoUrl(lessonRequest.getVideoUrl());
        lesson.setDuration(lessonRequest.getDuration());
        lesson.setDocumentUrl(lessonRequest.getDocumentUrl());
        lesson.setContent(lessonRequest.getContent());
        lesson.setSortOrder(lessonRequest.getSortOrder());
        lesson.setIsMandatory(lessonRequest.getIsMandatory());
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson createLesson(Long courseModuleId, CourseRequest.CourseModuleDTO.LessonDTO lessonDTO) {
        Lesson lesson = new Lesson();
        lesson.setModuleId(courseModuleId);
        lesson.setTitle(lessonDTO.getTitle());
        lesson.setDescription(lessonDTO.getDescription());
        lesson.setContentType(lessonDTO.getContentType());
        lesson.setVideoUrl(lessonDTO.getVideoUrl());
        lesson.setDuration(lessonDTO.getDuration());
        lesson.setDocumentUrl(lessonDTO.getDocumentUrl());
        lesson.setContent(lessonDTO.getContent());
        lesson.setSortOrder(lessonDTO.getSortOrder());
        lesson.setIsMandatory(lessonDTO.getIsMandatory());
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson createLesson(Long courseModuleId, CourseModuleRequest.LessonDTO lessonDTO) {
        Lesson lesson = new Lesson();
        lesson.setModuleId(courseModuleId);
        lesson.setTitle(lessonDTO.getTitle());
        lesson.setDescription(lessonDTO.getDescription());
        lesson.setContentType(lessonDTO.getContentType());
        lesson.setVideoUrl(lessonDTO.getVideoUrl());
        lesson.setDuration(lessonDTO.getDuration());
        lesson.setDocumentUrl(lessonDTO.getDocumentUrl());
        lesson.setContent(lessonDTO.getContent());
        lesson.setSortOrder(lessonDTO.getSortOrder());
        lesson.setIsMandatory(lessonDTO.getIsMandatory());
        return lessonRepository.save(lesson);
    }

    @Override
    public Lesson updateLesson(Long id, UpdateLessonRequest updateLessonRequest, Instructor instructor) {
        Lesson lesson = lessonRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Course Module not found " + id));
        Course course = lesson.getCourseModule().getCourse();
        if(!course.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to update lesson with id: " + instructor.getId());
        }
        if (updateLessonRequest.getModuleId() != null) lesson.setModuleId(updateLessonRequest.getModuleId());
        if (updateLessonRequest.getTitle() != null) lesson.setTitle(updateLessonRequest.getTitle());
        if (updateLessonRequest.getDescription() != null) lesson.setDescription(updateLessonRequest.getDescription());
        if (updateLessonRequest.getContentType() != null) lesson.setContentType(updateLessonRequest.getContentType());
        if (updateLessonRequest.getVideoUrl() != null) lesson.setVideoUrl(updateLessonRequest.getVideoUrl());
        if (updateLessonRequest.getDuration() != null) lesson.setDuration(updateLessonRequest.getDuration());
        if (updateLessonRequest.getDocumentUrl() != null) lesson.setDocumentUrl(updateLessonRequest.getDocumentUrl());
        if (updateLessonRequest.getContent() != null) lesson.setContent(updateLessonRequest.getContent());
        if (updateLessonRequest.getSortOrder() != null) lesson.setSortOrder(updateLessonRequest.getSortOrder());
        if (updateLessonRequest.getIsMandatory() != null) lesson.setIsMandatory(updateLessonRequest.getIsMandatory());
        return lessonRepository.saveAndFlush(lesson);
    }

    @Override
    public void deleteLesson(Long id, Instructor instructor) {
        Lesson lesson = getLessonById(id);
        Course course = lesson.getCourseModule().getCourse();
        if(!course.getInstructorId().equals(instructor.getId())){
            throw new AccessDeniedException("Forbidden to delete lesson with id: " + instructor.getId());
        }
        lessonRepository.delete(lesson);
    }
}
