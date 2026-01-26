package com.ptit.onlinelearning.response.quiz;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Builder
public class QuizDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean isMandatory;
    private List<QuestionResponse> questions;

}
