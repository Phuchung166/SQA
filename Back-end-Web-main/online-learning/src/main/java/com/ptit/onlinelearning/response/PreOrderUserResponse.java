package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.common.type.PreOrderStatus;
import lombok.*;
import java.math.BigDecimal;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class PreOrderUserResponse {

    private Integer slotNumber;

    private BigDecimal pricePaid;

    private PreOrderStatus status;

    private String preOrderDate;

    private String courseTitle;

    private Long courseId;

    private String courseThumbnail;
}
