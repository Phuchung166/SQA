package com.ptit.onlinelearning.response.instructor;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Course;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorCourseResponse {

    private Long id;

    private String code;

    private String title;

    private String slug;

    private String description;

    private String thumbnail;

    private String previewVideo;

    private String level;

    private String language;

    private BigDecimal price;

    private String currency;

    private Boolean isFree;

    private Integer expiredDays;

    private String whatYouLearn;

    private String targetAudiences;

    private String status;

    private String publishedAt;

    private Long duration;

    private Integer totalLessons;

    private Integer totalStudents;

    private String createdAt;

    private String updatedAt;

    public static InstructorCourseResponse fromEntity(Course course){
        if (course == null) return null;

        return InstructorCourseResponse.
                builder().
                id(course.getId()).
                code(course.getCode()).
                title(course.getTitle()).
                slug(course.getSlug()).
                description(course.getDescription()).
                thumbnail(course.getThumbnail()).
                previewVideo(course.getPreviewVideo()).
                level(course.getLevel().toString()).
                language(course.getLanguage()).
                price(course.getPrice()).
                currency(course.getCurrency().toString()).
                isFree(course.getIsFree()).
                expiredDays(course.getExpiredDays()).
                whatYouLearn(course.getWhatYouLearn()).
                targetAudiences(course.getTargetAudiences()).
                publishedAt(course.getPublishedAt() != null ? course.getPublishedAt().toString() : null).
                status(course.getStatus().toString()).
                duration(course.getDuration()).
                totalStudents(course.getEnrollments() != null ? course.getEnrollments().size() : 0).
                totalLessons(course.getTotalLessons()).
                createdAt(course.getCreatedAt().toString()).
                updatedAt(course.getUpdatedAt().toString()).
                build();
    }
}
