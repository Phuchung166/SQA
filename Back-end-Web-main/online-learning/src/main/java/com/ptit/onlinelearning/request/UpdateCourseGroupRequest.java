package com.ptit.onlinelearning.request;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UpdateCourseGroupRequest {

    private String title;

    private String description;

    private String thumbnail;


    @DecimalMin(value = "0.0")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal customPrice;

    private String whatYouLearn;

    private List<String> courseCodes;

    private List<String> removedCourseCodes;
}
