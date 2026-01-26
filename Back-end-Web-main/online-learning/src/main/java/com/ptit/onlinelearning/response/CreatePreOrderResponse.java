package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.CourseType;
import com.ptit.onlinelearning.response.order.PaymentResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class CreatePreOrderResponse {

    private Long courseId;
    private String courseTitle;
    private CourseType courseType;
    private Integer slotNumber;
    private LocalDateTime preOrderDate;
    private BigDecimal pridePaid;

    private PaymentResponse paymentResponse;
}
