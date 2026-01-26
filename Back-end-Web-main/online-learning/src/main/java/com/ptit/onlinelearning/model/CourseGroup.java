package com.ptit.onlinelearning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import com.ptit.onlinelearning.utility.GenerateSlug;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Table(name = "course_groups")
@EntityListeners(CourseGroup.CourseGroupListener.class)
@EqualsAndHashCode(callSuper = true, exclude = {"courses", "preOrderEnrollments"})
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString(exclude = {"courses", "preOrderEnrollments"})
public class CourseGroup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_group_id_seq")
    @SequenceGenerator(name = "course_group_id_seq", sequenceName = "course_group_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail", columnDefinition = "TEXT")
    private String thumbnail;

    @Column(name = "enrollment_type", columnDefinition = "enrollments_type")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private EnrollmentType enrollmentType;

    @Column(name = "currency", columnDefinition = "currency")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private Currency currency;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "custom_price", precision = 10, scale = 2)
    private BigDecimal customPrice;

    @Column(name = "what_you_learn", columnDefinition = "TEXT")
    private String whatYouLearn;

    @Column(name = "is_pre_order")
    @Builder.Default
    private Boolean isPreOrder = false;

    @Column(name = "bundle_preorder_start_date")
    private LocalDateTime bundlePreorderStartDate;

    @Column(name = "bundle_preorder_end_date")
    private LocalDateTime bundlePreorderEndDate;

    @Column(name = "pre_order_price", precision = 12, scale = 0)
    private BigDecimal preOrderPrice;

    @Column(name = "bundle_total_slots")
    private Integer bundleTotalSlots;

    @Column(name = "bundle_remaining_slots")
    private Integer bundleRemainingSlots;

    @OneToMany(mappedBy = "courseGroup", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Course> courses;

    @OneToMany(mappedBy = "courseGroup", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<PreOrderEnrollment> preOrderEnrollments = new HashSet<>();


    public static class CourseGroupListener{
        @PrePersist
        @PreUpdate
        public void generateSlug(CourseGroup courseGroup) {
            if (courseGroup.getTitle() != null &&
                    (courseGroup.getSlug() == null || courseGroup.getSlug().isEmpty())) {
                courseGroup.setSlug(GenerateSlug.toSlug(courseGroup.getTitle())+"-"+ System.currentTimeMillis());
            }
        }
    }
}
