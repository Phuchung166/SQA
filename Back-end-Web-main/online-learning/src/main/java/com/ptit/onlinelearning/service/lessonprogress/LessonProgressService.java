package com.ptit.onlinelearning.service.lessonprogress;


import com.ptit.onlinelearning.request.CreateLessonProgressRequest;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.model.LessonProgress;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.LessonProgressRepository;
import com.ptit.onlinelearning.repository.LessonRepository;
import com.ptit.onlinelearning.response.ProgressCourseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonProgressService implements ILessonProgressService {
    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;

    @Override
    public void createLessonProgress(Long userId, CreateLessonProgressRequest createLessonProgressRequest) {
        boolean checkLesson = lessonRepository.existsById(createLessonProgressRequest.getLessonId());
        boolean checkEnrollment = enrollmentRepository.existsByUserIdAndId(userId, createLessonProgressRequest.getEnrollmentId());
        if (!checkLesson) {
            throw new InvalidParamException("Lesson does not exist");
        }
        if (!checkEnrollment) {
            throw new InvalidParamException("User is not enrolled in the course");
        }
        
        // Check if lesson progress already exists for this combination
        boolean progressExists = lessonProgressRepository.existsByEnrollmentIdAndLessonIdAndUserId(
                createLessonProgressRequest.getEnrollmentId(),
                createLessonProgressRequest.getLessonId(),
                userId
        );
        if (progressExists) {
            throw new InvalidParamException("Lesson progress already exists for this user, lesson, and enrollment");
        }
        
        LessonProgress lessonProgress = LessonProgress.builder()
                .lessonId(createLessonProgressRequest.getLessonId())
                .enrollmentId(createLessonProgressRequest.getEnrollmentId())
                .userId(userId)
                .build();
        lessonProgressRepository.save(lessonProgress);
    }

    @Override
    public Double calculateUserCourseProgress(Long userId, Long courseId, Long enrollmentId) {
        Long totalLessonCompleted = lessonProgressRepository.countByEnrollmentIdAndUserId(enrollmentId, userId);
        Long totalLessons = courseRepository.countTotalLessonByCourseId(courseId);
        
        // Handle case when course has no lessons
        if (totalLessons == null || totalLessons == 0) {
            return 0.0;
        }
        
        double percentage = (totalLessonCompleted.doubleValue() / totalLessons.doubleValue()) * 100;
        return new BigDecimal(percentage)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

    }

    @Override
    public ProgressCourseResponse viewUserCourseProgress(Long userId, Long courseId, Long enrollmentId) {
        Long totalLessonCompleted = lessonProgressRepository.countByEnrollmentIdAndUserId(enrollmentId, userId);
        Long totalLessons = courseRepository.countTotalLessonByCourseId(courseId);
        return new ProgressCourseResponse(totalLessons, totalLessonCompleted);
    }

    @Override
    public Double caculateUserCourseGroupProgress(Long userId, Long courseGroupId) {
        List<Enrollment> listEnrollments = enrollmentRepository.findAllByUserIdAndCourseGroupId(userId, courseGroupId);
        if(listEnrollments.isEmpty()){
            throw  new InvalidParamException("User is not enrolled in the course group");
        }
        List<ProgressCourseResponse> progressCourseResponseList = listEnrollments
                .stream()
                .map(enrollment -> {
                    Long courseId = enrollment.getCourse().getId();
                    Long enrollmentId = enrollment.getId();
                    return viewUserCourseProgress(userId, courseId, enrollmentId);
                })
                .toList();
        long totalLessonsInGroup = progressCourseResponseList
                .stream()
                .mapToLong(ProgressCourseResponse::getTotalLessons)
                .sum();
        log.info("totalLessonsInGroup:{}",totalLessonsInGroup);
        long totalLessonsCompletedInGroup = progressCourseResponseList
                .stream()
                .mapToLong(ProgressCourseResponse::getCompletedLessons)
                .sum();
        log.info("totalLessonsCompletedInGroup:{}",totalLessonsCompletedInGroup);

        // Handle case when course group has no lessons
        if (totalLessonsInGroup == 0) {
            return 0.0;
        }

        double percentage = ((double) totalLessonsCompletedInGroup / (double) totalLessonsInGroup) * 100;
        return new BigDecimal(percentage)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
