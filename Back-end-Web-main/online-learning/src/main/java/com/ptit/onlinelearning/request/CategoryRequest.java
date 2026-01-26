package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CategoryRequest {
    @NotEmpty(message = "Category's name cannot be empty")
    @Size(max = 100, message = "Category name must not exceed 100 characters")
    private String name;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    @Pattern(regexp = "^(https?://).*$", message = "Image must be a valid URL")
    private String image;

    private Long parentId;
}
