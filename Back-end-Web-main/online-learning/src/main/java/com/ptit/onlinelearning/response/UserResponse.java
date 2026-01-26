package com.ptit.onlinelearning.response;


import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.ptit.onlinelearning.response.view.Views;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserResponse {

    @JsonView(Views.Basic.class)
    private String email;

    @JsonView(Views.Basic.class)
    private String phone;

    @JsonView(Views.Basic.class)
    private String firstName;

    @JsonView(Views.Basic.class)
    private String lastName;

    @JsonView(Views.Basic.class)
    private String avatar;

    @JsonView(Views.Basic.class)
    private LocalDate dateOfBirth;

    @JsonView(Views.Basic.class)
    private String gender;

    @JsonView(Views.Basic.class)
    private String bio;

    @JsonView(Views.Basic.class)
    private String accountName;

    @JsonView(Views.Instructor.class)
    private LocalDateTime enrollmentDate;

    @JsonView(Views.Admin.class)
    private LocalDateTime createdAt;

    @JsonView(Views.Admin.class)
    private LocalDateTime updatedAt;


    public static UserResponse fromEntity(com.ptit.onlinelearning.model.User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .email(user.getEmail())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatar(user.getAvatar())
                .dateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth() : null)
                .gender(user.getGender() != null ? user.getGender() : null)
                .bio(user.getBio())
                .accountName(user.getAccountName())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt() : null)
                .build();
    }
}
