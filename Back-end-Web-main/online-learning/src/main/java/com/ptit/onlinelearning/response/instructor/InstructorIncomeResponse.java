package com.ptit.onlinelearning.response.instructor;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.CourseType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;



@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorIncomeResponse {

    private String courseTitle;

    private BigDecimal income;

    private String thumbnail;

    private CourseType courseType;

    private Long totalSales;
}
