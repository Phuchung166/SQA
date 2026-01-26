package com.ptit.onlinelearning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "enrollments")
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Enrollment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @ToString.Include
    @EqualsAndHashCode.Include
    private Long id;


    @Column(name = "enrollment_date")
    @ToString.Include
    private LocalDateTime enrollmentDate = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_accessed")
    private LocalDateTime lastAccessed;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_group_id", referencedColumnName = "id", nullable = false)
    @ToString.Exclude
    @JsonIgnore
    private CourseGroup courseGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id",referencedColumnName = "id")
    @ToString.Exclude
    @JsonIgnore
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pre_order_enrollment_id", referencedColumnName = "id")
    @ToString.Exclude
    @JsonIgnore
    private PreOrderEnrollment preOrderEnrollment;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @JsonIgnore
    private List<LessonProgress> lessonProgresses;


    @OneToMany(mappedBy = "enrollment",cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private List<Review> reviews;
}
