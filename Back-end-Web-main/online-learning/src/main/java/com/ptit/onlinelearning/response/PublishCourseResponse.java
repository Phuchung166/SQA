package com.ptit.onlinelearning.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class PublishCourseResponse {
    private Long courseId;
    private String courseTitle;
    private Long instructorId;
    private String instructorAccountName;
    private String submittedAt;
    private String message;
}
