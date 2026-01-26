package com.ptit.onlinelearning.response.instructor;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopInstructorResponse {

    private String avatar;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;



    private String expertise;

    private String slug;


    @JsonProperty("account_name")
    private String accountName;

    private InstructorReviewResponse review;
}
