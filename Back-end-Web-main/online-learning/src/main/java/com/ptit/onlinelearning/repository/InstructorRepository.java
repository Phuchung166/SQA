package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.projection.InstructorStatsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor,Long> {
    Optional<Instructor> findByUserId(Long userId);

    Optional<Instructor> findBySlug(String slug);
    
    @Query("SELECT i FROM Instructor i JOIN FETCH i.user u ORDER BY i.createdAt DESC")
    List<Instructor> findTop10ByOrderByTotalStudentsDescTotalCoursesDesc();

    @Query(
            value = """
            select
                count(distinct c.id) as totalCourses,
                count(distinct e.user_id) as totalStudents
            from courses c
            left join enrollments e on e.course_id = c.id
            where c.instructor_id = :instructorId
            """,
            nativeQuery = true
    )
    InstructorStatsProjection getInstructorStats(@Param("instructorId") Long instructorId);
}
