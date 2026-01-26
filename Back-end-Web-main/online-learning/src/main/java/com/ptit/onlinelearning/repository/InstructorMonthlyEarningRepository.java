package com.ptit.onlinelearning.repository;

import com.ptit.onlinelearning.common.type.EarningStatus;
import com.ptit.onlinelearning.model.InstructorMonthlyEarning;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InstructorMonthlyEarningRepository extends JpaRepository<InstructorMonthlyEarning, Long>, JpaSpecificationExecutor<InstructorMonthlyEarning> {

    @Query("""
            SELECT ime FROM InstructorMonthlyEarning ime
            JOIN FETCH ime.instructor i
            JOIN FETCH i.user u
            WHERE ime.year = :year AND ime.month = :month
            """)
    Page<InstructorMonthlyEarning> findByYearAndMonth(
            @Param("year") Integer year,
            @Param("month") Integer month,
            Pageable pageable
    );

    @Query("""
            SELECT ime FROM InstructorMonthlyEarning ime
            JOIN FETCH ime.instructor i
            JOIN FETCH i.user u
            WHERE ime.year = :year AND ime.month = :month AND ime.paymentStatus = :paymentStatus
            """)
    Page<InstructorMonthlyEarning> findByYearAndMonthAndPaymentStatus(
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("paymentStatus") EarningStatus paymentStatus,
            Pageable pageable
    );
}

