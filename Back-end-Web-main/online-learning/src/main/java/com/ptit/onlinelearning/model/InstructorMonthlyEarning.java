package com.ptit.onlinelearning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.common.type.EarningStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructor_monthly_earnings", uniqueConstraints = {
        @UniqueConstraint(name = "uq_instructor_year_month", columnNames = {"instructor_id", "year", "month"})
})
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InstructorMonthlyEarning extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "instructor_monthly_earning_id_gen")
    @SequenceGenerator(name = "instructor_monthly_earning_id_gen", sequenceName = "instructor_monthly_earning_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;


    @Column(name = "year", nullable = false)
    @ToString.Include
    private Integer year;

    @Column(name = "month", nullable = false)
    @ToString.Include
    private Integer month;

    @Column(name = "total_earning", nullable = false, precision = 12, scale = 0)
    private BigDecimal totalEarning = BigDecimal.ZERO;

    @Column(name = "payment_status", columnDefinition = "earning_status", nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @ToString.Include
    private EarningStatus paymentStatus = EarningStatus.PENDING;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", referencedColumnName = "id")
    @JsonIgnore
    @ToString.Exclude
    private Instructor instructor;
}

