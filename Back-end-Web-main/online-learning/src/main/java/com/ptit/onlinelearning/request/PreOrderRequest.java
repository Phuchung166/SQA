package com.ptit.onlinelearning.request;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PreOrderRequest {

    @Schema(description = "ID of the course for which the pre-order is being made")
    private Long courseId;


    @Schema(description = "ID of the course group for which the pre-order is being made")
    private Long courseGroupId;
}
