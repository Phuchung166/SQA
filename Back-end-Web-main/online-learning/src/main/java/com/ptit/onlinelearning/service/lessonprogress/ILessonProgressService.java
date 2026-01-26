package com.ptit.onlinelearning.service.lessonprogress;

import com.ptit.onlinelearning.request.CreateLessonProgressRequest;
import com.ptit.onlinelearning.response.ProgressCourseResponse;

public interface ILessonProgressService {

    void createLessonProgress(Long userId, CreateLessonProgressRequest createLessonProgressRequest);
    Double calculateUserCourseProgress(Long userId, Long courseId, Long enrollmentId);
    ProgressCourseResponse viewUserCourseProgress(Long userId, Long courseId, Long enrollmentId);

    Double caculateUserCourseGroupProgress(Long userId, Long courseGroupId);
}
