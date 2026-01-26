package com.ptit.onlinelearning.response.auth;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.ptit.onlinelearning.model.User;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRegisterResponse {

    private String message;

    @JsonProperty("account_name")
    private String accountName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("is_active")
    private boolean isActive;


    @JsonProperty("email_verified")
    private boolean emailVerified;

    private String role;


    public static UserRegisterResponse fromEntity(User user, String message, String role) {
        if(user == null){
            return null;
        }
        return UserRegisterResponse.builder()
                .message(message)
                .accountName(user.getAccountName())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .role(role)
                .build();

    }
}
