package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.Quiz;
import com.ptit.onlinelearning.response.quiz.QuizStatisticResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long>, JpaSpecificationExecutor<Quiz> {

    @Query("""
     SELECT new com.ptit.onlinelearning.response.quiz.QuizStatisticResponse(
            cm.id,
            cm.title,
            COUNT(q.id)
     )
     FROM Course c\s
     JOIN c.courseModules cm
     LEFT JOIN cm.quizzes q
     WHERE c.id = :courseId
     GROUP BY cm.id, cm.title
     ORDER BY COUNT(q.id) DESC
    \s""")
    Page<QuizStatisticResponse> statisticsQuizByModuleId(org.springframework.data.domain.Pageable pageable,  @Param("courseId") Long courseId);


    @Query("SELECT q FROM Quiz q " +
            "LEFT JOIN FETCH q.questions ques " +
            "LEFT JOIN FETCH ques.options " +
            "WHERE q.id = :id")
    Optional<Quiz> findByIdWithQuestionsAndOptions(@Param("id") Long id);


    Optional<Quiz> findQuizById(Long id);
}
