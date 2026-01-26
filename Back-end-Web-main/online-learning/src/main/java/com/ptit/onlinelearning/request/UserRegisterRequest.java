package com.ptit.onlinelearning.request;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.ptit.onlinelearning.common.type.UserRegisterRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserRegisterRequest {

    @JsonProperty("account_name")
    @NotBlank(message = "Account name is required")
    @Size(min = 5, max = 20, message = "Account name must be between 5 and 20 characters")
    private String accountName;

    @JsonProperty("email")
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @JsonProperty("password")
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;


    @JsonProperty("role")
    @NotNull(message = "Role is required")
    @Schema(description = "User role", example = "STUDENT")
    private UserRegisterRole role;
}
