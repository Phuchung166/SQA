package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.CourseGroup;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CourseGroupRepository extends JpaRepository<CourseGroup,Long>, JpaSpecificationExecutor<CourseGroup> {


    @EntityGraph(attributePaths = {"courses"})
    Optional<CourseGroup> findCourseGroupById(Long id);


    @Query("SELECT c.id FROM Course c WHERE c.courseGroup.id = :courseGroupId")
    List<Long> findAllCourseIdsByCourseGroupId(@Param("courseGroupId") Long courseGroupId);

    @Query("SELECT COALESCE(SUM(cg.price), 0) FROM CourseGroup cg WHERE cg.id IN :ids")
    BigDecimal sumPriceCourseGroupByIds(@Param("ids") List<Long> ids);

    List<CourseGroup> findAllByIdIn(List<Long> ids);
}
