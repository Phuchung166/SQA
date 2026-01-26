package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateInstructorResponse {

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("avatar")
    private String avatar;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("bio")
    private String bio;

    @JsonProperty("expertise")
    private String expertise;

    @JsonProperty("gender")
    private String gender;


    @JsonProperty("date_of_birth")
    private String dateOfBirth;

    @JsonProperty("experience_years")
    private Long experienceYears;

    @JsonProperty("qualifications")
    private String qualifications;

    @JsonProperty("bank_account")
    private String bankAccount;

    @JsonProperty("bank_name")
    private String bankName;

    @JsonProperty("tax_code")
    private String taxCode;

    @JsonProperty("commission_rate")
    private BigDecimal commissionRate;

    private String createdAt;

    private String updatedAt;

    public static UpdateInstructorResponse mapToUpdateInstructorResponse(User user, Instructor instructor) {
        return UpdateInstructorResponse.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .gender(user.getGender() != null ? user.getGender(): null)
                .dateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null)
                .expertise(instructor.getExpertise())
                .experienceYears(instructor.getExperienceYears() != null ? instructor.getExperienceYears().longValue() : null)
                .qualifications(instructor.getQualification())
                .bankAccount(instructor.getBankAccount())
                .bankName(instructor.getBankName())
                .taxCode(instructor.getTaxCode())
                .commissionRate(instructor.getCommissionRate())
                .createdAt(instructor.getCreatedAt() != null ? instructor.getCreatedAt().toString() : null)
                .updatedAt(instructor.getUpdatedAt() != null ? instructor.getUpdatedAt().toString() : null)
                .build();
    }
}
