package com.ptit.onlinelearning.integration.fixtures;

import com.ptit.onlinelearning.common.type.UserRegisterRole;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.request.UserRegisterRequest;

/**
 * Test data builder for creating test users and requests.
 * Provides convenient methods to create test data with sensible defaults.
 */
public class UserTestDataBuilder {

    private String accountName = "testuser";
    private String email = "test@example.com";
    private String password = "password123";
    private UserRegisterRole role = UserRegisterRole.STUDENT;
    private boolean isActive = false;
    private boolean emailVerified = false;

    public static UserTestDataBuilder aUser() {
        return new UserTestDataBuilder();
    }

    public static UserTestDataBuilder aStudent() {
        return new UserTestDataBuilder()
                .withRole(UserRegisterRole.STUDENT);
    }

    public static UserTestDataBuilder anInstructor() {
        return new UserTestDataBuilder()
                .withRole(UserRegisterRole.INSTRUCTOR);
    }

    public UserTestDataBuilder withAccountName(String accountName) {
        this.accountName = accountName;
        return this;
    }

    public UserTestDataBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    public UserTestDataBuilder withPassword(String password) {
        this.password = password;
        return this;
    }

    public UserTestDataBuilder withRole(UserRegisterRole role) {
        this.role = role;
        return this;
    }

    public UserTestDataBuilder withIsActive(boolean isActive) {
        this.isActive = isActive;
        return this;
    }

    public UserTestDataBuilder withEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
        return this;
    }

    public UserTestDataBuilder verified() {
        this.emailVerified = true;
        this.isActive = true;
        return this;
    }

    public UserTestDataBuilder unverified() {
        this.emailVerified = false;
        this.isActive = false;
        return this;
    }

    /**
     * Builds a UserRegisterRequest for API calls
     */
    public UserRegisterRequest buildRequest() {
        return UserRegisterRequest.builder()
                .accountName(accountName)
                .email(email)
                .password(password)
                .role(role)
                .build();
    }

    /**
     * Builds a User entity for database operations
     * Note: Password should be encoded before saving to database
     */
    public User buildEntity() {
        return User.builder()
                .accountName(accountName)
                .email(email)
                .password(password) // Remember to encode this before saving
                .isActive(isActive)
                .emailVerified(emailVerified)
                .build();
    }
}

