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
public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private Integer correctAnswer;
    private Integer totalQuestion;
    private String completedAt;
    private String createdAt;
    private String updatedAt;
}
