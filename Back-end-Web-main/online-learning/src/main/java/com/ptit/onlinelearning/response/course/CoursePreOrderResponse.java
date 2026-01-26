package com.ptit.onlinelearning.response.course;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CoursePreOrderResponse {
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

    private String whatYouLearn;

    private String targetAudiences;

    private BigDecimal preOrderPrice;

    private Integer preOrderTotalSlots;

    private Integer preOrderRemainingSlots;

    private LocalDateTime preOrderStartDate;

    private LocalDateTime preOrderEndDate;

    private CategoryResponse category;

    private InstructorResponse instructor;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class CategoryResponse {

        private Long id;

        private String name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Builder
    public static class InstructorResponse{

        private String firstName;

        private String lastName;

        private String accountName;


        private String slug;

        private String avatar;

        private String expertise;

        private String qualification;

        private String bio;
    }

    public static CoursePreOrderResponse fromEntity(Course course) {
        Instructor instructor = course.getInstructor();
        
        InstructorResponse instructorResponse = null;
        if (instructor != null) {
            instructorResponse = InstructorResponse.builder()
                    .firstName(instructor.getUser() != null ? instructor.getUser().getFirstName() : null)
                    .lastName(instructor.getUser() != null ? instructor.getUser().getLastName() : null)
                    .accountName(instructor.getUser() != null ? instructor.getUser().getAccountName() : null)
                    .slug(instructor.getSlug())
                    .avatar(instructor.getUser() != null ? instructor.getUser().getAvatar() : null)
                    .expertise(instructor.getExpertise())
                    .qualification(instructor.getQualification())
                    .bio(instructor.getUser().getBio())
                    .build();
        }

        CategoryResponse categoryResponse = null;
        if (course.getCategory() != null) {
            categoryResponse = CategoryResponse.builder()
                    .id(course.getCategory().getId())
                    .name(course.getCategory().getName())
                    .build();
        }
        
        return CoursePreOrderResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .thumbnail(course.getThumbnail())
                .previewVideo(course.getPreviewVideo())
                .level(course.getLevel() != null ? course.getLevel().name() : null)
                .language(course.getLanguage())
                .price(course.getPrice())
                .currency(course.getCurrency() != null ? course.getCurrency().name() : null)
                .whatYouLearn(course.getWhatYouLearn())
                .targetAudiences(course.getTargetAudiences())
                .preOrderPrice(course.getPreOrderPrice())
                .preOrderTotalSlots(course.getPreOrderTotalSlots())
                .preOrderRemainingSlots(course.getPreOrderRemainingSlots())
                .preOrderStartDate(course.getPreOrderStartDate())
                .preOrderEndDate(course.getPreOrderEndDate())
                .category(categoryResponse)
                .instructor(instructorResponse)
                .build();
    }

}
