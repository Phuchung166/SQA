package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    Long countByInstructorId(Long instructorId);

    boolean existsByCode(String code);

    List<Course> findAllByCodeIn(List<String> codes);

    @Query("""
                SELECT COUNT(l)
                FROM Course c
                JOIN c.courseModules m
                JOIN m.lessons l
                WHERE c.id = :courseId
            """)
    Long countTotalLessonByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COALESCE(SUM(c.price), 0) FROM Course c WHERE c.id IN :ids")
    BigDecimal sumPriceCourseByIds(@Param("ids") List<Long> ids);


    List<Course> findAllByIdIn(List<Long> ids);

    @Query("""
                SELECT c FROM Course c
                JOIN FETCH c.instructor i
                JOIN FETCH i.user
            """)
    List<Course> findAllWithInstructorAndUser();

}
