package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.QuizAttempt;
import com.ptit.onlinelearning.response.quiz.UserAttemptQuizResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long>, JpaSpecificationExecutor<QuizAttempt> {
    
    @Query("SELECT new com.ptit.onlinelearning.response.quiz.UserAttemptQuizResponse(" +
           "q.id, q.title, q.isActive, COUNT(qa.id), " +
           "q.courseModule.id, q.courseModule.title, q.courseModule.course.title) " +
           "FROM Quiz q " +
           "LEFT JOIN q.quizAttempts qa " +
           "WHERE q.courseModule.course.instructor.user.id = :instructorId " +
           "GROUP BY q.id, q.title, q.courseModule.id, q.courseModule.title, q.courseModule.course.title " +
           "ORDER BY COUNT(qa.id) DESC")
    Page<UserAttemptQuizResponse> findQuizAttemptStatisticsByInstructorId(
            @Param("instructorId") Long instructorId, 
            Pageable pageable);
}
