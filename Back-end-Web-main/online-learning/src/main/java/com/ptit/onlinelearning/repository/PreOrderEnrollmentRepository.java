package com.ptit.onlinelearning.repository;


import com.ptit.onlinelearning.common.type.PreOrderStatus;
import com.ptit.onlinelearning.model.PreOrderEnrollment;
import com.ptit.onlinelearning.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreOrderEnrollmentRepository extends JpaRepository<PreOrderEnrollment,Long>, JpaSpecificationExecutor<PreOrderEnrollment> {

    Optional<PreOrderEnrollment> findByPaymentId(String paymentId);
    
    List<PreOrderEnrollment> findByCourseIdAndStatus(Long courseId, PreOrderStatus status);
    
    List<PreOrderEnrollment> findByCourseGroupIdAndStatus(Long courseGroupId, PreOrderStatus status);
    
    @Query("SELECT poe FROM PreOrderEnrollment poe " +
           "WHERE poe.user = :user " +
           "AND poe.status IN :statuses " +
           "AND poe.course IS NOT NULL " +
           "AND poe.courseGroup IS NULL")
    Page<PreOrderEnrollment> findByUserAndStatusInAndCourseIsNotNullAndCourseGroupIsNull(
            @Param("user") User user,
            @Param("statuses") List<PreOrderStatus> statuses,
            Pageable pageable
    );
    
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
