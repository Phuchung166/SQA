package com.ptit.onlinelearning.request;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UpdateInstructorRequest {

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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

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
}
