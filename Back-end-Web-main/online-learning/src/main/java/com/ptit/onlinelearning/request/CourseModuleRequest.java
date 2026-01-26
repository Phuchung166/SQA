package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CourseModuleRequest {

    @Size(max = 255)
    @NotNull
    private String title;

    private String description;

    @Min(value = 0)
    @NotNull
    private Integer sortOrder;

    @NotNull
    private Long courseId;

    @JsonProperty("lessons")
    private List<CourseModuleRequest.LessonDTO> lessonDTOs;

    @Data
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class LessonDTO{
        @NotEmpty
        @Size(max = 255)
        private String title;

        private String description;

        @Pattern(regexp = "video|document|text")
        @NotNull
        private String contentType;

        @Pattern(regexp = "^(https?://).*$")
        private String videoUrl;

        @NotNull
        private Long duration;

        @Pattern(regexp = "^(https?://).*$")
        private String documentUrl;

        private String content;

        @NotNull
        private Integer sortOrder;

        @NotNull
        private Boolean isMandatory;

        @AssertTrue(message = "At least one of videoUrl, documentUrl, or content must be provided")
        private boolean isValid(){
            return videoUrl != null || documentUrl != null || content != null;
        }
    }
}
