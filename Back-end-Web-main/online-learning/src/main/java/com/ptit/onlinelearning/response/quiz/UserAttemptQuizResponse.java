package com.ptit.onlinelearning.response.quiz;


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
public class UserAttemptQuizResponse {

    private Long quizId;
    private String quizTitle;
    private Boolean isActive;
    private Long totalAttempts;
    private Long courseModuleId;
    private String courseModuleName;
    private String courseName;
}
