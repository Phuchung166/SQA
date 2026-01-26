package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
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
public class SystemStatisticsResponse {

    private Long totalUsers;
    private Long totalCourses;
    private Long totalInstructors;
    private Long totalOrders;
    private Long totalSuccessOrders;
    private BigDecimal totalRevenue;
    private BigDecimal systemIncome;
}
