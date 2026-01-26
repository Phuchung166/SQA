package com.ptit.onlinelearning.integration.controller;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.common.type.UserRegisterRole;
import com.ptit.onlinelearning.dto.EmailMessage;
import com.ptit.onlinelearning.integration.config.BaseIntegrationTest;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Role;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.request.UserRegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@DisplayName("Auth Controller - Register Integration Tests")
class AuthControllerIT extends BaseIntegrationTest {

    @MockitoBean
    private EventPublisher eventPublisher;

    @org.springframework.beans.factory.annotation.Autowired
    private PasswordEncoder passwordEncoder;

    private Role studentRole;
    private Role instructorRole;

    @BeforeEach
    void setUp() throws IOException {

        studentRole = roleRepository.findByName(RoleName.STUDENT)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.STUDENT)
                        .build()));

        instructorRole = roleRepository.findByName(RoleName.INSTRUCTOR)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.INSTRUCTOR)
                        .build()));

        doNothing().when(eventPublisher).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should register new student successfully")
    void shouldRegisterNewStudentSuccessfully() throws Exception {

        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("teststudent")
                .email("student@example.com")
                .password("password123")
                .role(UserRegisterRole.STUDENT)
                .build();


        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("registered successfully")))
                .andExpect(jsonPath("$.account_name", is("teststudent")))
                .andExpect(jsonPath("$.email", is("student@example.com")))
                .andExpect(jsonPath("$.is_active", is(false)))
                .andExpect(jsonPath("$.email_verified", is(false)))
                .andExpect(jsonPath("$.role", is("STUDENT")));

        Optional<User> savedUser = userRepository.findByEmail("student@example.com");
        assertThat(savedUser).isPresent();
        assertThat(savedUser.get().getAccountName()).isEqualTo("teststudent");
        assertThat(savedUser.get().getIsActive()).isFalse();
        assertThat(savedUser.get().getEmailVerified()).isFalse();
        assertThat(passwordEncoder.matches("password123", savedUser.get().getPassword())).isTrue();


        verify(eventPublisher, times(1)).sendEmail(argThat(emailMessage -> {
            EmailMessage msg = (EmailMessage) emailMessage;
            return "OTP_VERIFICATION".equals(msg.getEmailType()) &&
                   "student@example.com".equals(msg.getRecipientEmail());
        }));


        assertThat(userRoleRepository.findByUserId(savedUser.get().getId())).hasSize(1);
    }

    @Test
    @DisplayName("Should register new instructor successfully and create instructor profile")
    void shouldRegisterNewInstructorSuccessfully() throws Exception {
        // Given
        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("testinstructor")
                .email("instructor@example.com")
                .password("password123")
                .role(UserRegisterRole.INSTRUCTOR)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("registered successfully")))
                .andExpect(jsonPath("$.account_name", is("testinstructor")))
                .andExpect(jsonPath("$.email", is("instructor@example.com")))
                .andExpect(jsonPath("$.role", is("INSTRUCTOR")));

        // Verify user was saved
        Optional<User> savedUser = userRepository.findByEmail("instructor@example.com");
        assertThat(savedUser).isPresent();

        // Verify instructor profile was created
        Optional<Instructor> instructorProfile = instructorRepository.findByUserId(savedUser.get().getId());
        assertThat(instructorProfile).isPresent();
        assertThat(instructorProfile.get().getUserId()).isEqualTo(savedUser.get().getId());
        assertThat(instructorProfile.get().getSlug()).contains("testinstructor");

        // Verify email was queued via RabbitMQ
        verify(eventPublisher, times(1)).sendEmail(argThat(emailMessage -> {
            EmailMessage msg = (EmailMessage) emailMessage;
            return "OTP_VERIFICATION".equals(msg.getEmailType()) &&
                   "instructor@example.com".equals(msg.getRecipientEmail());
        }));
    }

    @Test
    @DisplayName("Should return error when email already exists and is verified")
    void shouldReturnErrorWhenEmailAlreadyExistsAndVerified() throws Exception {
        // Given - Create an existing verified user
        User existingUser = User.builder()
                .accountName("existinguser")
                .email("existing@example.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(true)
                .emailVerified(true)
                .build();
        userRepository.save(existingUser);

        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("newuser")
                .email("existing@example.com")
                .password("newpassword123")
                .role(UserRegisterRole.STUDENT)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no email was queued
        verify(eventPublisher, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should resend OTP when email exists but not verified")
    void shouldResendOtpWhenEmailExistsButNotVerified() throws Exception {
        // Given - Create an existing unverified user with STUDENT role
        User existingUser = User.builder()
                .accountName("unverifieduser")
                .email("unverified@example.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(false)
                .emailVerified(false)
                .build();
        existingUser = userRepository.save(existingUser);

        // Assign STUDENT role
        User finalExistingUser = existingUser;
        roleRepository.findByName(RoleName.STUDENT).ifPresent(role -> {
            userRoleRepository.save(com.ptit.onlinelearning.model.UserRole.builder()
                    .user(finalExistingUser)
                    .role(role)
                    .build());
        });

        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("unverifieduser")
                .email("unverified@example.com")
                .password("password123")
                .role(UserRegisterRole.STUDENT)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("verify your email")))
                .andExpect(jsonPath("$.email", is("unverified@example.com")));

        // Verify email was queued via RabbitMQ
        verify(eventPublisher, times(1)).sendEmail(argThat(emailMessage -> {
            EmailMessage msg = (EmailMessage) emailMessage;
            return "OTP_VERIFICATION".equals(msg.getEmailType()) &&
                   "unverified@example.com".equals(msg.getRecipientEmail());
        }));

        // Verify no new user was created
        assertThat(userRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Should return validation error when account name is too short")
    void shouldReturnValidationErrorWhenAccountNameTooShort() throws Exception {
        // Given
        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("abc")  // Less than 5 characters
                .email("test@example.com")
                .password("password123")
                .role(UserRegisterRole.STUDENT)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no user was created
        assertThat(userRepository.findByEmail("test@example.com")).isEmpty();
        // Verify no email was queued
        verify(eventPublisher, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should return validation error when email is invalid")
    void shouldReturnValidationErrorWhenEmailInvalid() throws Exception {
        // Given
        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("testuser")
                .email("invalid-email")  // Invalid email format
                .password("password123")
                .role(UserRegisterRole.STUDENT)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no email was queued
        verify(eventPublisher, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should return validation error when password is too short")
    void shouldReturnValidationErrorWhenPasswordTooShort() throws Exception {
        // Given
        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("testuser")
                .email("test@example.com")
                .password("short")  // Less than 8 characters
                .role(UserRegisterRole.STUDENT)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no email was queued
        verify(eventPublisher, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should return validation error when role is missing")
    void shouldReturnValidationErrorWhenRoleMissing() throws Exception {
        // Given - Create request without role
        String requestJson = """
                {
                    "account_name": "testuser",
                    "email": "test@example.com",
                    "password": "password123"
                }
                """;

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no email was queued
        verify(eventPublisher, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should return error when trying to register with different role for same email")
    void shouldReturnErrorWhenRoleMismatch() throws Exception {
        // Given - Create an existing unverified user with STUDENT role
        User existingUser = User.builder()
                .accountName("studentuser")
                .email("roletest@example.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(false)
                .emailVerified(false)
                .build();
        existingUser = userRepository.save(existingUser);

        // Assign STUDENT role
        User finalExistingUser = existingUser;
        roleRepository.findByName(RoleName.STUDENT).ifPresent(role -> {
            userRoleRepository.save(com.ptit.onlinelearning.model.UserRole.builder()
                    .user(finalExistingUser)
                    .role(role)
                    .build());
        });

        // Try to register same email with INSTRUCTOR role
        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("studentuser")
                .email("roletest@example.com")
                .password("password123")
                .role(UserRegisterRole.INSTRUCTOR)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        // Verify no email was queued due to role mismatch
        verify(eventPublisher, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Should create instructor profile when unverified instructor re-registers")
    void shouldCreateInstructorProfileWhenReRegistering() throws Exception {
        // Given - Create an existing unverified user with INSTRUCTOR role but no instructor profile
        User existingUser = User.builder()
                .accountName("instructoruser")
                .email("instructor-reregister@example.com")
                .password(passwordEncoder.encode("password123"))
                .isActive(false)
                .emailVerified(false)
                .build();
        existingUser = userRepository.save(existingUser);

        // Assign INSTRUCTOR role
        User finalExistingUser = existingUser;
        roleRepository.findByName(RoleName.INSTRUCTOR).ifPresent(role -> {
            userRoleRepository.save(com.ptit.onlinelearning.model.UserRole.builder()
                    .user(finalExistingUser)
                    .role(role)
                    .build());
        });

        // Verify no instructor profile exists yet
        assertThat(instructorRepository.findByUserId(existingUser.getId())).isEmpty();

        // Try to register same email with INSTRUCTOR role again
        UserRegisterRequest request = UserRegisterRequest.builder()
                .accountName("instructoruser")
                .email("instructor-reregister@example.com")
                .password("password123")
                .role(UserRegisterRole.INSTRUCTOR)
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("verify your email")))
                .andExpect(jsonPath("$.email", is("instructor-reregister@example.com")))
                .andExpect(jsonPath("$.role", is("INSTRUCTOR")));

        // Verify instructor profile was created
        Optional<Instructor> instructorProfile = instructorRepository.findByUserId(existingUser.getId());
        assertThat(instructorProfile).isPresent();
        assertThat(instructorProfile.get().getSlug()).contains("instructoruser");

        // Verify email was queued via RabbitMQ
        verify(eventPublisher, times(1)).sendEmail(argThat(emailMessage -> {
            EmailMessage msg = (EmailMessage) emailMessage;
            return "OTP_VERIFICATION".equals(msg.getEmailType()) &&
                   "instructor-reregister@example.com".equals(msg.getRecipientEmail());
        }));
    }
}

