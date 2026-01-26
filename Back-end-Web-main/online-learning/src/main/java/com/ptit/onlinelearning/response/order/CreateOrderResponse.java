package com.ptit.onlinelearning.response.order;


import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.Currency;
import com.ptit.onlinelearning.common.type.PaymentStatus;
import com.ptit.onlinelearning.response.view.Views;
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
public class CreateOrderResponse {

    @JsonView(Views.Basic.class)
    private String username;

    @JsonView(Views.Basic.class)
    private String email;

    @JsonView(Views.Basic.class)
    private String orderNumber;

    @JsonView(Views.Basic.class)
    private Currency currency;

    @JsonView(Views.Basic.class)
    private BigDecimal totalMoney;

    @JsonView(Views.Basic.class)
    private PaymentStatus paymentStatus;

    @JsonView(Views.Basic.class)
    private String orderDate;

    @JsonView(Views.Detail.class)
    private PaymentResponse paymentResponse;
}
