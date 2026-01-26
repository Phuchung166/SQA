package com.ptit.onlinelearning.response.order;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.common.type.Currency;
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
public class CartItemResponse {
    private Long id;

    private Long courseId;
    private String title;
    private String slug;

    private BigDecimal price;

    private Currency currency;
    private CourseType courseType;
}
