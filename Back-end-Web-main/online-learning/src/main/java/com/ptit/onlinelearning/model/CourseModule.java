package com.ptit.onlinelearning.model;

import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "course_modules")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseModule extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_module_id_seq")
    @SequenceGenerator(name = "course_module_id_seq", sequenceName = "course_module_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", insertable = false, updatable = false, referencedColumnName = "id")
    @ToString.Exclude
    private Course course;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_preview")
    private Boolean isPreview = false;

    @OneToMany(mappedBy = "courseModule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Lesson> lessons;


    @OneToMany(mappedBy = "courseModule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Quiz> quizzes;

    @Formula("""
        (SELECT COALESCE(SUM(l.duration), 0)
         FROM lessons l
         WHERE l.module_id = id)
        """)
    @ToString.Exclude
    private Long duration;
}
