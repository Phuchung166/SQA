package com.ptit.onlinelearning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseCourse;
import com.ptit.onlinelearning.common.type.*;
import com.ptit.onlinelearning.utility.GenerateSlug;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@EqualsAndHashCode(callSuper = true, exclude = {"courseGroup", "instructor", "category", "courseModules", "enrollments", "preOrderEnrollments", "reviews"})
@Entity
@EntityListeners(Course.CourseListener.class)
@Table(name = "courses")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"courseGroup", "instructor", "category", "courseModules", "enrollments", "preOrderEnrollments", "reviews"})
public class Course extends BaseCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_id_seq")
    @SequenceGenerator(name = "course_id_seq", sequenceName = "course_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "course_code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail", columnDefinition = "TEXT")
    private String thumbnail;

    @Column(name = "preview_video", columnDefinition = "TEXT")
    private String previewVideo;

    @Column(name = "level", columnDefinition = "level")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private CourseLevel level = CourseLevel.BEGINNER;

    @Column(name = "status", columnDefinition = "course_status")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "language", length = 10)
    private String language = "en";

    @Column(name = "what_you_learn", columnDefinition = "TEXT")
    private String whatYouLearn;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", columnDefinition = "currency")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private Currency currency;

    @Column(name = "expired_days")
    private Integer expiredDays;

    @Column(name = "skill_acquired", columnDefinition = "TEXT")
    private String skillAcquired;

    @Column(name = "target_audiences", columnDefinition = "TEXT")
    private String targetAudiences;

    @Column(name = "enrollment_type", columnDefinition = "enrollments_type")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private EnrollmentType enrollmentType;

    @Column(name = "is_free")
    private Boolean isFree = false;

    @Column(name = "instructor_id")
    private Long instructorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", insertable = false, updatable = false, referencedColumnName = "id")
    @JsonIgnore
    private Instructor instructor;

    @Column(name = "category_id")
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false, referencedColumnName = "id")
    @JsonIgnore
    private Category category;

//    private Long courseGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_group_id", referencedColumnName = "id")
    @JsonIgnore
    private CourseGroup courseGroup;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "is_pre_order")
    private Boolean isPreOrder;

    @Column(name = "pre_order_start_date")
    private LocalDateTime preOrderStartDate;

    @Column(name = "pre_order_end_date")
    private LocalDateTime preOrderEndDate;

    @Column(name = "pre_order_price", precision = 10, scale = 2)
    private BigDecimal preOrderPrice;

    @Column(name = "pre_order_total_slots")
    private Integer preOrderTotalSlots;

    @Column(name = "pre_order_remaining_slots")
    private Integer preOrderRemainingSlots;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<CourseModule> courseModules;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Enrollment> enrollments;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<PreOrderEnrollment> preOrderEnrollments = new HashSet<>();

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Review> reviews;

    @Formula("""
        (SELECT COALESCE(SUM(l.duration), 0)
         FROM course_modules m
         JOIN lessons l ON l.module_id = m.id
         WHERE m.course_id = id)
        """)
    private Long duration = 0L;

    @Formula("""
        (SELECT COUNT(l.id)
         FROM course_modules m
         JOIN lessons l ON l.module_id = m.id
         WHERE m.course_id = id)
        """)
    private Integer totalLessons = 0;

    public static class CourseListener {
        @PrePersist
        @PreUpdate
        public void generateSlug(Course course) {
            if (course.getTitle() != null &&
                    (course.getSlug() == null || course.getSlug().isEmpty())) {
                course.setSlug(GenerateSlug.toSlug(course.getTitle()+"-"+ System.currentTimeMillis()));
            }
        }
    }

}
