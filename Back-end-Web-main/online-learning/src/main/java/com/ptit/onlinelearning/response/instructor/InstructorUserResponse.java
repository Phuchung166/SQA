package com.ptit.onlinelearning.response.instructor;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class InstructorUserResponse {

    private String email;

    private String firstName;

    private String lastName;

    private String phone;

    private String avatar;

    private String bio;

    private String expertise;

    private String experienceYears;

    private String bankAccount;

    private String bankName;

    private String qualification;

    private  Long totalCourses;

    private Long totalStudents;

    private InstructorReviewResponse review;
}
