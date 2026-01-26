package com.ptit.onlinelearning.repository;


import com.ptit.onlinelearning.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Integer>, JpaSpecificationExecutor<LessonProgress> {

    Long countByEnrollmentIdAndUserId(Long enrollmentId, Long userId);

    boolean existsByEnrollmentIdAndLessonIdAndUserId(Long enrollmentId, Long lessonId, Long userId);


}
