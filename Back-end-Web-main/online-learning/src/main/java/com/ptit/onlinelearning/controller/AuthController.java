package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.*;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.auth.LoginResponse;
import com.ptit.onlinelearning.response.auth.UserRegisterResponse;
import com.ptit.onlinelearning.service.auth.IAuthService;
import com.ptit.onlinelearning.service.user.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
@Slf4j
public class AuthController {
    private final IUserService userService;
    private final IAuthService authService;

    @Operation(summary = "Register new user", 
               description = "Register a new user account and send OTP verification email")
    @PostMapping("/register")
    public ResponseEntity<UserRegisterResponse> register(@Valid @RequestBody UserRegisterRequest userRegisterRequest) throws IOException {
            UserRegisterResponse userResult = authService.register(userRegisterRequest);
           return  ResponseEntity.ok(userResult);
    }

    @Operation(summary = "Verify user email", 
               description = "Verify user's email address using OTP code sent via email")
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyRequest verifyRequest) {
        boolean isVerified = authService.verifyUser(verifyRequest);
        if (isVerified) {
            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "Email verified successfully",
                            "email", verifyRequest.getEmail(),
                            "verified", true
                    ));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message", "Invalid or expired OTP code",
                            "email", verifyRequest.getEmail(),
                            "verified", false
                    ));
        }
    }

    @Operation(summary = "Resend OTP code", 
               description = "Resend OTP verification code to user's email address")
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ResendOtpRequest resendOtpRequest) throws IOException {
        authService.resendOtp(resendOtpRequest.getEmail());
        return ResponseEntity.ok()
                .body(Map.of(
                        "message", "OTP resent successfully",
                        "email", resendOtpRequest.getEmail()
                ));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
        User user = userService.getUserDetailFromToken(token);
        log.info("Thread {}: User {} logged in successfully", Thread.currentThread().isVirtual(), user.getUsername());
        return ResponseEntity.ok()
                .body(LoginResponse
                        .builder()
                        .token(token)
                        .username(user.getUsername())
                        .tokenType("Bearer")
                        .id(user.getId())
                        .roles(user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                        .build());
    }


    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Initiate password reset process")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        String responseMessage = authService.processForgotPassword(resetPasswordRequest.getEmail());


        return ResponseEntity.ok()
                .body(Map.of(
                        "message", responseMessage
                ));
    }


    @PostMapping("/verify-forgot-password")
    @Operation(summary = "Verify OTP for password reset", description = "Verify OTP code sent for password reset")
    public ResponseEntity<?> verifyForgotPassword(@Valid @RequestBody VerifyRequest verifyRequest) {
        String resetToken = authService.verifyForgotPassword(verifyRequest);
        if (resetToken != null) {
            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "OTP verified successfully",
                            "email", verifyRequest.getEmail(),
                            "resetToken", resetToken
                    ));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message", "Invalid or expired OTP code",
                            "email", verifyRequest.getEmail(),
                            "verified", false
                    ));
        }
    }

    @PatchMapping("/change-password")
    @Operation(summary = "Change password", description = "Change password using reset token")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordWithTokenRequest changePasswordWithTokenRequest) {
        String responseMessage = authService.changePassword(changePasswordWithTokenRequest);
        return ResponseEntity.ok()
                .body(Map.of(
                        "message", responseMessage,
                        "email", changePasswordWithTokenRequest.getEmail()
                ));
    }
}
