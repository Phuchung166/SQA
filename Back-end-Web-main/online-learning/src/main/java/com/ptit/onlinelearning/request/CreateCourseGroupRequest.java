package com.ptit.onlinelearning.request;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.EnrollmentType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateCourseGroupRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;


    @Pattern(regexp = "^(https?://).*$")
    private String thumbnail;


    @DecimalMin(value = "0.0")
    @Digits(integer = 10, fraction = 2)
    @Schema(description = "Price of the course group, must be non-negative. Required when create, not required when update.")
    private BigDecimal price;

    private Currency currency;


    @NotNull
    private EnrollmentType enrollmentType;


    @NotBlank
    private String whatYouLearn;


    @NotNull
    private List<String> courseCodes;

    // Pre-order fields
    private Boolean isPreOrder;

    private LocalDateTime bundlePreorderStartDate;

    private LocalDateTime bundlePreorderEndDate;

    @DecimalMin(value = "0.0")
    @Digits(integer = 12, fraction = 0)
    private BigDecimal preOrderPrice;

    @Min(value = 1)
    private Integer bundleTotalSlots;

}
