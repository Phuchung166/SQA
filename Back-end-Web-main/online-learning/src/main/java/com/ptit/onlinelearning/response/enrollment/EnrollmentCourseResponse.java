package com.ptit.onlinelearning.response.enrollment;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.CourseType;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@NoArgsConstructor
@SuperBuilder
public class EnrollmentCourseResponse extends EnrollmentResponse {
    private Long courseId;
    private String title;
    private String thumbnail;
    private String slug;
    private CourseType courseType;

    public EnrollmentCourseResponse(Long id, Double totalProgress, LocalDateTime enrollmentDate,
                                    LocalDateTime completedAt, LocalDateTime lastAccessed,
                                    String categoryName, String instructorFirstName, String instructorLastName,
                                    String instructorAvatar,
                                    Long courseId, String title, String thumbnail,
                                    String slug, CourseType courseType) {
        super(id, totalProgress, enrollmentDate, completedAt, lastAccessed, categoryName, instructorFirstName, instructorLastName, instructorAvatar);
        this.courseId = courseId;
        this.title = title;
        this.thumbnail = thumbnail;
        this.slug = slug;
        this.courseType = courseType;
    }
}
