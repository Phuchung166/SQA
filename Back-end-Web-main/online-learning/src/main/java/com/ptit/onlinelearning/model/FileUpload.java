package com.ptit.onlinelearning.model;


import com.ptit.onlinelearning.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "file_upload")
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FileUpload extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "file_upload_id_gen")
    @SequenceGenerator(name = "file_upload_id_gen", sequenceName = "file_upload_id_seq", allocationSize = 1)
    @Column(name = "id", nullable = false)
    private Long id;


    @Column(name = "s3_key")
    private String s3_key;


    @Column(name = "lesson_id")
    private Long LessonId;

    @Column(name = "total_parts")
    private Integer total_parts;

    @Column(name = "upload_id")
    private String upload_id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "lesson_id", referencedColumnName = "id", insertable = false, updatable = false)
    @ToString.Exclude
    private Lesson lesson;


}
