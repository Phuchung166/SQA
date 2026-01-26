package com.ptit.onlinelearning.response.order;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class OrderDetailResponse {
    private String orderNumber;
    private String currency;
    private PaymentStatus paymentStatus;
    private LocalDateTime orderDate;
    private BigDecimal totalMoney;
    private Set<OrderItemResponse> orderItems = new HashSet<>();
}
