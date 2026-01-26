package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.model.CourseModule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long>, JpaSpecificationExecutor<CourseModule> {
    
    @Query("SELECT cm FROM CourseModule cm WHERE cm.courseId = :courseId ORDER BY cm.sortOrder ASC")
    Page<CourseModule> findAllByCourseId(@Param("courseId") Long courseId, Pageable pageable);
}
