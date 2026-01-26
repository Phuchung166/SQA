package com.ptit.onlinelearning.model;


import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "lesson_progress",
        uniqueConstraints = {
            @UniqueConstraint(
                name = "uk_lesson_progress_user_lesson_enrollment",
                columnNames = {"user_id", "lesson_id", "enrollment_id"}
            )
        })
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LessonProgress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lesson_progress_id_gen")
    @SequenceGenerator(name = "lesson_progress_id_gen", sequenceName = "lesson_progress_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    @EqualsAndHashCode.Include
    @ToString.Include
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    @ToString.Include
    private Long lessonId;

    @Column(name = "user_id", nullable = false)
    @ToString.Include
    private Long userId;

    @Column(name = "enrollment_id", nullable = false)
    @ToString.Include
    private Long enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false, referencedColumnName = "id")
    @ToString.Exclude
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false, referencedColumnName = "id")
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", insertable = false, updatable = false, referencedColumnName = "id")
    @ToString.Exclude
    private Enrollment enrollment;
}
