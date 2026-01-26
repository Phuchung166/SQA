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
public class CartItemRequest {


    @Schema(description = "ID of the course to be added to the cart", example = "101")
    private Long courseId;

    @Schema(description = "ID of the course group associated with the cart item. Use when add course-group to cart", example = "5")
    private Long courseGroupId;
}
