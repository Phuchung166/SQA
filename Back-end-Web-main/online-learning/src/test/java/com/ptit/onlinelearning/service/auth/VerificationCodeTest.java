package com.ptit.onlinelearning.service.auth;

import com.ptit.onlinelearning.component.SendGridSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationCodeTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private SendGridSender sendGridSender;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private VerificationCode verificationCode;

    private final String testEmail = "test@example.com";
    private final String testAccountName = "testUser";

    @BeforeEach
    void setUp() {
        // leniency can be used, but we only stub what we need in each test
    }

    @Test
    @DisplayName("TC-VERIFY-001: generateAndSendOtp - Lưu mã vào Redis và gửi email thành công")
    void TC_VERIFY_001_generateAndSendOtp_success() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), anyString(), eq(5L), eq(TimeUnit.MINUTES));
        doNothing().when(sendGridSender).sendOtpEmail(eq(testEmail), anyString());

        verificationCode.generateAndSendOtp(testEmail);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(valueOperations, times(1)).set(eq("otp:" + testEmail), otpCaptor.capture(), eq(5L), eq(TimeUnit.MINUTES));
        verify(sendGridSender, times(1)).sendOtpEmail(testEmail, otpCaptor.getValue());
        assertThat(otpCaptor.getValue()).matches("\\d{6}");
    }

    @Test
    @DisplayName("TC-VERIFY-002: verifyOtp - OTP hợp lệ, trả về true và xóa khỏi Redis")
    void TC_VERIFY_002_verifyOtp_validOtp_returnsTrue() {
        String key = "otp:" + testEmail;
        String validOtp = "123456";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(validOtp);

        boolean isVerified = verificationCode.verifyOtp(testEmail, validOtp);

        assertThat(isVerified).isTrue();
        verify(redisTemplate, times(1)).delete(key);
    }

    @Test
    @DisplayName("TC-VERIFY-003: verifyOtp - OTP không khớp, trả về false")
    void TC_VERIFY_003_verifyOtp_invalidOtp_returnsFalse() {
        String key = "otp:" + testEmail;
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn("123456"); // saved otp

        boolean isVerified = verificationCode.verifyOtp(testEmail, "999999"); // wrong input

        assertThat(isVerified).isFalse();
        verify(redisTemplate, never()).delete(anyString());
    }

    @Test
    @DisplayName("TC-VERIFY-004: verifyOtp - OTP không tồn tại trong Redis, trả về false")
    void TC_VERIFY_004_verifyOtp_otpIsNull_returnsFalse() {
        String key = "otp:" + testEmail;
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(null);

        boolean isVerified = verificationCode.verifyOtp(testEmail, "123456");

        assertThat(isVerified).isFalse();
        verify(redisTemplate, never()).delete(anyString());
    }

    @Test
    @DisplayName("TC-VERIFY-005: sendOtpToResetPassword - Lưu mã reset vào Redis và gửi email")
    void TC_VERIFY_005_sendOtpToResetPassword_success() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), anyString(), eq(10L), eq(TimeUnit.MINUTES));
        doNothing().when(sendGridSender).sendOtpResetPasswordEmail(eq(testEmail), anyString(), eq(testAccountName));

        verificationCode.sendOtpToResetPassword(testEmail, testAccountName);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(valueOperations, times(1)).set(eq("otp:reset:" + testEmail), otpCaptor.capture(), eq(10L), eq(TimeUnit.MINUTES));
        verify(sendGridSender, times(1)).sendOtpResetPasswordEmail(testEmail, otpCaptor.getValue(), testAccountName);
        assertThat(otpCaptor.getValue()).matches("\\d{6}");
    }

    @Test
    @DisplayName("TC-VERIFY-006: verifyOtpResetPassword - OTP hợp lệ, trả về true và xóa khỏi Redis")
    void TC_VERIFY_006_verifyOtpResetPassword_validOtp_returnsTrue() {
        String key = "otp:reset:" + testEmail;
        String validOtp = "654321";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(validOtp);

        boolean isVerified = verificationCode.verifyOtpResetPassword(testEmail, validOtp);

        assertThat(isVerified).isTrue();
        verify(redisTemplate, times(1)).delete(key);
    }

    @Test
    @DisplayName("TC-VERIFY-007: verifyOtpResetPassword - OTP không hợp lệ hoặc null, trả về false")
    void TC_VERIFY_007_verifyOtpResetPassword_invalidOtp_returnsFalse() {
        String key = "otp:reset:" + testEmail;
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(null);

        boolean isVerified = verificationCode.verifyOtpResetPassword(testEmail, "111111");

        assertThat(isVerified).isFalse();
        verify(redisTemplate, never()).delete(key);
    }

    @Test
    @DisplayName("TC-VERIFY-008: generateResetToken - Tạo token, lưu Redis và trả về token")
    void TC_VERIFY_008_generateResetToken_success() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), anyString(), eq(15L), eq(TimeUnit.MINUTES));

        String token = verificationCode.generateResetToken(testEmail);

        assertThat(token).isNotBlank();
        verify(valueOperations, times(1)).set(eq("reset_token:" + testEmail), eq(token), eq(15L), eq(TimeUnit.MINUTES));
    }

    @Test
    @DisplayName("TC-VERIFY-009: verifyResetToken - Token đúng, trả về true")
    void TC_VERIFY_009_verifyResetToken_validToken_returnsTrue() {
        String key = "reset_token:" + testEmail;
        String token = "uuid-token-string";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(token);

        boolean isVerified = verificationCode.verifyResetToken(testEmail, token);

        assertThat(isVerified).isTrue();
    }

    @Test
    @DisplayName("TC-VERIFY-010: verifyResetToken - Token sai hoặc null, trả về false")
    void TC_VERIFY_010_verifyResetToken_invalidToken_returnsFalse() {
        String key = "reset_token:" + testEmail;
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(key)).thenReturn(null);

        boolean isVerified = verificationCode.verifyResetToken(testEmail, "wrong-token");

        assertThat(isVerified).isFalse();
    }

    @Test
    @DisplayName("TC-VERIFY-011: deleteResetToken - Xóa token khỏi Redis")
    void TC_VERIFY_011_deleteResetToken_success() {
        when(redisTemplate.delete("reset_token:" + testEmail)).thenReturn(true);
        
        verificationCode.deleteResetToken(testEmail);

        verify(redisTemplate, times(1)).delete("reset_token:" + testEmail);
    }

    @Test
    @DisplayName("TC-VERIFY-012: sendPasswordChangeSuccessNotification - Gửi email báo đổi MK thành công")
    void TC_VERIFY_012_sendPasswordChangeSuccessNotification_success() {
        doNothing().when(sendGridSender).sendPasswordChangeSuccessEmail(eq(testEmail), eq(testAccountName), anyString());

        verificationCode.sendPasswordChangeSuccessNotification(testEmail, testAccountName);

        verify(sendGridSender, times(1)).sendPasswordChangeSuccessEmail(eq(testEmail), eq(testAccountName), anyString());
    }
}
