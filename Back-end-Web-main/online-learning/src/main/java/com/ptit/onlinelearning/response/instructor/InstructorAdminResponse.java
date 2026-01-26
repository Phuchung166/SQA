package com.ptit.onlinelearning.response.instructor;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorAdminResponse extends InstructorUserResponse {

    private String accountName;

    private String dateOfBirth;

    private String gender;

    private String createdAt;

    private String updatedAt;

    private InstructorReviewResponse review;


}
