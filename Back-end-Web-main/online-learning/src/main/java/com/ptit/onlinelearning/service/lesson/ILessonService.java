package com.ptit.onlinelearning.service.lesson;

import com.ptit.onlinelearning.request.CourseRequest;
import com.ptit.onlinelearning.request.CourseModuleRequest;
import com.ptit.onlinelearning.request.LessonRequest;
import com.ptit.onlinelearning.request.UpdateLessonRequest;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Lesson;
import org.springframework.data.domain.Page;

public interface ILessonService {
    Page<Lesson> getLessons(
            int page, int pageSize,
            Long moduleId, String search, String contentType,
            Boolean isMandatory, String sortBy, String sortOrder);
    Lesson getLessonById(Long id);
    Lesson createLesson(LessonRequest lessonRequest, Instructor instructor);
    Lesson createLesson(Long courseModuleId, CourseRequest.CourseModuleDTO.LessonDTO lessonDTO);
    Lesson createLesson(Long courseModuleId, CourseModuleRequest.LessonDTO lessonDTO);
    Lesson updateLesson(Long id, UpdateLessonRequest updateLessonRequest, Instructor instructor);
    void deleteLesson(Long id, Instructor instructor);
}
