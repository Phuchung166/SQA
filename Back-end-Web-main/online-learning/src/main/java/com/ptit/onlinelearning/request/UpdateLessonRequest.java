package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.AssertTrue;
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
public class UpdateLessonRequest {

    private Long moduleId;

    @NotEmpty
    @Size(max = 255)
    private String title;

    private String description;

    @Pattern(regexp = "video|document|text")
    private String contentType;

    @Pattern(regexp = "^(https?://).*$")
    private String videoUrl;

    @Pattern(regexp = "^(https?://).*$")
    private String documentUrl;

    private String content;

    private Long duration;

    private Integer sortOrder;

    private Boolean isMandatory;

    @AssertTrue(message = "At least one of videoUrl, documentUrl, or content must be provided")
    private boolean isValidContent(){
        return videoUrl != null || documentUrl != null || content != null;
    }
}
