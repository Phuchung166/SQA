package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.CourseLevel;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CourseRequest {

    @NotNull
    private String code;

    @NotNull
    @Size(max = 255)
    private String title;

    private String description;

    @Pattern(regexp = "^(https?://).*$")
    private String thumbnail;

    @Pattern(regexp = "^(https?://).*$")
    private String previewVideo;

    @NotNull
    private Long categoryId;

    @NotNull
    private CourseLevel level;

    @Size(min = 2, max = 10)
    @NotNull
    private String language;

    @DecimalMin(value = "0.0")
    @Digits(integer = 8, fraction = 2)
    @NotNull
    private BigDecimal price;

    @NotNull
    private Currency currency;

    @NotNull
    private Boolean isFree;

    private Integer expiredDays;

    @NotNull
    private EnrollmentType enrollmentType;

    private List<String> whatYouLearn;

    private List<String> targetAudiences;

    @JsonProperty("course_modules")
    private List<CourseRequest.CourseModuleDTO> courseModuleDTOs;

    private Boolean isPreOrder;

    private LocalDateTime preOrderStartDate;

    private LocalDateTime preOrderEndDate;

    @DecimalMin(value = "0.0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal preOrderPrice;

    @Min(value = 1)
    private Integer preOrderTotalSlots;

    @Data
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class CourseModuleDTO{
        @Size(max = 255)
        @NotNull
        private String title;

        private String description;

        @Min(value = 0)
        @NotNull
        private Integer sortOrder;

        @JsonProperty("lessons")
        private List<CourseRequest.CourseModuleDTO.LessonDTO> lessonDTOs;

        @Data
        @Getter
        @Setter
        @AllArgsConstructor
        @NoArgsConstructor
        @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
        public static class LessonDTO{
            @NotEmpty
            @Size(max = 255)
            private String title;

            private String description;

            @Pattern(regexp = "video|document|text")
            @NotNull
            private String contentType;

            @Pattern(regexp = "^(https?://).*$")
            private String videoUrl;

            @NotNull
            private Long duration;

            @Pattern(regexp = "^(https?://).*$")
            private String documentUrl;

            private String content;

            @NotNull
            private Integer sortOrder;

            @NotNull
            private Boolean isMandatory;

            @AssertTrue(message = "At least one of videoUrl, documentUrl, or content must be provided")
            private boolean isValid(){
                return videoUrl != null || documentUrl != null || content != null;
            }
        }
    }
}