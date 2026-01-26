package com.ptit.onlinelearning.request;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UpdateUserRequest {

    @JsonProperty("phone")
    @Pattern(
        regexp = "^(\\+84|0)[0-9]{9,10}$",
        message = "Phone must be valid"
    )
    private String phone;

    @JsonProperty("first_name")
    private String firstName;


    @JsonProperty("last_name")
    private String lastName;


    @JsonProperty("avatar")
    private String avatar;


    @JsonProperty("gender")
    private String gender;


    @JsonProperty("account_name")
    private String accountName;


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    @JsonProperty("bio")
    private String bio;


}
