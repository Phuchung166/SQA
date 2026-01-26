package com.ptit.onlinelearning.model;

import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.common.type.CourseStatus;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "instructors")
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Instructor extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "instructors_id_gen")
    @SequenceGenerator(name = "instructors_id_gen", sequenceName = "instructor_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    @ToString.Include
    private Long userId;

    @Column(name = "expertise", columnDefinition = "TEXT")
    @ToString.Include
    private String expertise;

    @Column(name = "experience_years")
    @ToString.Include
    private Integer experienceYears;

    @Column(name = "slug", nullable = false, unique = true)
    @ToString.Include
    private String slug;

    @Column(name = "qualification", columnDefinition = "TEXT")
    @ToString.Include
    private String qualification;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "tax_code", length = 20)
    private String taxCode;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate = new BigDecimal("70.00");

    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @ToString.Exclude
    private User user;


    @OneToMany(mappedBy = "instructor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Course> courses;

    @OneToMany(mappedBy = "instructor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<InstructorMonthlyEarning> monthlyEarnings;

    @Formula("(SELECT COUNT(c.id) FROM courses c WHERE c.instructor_id = id AND c.status = 'ACTIVE')")
    private int totalActiveCourses;

    public List<Course> getActiveCourses(){
        if(courses == null) return Collections.emptyList();
        return courses.stream()
                .filter(course -> course.getStatus() == CourseStatus.ACTIVE)
                .toList();
    }
}
