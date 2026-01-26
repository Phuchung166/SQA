package com.ptit.onlinelearning.response.course;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.response.ReviewStatisticResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CourseResponse {

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


    private String whatYouLearn;

    private String targetAudiences;

    private String status;

    private String enrollmentType;

    private String publishedAt;

    private Long duration;

    private Integer totalLessons;

    private Integer totalStudents;

    private CategoryResponse category;

    private InstructorResponse instructor;

    private ReviewStatisticResponse review;

    private Boolean isPreOrder;

    private String preOrderStartDate;

    private String preOrderEndDate;

    private BigDecimal preOrderPrice;

    private Integer preOrderTotalSlots;

    private Integer preOrderRemainingSlots;

    private String createdAt;

    private String updatedAt;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class InstructorResponse{

        private String firstName;

        private String lastName;

        private String accountName;

        private Integer totalCourses;

        private String slug;

        private String avatar;

        private String expertise;

        private String qualification;

        private String bio;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class CategoryResponse {

        private Long id;

        private String name;
    }

    public static CourseResponse fromEntity(Course course){
        if (course == null) return null;

        return CourseResponse.
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
                whatYouLearn(course.getWhatYouLearn()).
                targetAudiences(course.getTargetAudiences()).
                publishedAt(course.getPublishedAt() != null ? course.getPublishedAt().toString() : null).
                status(course.getStatus().toString()).
                duration(course.getDuration()).
                totalStudents(course.getEnrollments() != null ? course.getEnrollments().size() : 0).
                totalLessons(course.getTotalLessons()).
                review(ReviewStatisticResponse.fromEntity(course)).
                enrollmentType(course.getEnrollmentType() != null ? course.getEnrollmentType().toString() : null).
                isPreOrder(course.getIsPreOrder()).
                preOrderStartDate(course.getPreOrderStartDate() != null ? course.getPreOrderStartDate().toString() : null).
                preOrderEndDate(course.getPreOrderEndDate() != null ? course.getPreOrderEndDate().toString() : null).
                preOrderPrice(course.getPreOrderPrice()).
                preOrderTotalSlots(course.getPreOrderTotalSlots()).
                preOrderRemainingSlots(course.getPreOrderRemainingSlots()).
                category(course.getCategory() != null ? CourseResponse.CategoryResponse.
                        builder().id(course.getCategory().getId()).
                        name(course.getCategory().getName()).
                        build() : null).
                instructor(course.getInstructor() != null && course.getInstructor().getUser() != null ? InstructorResponse.builder().
                        firstName(course.getInstructor().getUser().getFirstName()).
                        lastName(course.getInstructor().getUser().getLastName()).
                        accountName(course.getInstructor().getUser().getAccountName()).
                        bio(course.getInstructor().getUser().getBio()).
                        expertise(course.getInstructor().getExpertise()).
                        qualification(course.getInstructor().getQualification()).
                        totalCourses(course.getInstructor().getTotalActiveCourses()).
                        slug(course.getInstructor().getSlug()).
                        avatar(course.getInstructor().getUser().getAvatar()).
                        build() : null).
                createdAt(course.getCreatedAt().toString()).
                updatedAt(course.getUpdatedAt().toString()).
                build();
    }
}
