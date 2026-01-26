package com.ptit.onlinelearning.response.quiz;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.model.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class QuizResponse {

    private Long id;
    private String title;
    private String description;
    private Boolean isMandatory;
    private String createdAt;
    private String updatedAt;

    public static QuizResponse fromEntity(Quiz quiz) {
        if (quiz == null) return null;
        QuizResponse quizResponse = new QuizResponse();
        quizResponse.setId(quiz.getId());
        quizResponse.setTitle(quiz.getTitle());
        quizResponse.setDescription(quiz.getDescription());
        quizResponse.setIsMandatory(quiz.getIsMandatory());
        quizResponse.setCreatedAt(quiz.getCreatedAt().toString());
        quizResponse.setUpdatedAt(quiz.getUpdatedAt().toString());
        return quizResponse;
    }
}
