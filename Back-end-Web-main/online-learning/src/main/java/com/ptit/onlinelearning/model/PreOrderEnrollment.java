package com.ptit.onlinelearning.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.common.type.PreOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "pre_order_enrollments")
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PreOrderEnrollment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pre_order_enrollment_seq")
    @SequenceGenerator(name = "pre_order_enrollment_seq", sequenceName = "pre_order_enrollment_id_seq", allocationSize = 1)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", referencedColumnName = "id")
    @ToString.Exclude
    @JsonIgnore
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_group_id", referencedColumnName = "id")
    @ToString.Exclude
    @JsonIgnore
    private CourseGroup courseGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private User user;

    @Column(name = "slot_number", nullable = false)
    @ToString.Include
    private Integer slotNumber;

    @Column(name = "pre_order_date", nullable = false)
    @ToString.Include
    private LocalDateTime preOrderDate;

    @Column(name = "price_paid", nullable = false, precision = 12, scale = 0)
    private BigDecimal pricePaid;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private PreOrderStatus status = PreOrderStatus.RESERVED;

    @Column(name = "payment_id", nullable = false, unique = true, length = 100)
    private String paymentId;

    @OneToMany(mappedBy = "preOrderEnrollment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @JsonIgnore
    private Set<Enrollment> questions = new HashSet<>();
}
