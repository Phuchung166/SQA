package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class LessonRequest {

    private Long moduleId;

    @NotEmpty
    @Size(max = 255)
    private String title;

    private String description;

    @Pattern(regexp = "video|document|text")
    @NotNull
    private String contentType;

    @Pattern(regexp = "^(https?://).*$")
    private String videoUrl;

    @Pattern(regexp = "^(https?://).*$")
    private String documentUrl;

    private String content;

    @NotNull
    private Long duration;

    @NotNull
    private Integer sortOrder;

    @NotNull
    private Boolean isMandatory;

    @AssertTrue(message = "At least one of videoUrl, documentUrl, or content must be provided")
    private boolean isValidContent(){
        return videoUrl != null || documentUrl != null || content != null;
    }
}
