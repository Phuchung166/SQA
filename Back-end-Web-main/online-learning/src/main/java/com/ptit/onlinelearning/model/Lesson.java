package com.ptit.onlinelearning.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "lessons")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Lesson extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lesson_id_seq")
    @SequenceGenerator(name = "lesson_id_seq", sequenceName = "lesson_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", insertable = false, updatable = false, referencedColumnName = "id")
    private CourseModule courseModule;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType;

    @Column(name = "video_url", columnDefinition = "TEXT")
    private String videoUrl;

    @Column(name = "duration")
    private Long duration;

    @Column(name = "document_url", columnDefinition = "TEXT")
    private String documentUrl;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_preview")
    private Boolean isPreview = false;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = true;

    @OneToOne(mappedBy = "lesson", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonIgnore
    private FileUpload fileUpload;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<LessonProgress> lessonProgresses;
}