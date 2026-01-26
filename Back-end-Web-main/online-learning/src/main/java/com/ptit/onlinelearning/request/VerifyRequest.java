package com.ptit.onlinelearning.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Schema(description = "Request body for email verification using OTP")
public class VerifyRequest {
    
    @NotBlank(message = "Code is required")
    @Size(message = "code must be 6 characters long", min = 6, max = 6)
    @Schema(description = "6-digit OTP code sent to user's email", 
            example = "123456", 
            required = true,
            minLength = 6,
            maxLength = 6)
    private String code;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "User's email address to verify", 
            example = "user@example.com", 
            required = true)
    private String email;
}
