package com.ptit.onlinelearning.request;


import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@Builder
public class InitPaymentRequest {

    private String orderNumber;
    private String ipAddress;
    private Long orderId;
    private BigDecimal totalMoney;
    private String orderType;
}
