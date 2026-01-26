package com.ptit.onlinelearning.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
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
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Schema(description = "Request body for changing password with reset token")
public class ChangePasswordWithTokenRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "User's email address", example = "user@example.com", required = true)
    private String email;
    
    @NotBlank(message = "Reset token is required")
    @Schema(description = "Reset token received after OTP verification", required = true)
    private String resetToken;
    
    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters long")
    @Schema(description = "New password", example = "newPassword123", required = true)
    private String newPassword;

    @NotBlank(message = "Retype password is required")
    @Size(min = 8, message = "Retype password must be at least 8 characters long")
    @Schema(description = "Retype password", example = "newPassword123", required = true)
    private String retypePassword;
}
