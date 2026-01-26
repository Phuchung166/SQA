package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.CourseLevel;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateCourseRequest {

    private String code;

    @Size(max = 255)
    private String title;

    private String description;

    @Pattern(regexp = "^(https?://).*$")
    private String thumbnail;

    @Pattern(regexp = "^(https?://).*$")
    private String previewVideo;

    private Long categoryId;

    private CourseLevel level;

    @Size(min = 2, max = 10)
    private String language;

    @DecimalMin(value = "0.0")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal price;

    private Boolean isFree;

    private Currency currency;

    @Min(value = 1)
    private Integer expiredDays;

    private EnrollmentType enrollmentType;

    private List<String> whatYouLearn;

    private List<String> targetAudiences;
}
