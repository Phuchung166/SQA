package com.ptit.onlinelearning.response.instructor;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.response.PageableResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorIncomeDetailResponse {
    
    private BigDecimal totalIncome;
    
    private BigDecimal commissionRate;
    
    private PageableResponse<InstructorIncomeResponse> courses;
}

