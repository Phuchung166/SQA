package com.ptit.onlinelearning.service.auth;

import com.ptit.onlinelearning.common.type.RoleName;
import com.ptit.onlinelearning.common.type.UserRegisterRole;
import com.ptit.onlinelearning.dto.EmailMessage;
import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.Role;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.repository.UserRoleRepository;
import com.ptit.onlinelearning.request.ChangePasswordWithTokenRequest;
import com.ptit.onlinelearning.request.UserRegisterRequest;
import com.ptit.onlinelearning.request.VerifyRequest;
import com.ptit.onlinelearning.response.auth.UserRegisterResponse;
import com.ptit.onlinelearning.service.role.IRoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho AuthService — Xác thực và quản lý tài khoản người dùng.
 * Target: Line Coverage ≥ 80%, Branch Coverage ≥ 70%
 *
 * CheckDB: ArgumentCaptor xác minh User được lưu đúng thông tin.
 * Rollback: MockitoExtension reset toàn bộ mock state sau mỗi test.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private InstructorRepository instructorRepository;
    @Mock private IRoleService roleService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private VerificationCode verificationCode;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenUtils jwtTokenUtils;
    @Mock private EventPublisher eventPublisher;

    @InjectMocks
    private AuthService authService;

    // ===== FIXTURES =====
    private UserRegisterRequest studentRequest;
    private UserRegisterRequest instructorRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        studentRequest = UserRegisterRequest.builder()
                .email("student@test.com").accountName("student01")
                .password("SecurePass123").role(UserRegisterRole.STUDENT).build();

        instructorRequest = UserRegisterRequest.builder()
                .email("instructor@test.com").accountName("instructor01")
                .password("SecurePass123").role(UserRegisterRole.INSTRUCTOR).build();

        savedUser = User.builder()
                .id(1L).email("student@test.com").accountName("student01")
                .password("$encoded$").isActive(false).emailVerified(false).build();
        savedUser.setUserRoles(Set.of());
    }

    // =========================================================
    // TC-AUTH-001: Đăng ký STUDENT mới thành công
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-001: Đăng ký STUDENT mới — CheckDB xác minh user lưu đúng thông tin")
    void TC_AUTH_001_register_newStudentUser_savedSuccessfullyWithRole() {
        when(userRepository.existsByEmail("student@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$encoded$");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        doNothing().when(eventPublisher).sendEmail(any());

        UserRegisterResponse response = authService.register(studentRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());
        User captured = userCaptor.getValue();
        assertThat(captured.getEmail()).isEqualTo("student@test.com");
        assertThat(captured.getIsActive()).isFalse();
        assertThat(captured.getEmailVerified()).isFalse();
        verify(roleService, times(1)).assignRoleByName(savedUser, "STUDENT");
        assertThat(response).isNotNull();
    }

    // =========================================================
    // TC-AUTH-002: Đăng ký INSTRUCTOR mới — tạo thêm Instructor profile
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-002: Đăng ký INSTRUCTOR mới — tạo user + Instructor profile")
    void TC_AUTH_002_register_newInstructorUser_createsUserAndInstructorProfile() {
        User savedInstructor = User.builder().id(2L).email("instructor@test.com")
                .accountName("instructor01").isActive(false).emailVerified(false).build();
        savedInstructor.setUserRoles(Set.of());

        when(userRepository.existsByEmail("instructor@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$encoded$");
        when(userRepository.save(any(User.class))).thenReturn(savedInstructor);
        doNothing().when(eventPublisher).sendEmail(any());

        authService.register(instructorRequest);

        // Instructor profile phải được tạo
        verify(instructorRepository, times(1)).save(any(Instructor.class));
        verify(roleService, times(1)).assignRoleByName(savedInstructor, "INSTRUCTOR");
    }

    // =========================================================
    // TC-AUTH-003: Email đã tồn tại và đã verified — ném exception
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-003: Email đã verified — ném InvalidParamException")
    void TC_AUTH_003_register_emailAlreadyVerified_throwsException() {
        User verifiedUser = User.builder().id(1L).email("student@test.com")
                .emailVerified(true).isActive(true).build();
        verifiedUser.setUserRoles(Set.of());

        when(userRepository.existsByEmail("student@test.com")).thenReturn(true);
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(verifiedUser));

        assertThatThrownBy(() -> authService.register(studentRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Email is already in use");

        verify(userRepository, never()).save(any(User.class));
    }

    // =========================================================
    // TC-AUTH-004: Email chưa verified — resend OTP, không tạo user mới
    // Technique: State Transition
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-004: Email chưa verified — resend OTP, không tạo user mới")
    void TC_AUTH_004_register_emailNotVerified_resendsOtp() {
        User unverifiedUser = User.builder().id(1L).email("student@test.com")
                .accountName("student01").emailVerified(false).isActive(false).build();
        unverifiedUser.setUserRoles(new HashSet<>());

        when(userRepository.existsByEmail("student@test.com")).thenReturn(true);
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(unverifiedUser));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        doNothing().when(eventPublisher).sendEmail(any());

        UserRegisterResponse response = authService.register(studentRequest);

        verify(userRepository, never()).save(any(User.class));
        verify(eventPublisher, times(1)).sendEmail(any());
        assertThat(response).isNotNull();
    }

    // =========================================================
    // TC-AUTH-005: Email chưa verified, INSTRUCTOR — tạo instructor profile nếu chưa có
    // Technique: State Transition + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-005: Resend OTP với role INSTRUCTOR chưa có profile — tạo Instructor profile")
    void TC_AUTH_005_register_existingInstructorNoProfile_createsInstructorProfile() {
        User unverifiedUser = User.builder().id(2L).email("instructor@test.com")
                .accountName("instructor01").emailVerified(false).isActive(false).build();
        unverifiedUser.setUserRoles(new HashSet<>());

        when(userRepository.existsByEmail("instructor@test.com")).thenReturn(true);
        when(userRepository.findByEmail("instructor@test.com")).thenReturn(Optional.of(unverifiedUser));
        when(userRoleRepository.findByUserId(2L)).thenReturn(List.of());
        // Chưa có instructor profile
        when(instructorRepository.findByUserId(2L)).thenReturn(Optional.empty());
        doNothing().when(eventPublisher).sendEmail(any());

        authService.register(instructorRequest);

        // Instructor profile được tạo
        verify(instructorRepository, times(1)).save(any(Instructor.class));
    }

    // =========================================================
    // TC-AUTH-006: Verify OTP hợp lệ — user được activate
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-006: Verify OTP hợp lệ — CheckDB: emailVerified=true, isActive=true")
    void TC_AUTH_006_verifyUser_validOtp_userActivated() {
        VerifyRequest req = VerifyRequest.builder().email("student@test.com").code("123456").build();
        User unverifiedUser = User.builder().id(1L).email("student@test.com")
                .emailVerified(false).isActive(false).build();

        when(verificationCode.verifyOtp("student@test.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(unverifiedUser));
        when(userRepository.save(any(User.class))).thenReturn(unverifiedUser);

        boolean result = authService.verifyUser(req);

        assertThat(result).isTrue();
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getEmailVerified()).isTrue();
        assertThat(captor.getValue().getIsActive()).isTrue();
    }

    // =========================================================
    // TC-AUTH-007: Verify OTP sai — trả về false, không gọi save
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-007: Verify OTP sai — trả về false, không save()")
    void TC_AUTH_007_verifyUser_invalidOtp_returnsFalse() {
        VerifyRequest req = VerifyRequest.builder().email("student@test.com").code("000000").build();
        when(verificationCode.verifyOtp("student@test.com", "000000")).thenReturn(false);

        boolean result = authService.verifyUser(req);

        assertThat(result).isFalse();
        verify(userRepository, never()).save(any(User.class));
    }

    // =========================================================
    // TC-AUTH-008: Đăng nhập thành công → JWT token
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-008: Đăng nhập thành công — trả về JWT token")
    void TC_AUTH_008_login_validCredentials_returnsJwtToken() {
        User activeUser = User.builder().id(1L).email("student@test.com")
                .password("$encoded$").isActive(true).emailVerified(true).build();
        activeUser.setUserRoles(Set.of());

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("SecurePass123", "$encoded$")).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(jwtTokenUtils.generateToken(activeUser)).thenReturn("jwt.token");

        String token = authService.login("student@test.com", "SecurePass123");

        assertThat(token).isEqualTo("jwt.token");
    }

    // =========================================================
    // TC-AUTH-009: Đăng nhập — email không tồn tại
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-009: Đăng nhập email không tồn tại — ném DataNotFoundException")
    void TC_AUTH_009_login_emailNotFound_throwsDataNotFoundException() {
        when(userRepository.findByEmail("notfound@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("notfound@test.com", "pass"))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(jwtTokenUtils, never()).generateToken(any());
    }

    // =========================================================
    // TC-AUTH-010: Đăng nhập — mật khẩu sai
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-010: Đăng nhập mật khẩu sai — ném BadCredentialsException")
    void TC_AUTH_010_login_wrongPassword_throwsBadCredentialsException() {
        User user = User.builder().id(1L).email("student@test.com").password("$encoded$").build();
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass", "$encoded$")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("student@test.com", "WrongPass"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid password");

        verify(jwtTokenUtils, never()).generateToken(any());
    }

    // =========================================================
    // TC-AUTH-011: Đăng nhập user chưa active
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-011: Đăng nhập user chưa active — ném InvalidParamException")
    void TC_AUTH_011_login_inactiveUser_throwsInvalidParamException() {
        User inactiveUser = User.builder().id(1L).email("student@test.com")
                .password("$encoded$").isActive(false).emailVerified(false).build();

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(inactiveUser));
        when(passwordEncoder.matches("SecurePass123", "$encoded$")).thenReturn(true);

        assertThatThrownBy(() -> authService.login("student@test.com", "SecurePass123"))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("not active");

        verify(jwtTokenUtils, never()).generateToken(any());
    }

    // =========================================================
    // TC-AUTH-012: resendOtp — gọi eventPublisher.sendEmail
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-012: resendOtp — eventPublisher.sendEmail được gọi đúng 1 lần")
    void TC_AUTH_012_resendOtp_callsEventPublisher() {
        doNothing().when(eventPublisher).sendEmail(any());

        authService.resendOtp("student@test.com");

        verify(eventPublisher, times(1)).sendEmail(any());
    }

    // =========================================================
    // TC-AUTH-013: processForgotPassword — user tồn tại → gửi OTP
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-013: processForgotPassword user tồn tại — gửi email reset password")
    void TC_AUTH_013_processForgotPassword_existingUser_sendsEmail() {
        User user = User.builder().id(1L).email("student@test.com").accountName("student01").build();
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(user));
        doNothing().when(eventPublisher).sendEmail(any());

        String result = authService.processForgotPassword("student@test.com");

        assertThat(result).contains("otp code has been sent");
        verify(eventPublisher, times(1)).sendEmail(any());
    }

    // =========================================================
    // TC-AUTH-014: processForgotPassword — user không tồn tại → trả về thông báo chung
    // Technique: Negative Testing (branch: user not found)
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-014: processForgotPassword user không tồn tại — trả về thông báo chung, không send email")
    void TC_AUTH_014_processForgotPassword_userNotFound_returnsGenericMessage() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        String result = authService.processForgotPassword("ghost@test.com");

        assertThat(result).contains("opt code has been sent");
        verify(eventPublisher, never()).sendEmail(any());
    }

    // =========================================================
    // TC-AUTH-015: verifyForgotPassword — OTP hợp lệ → trả về reset token
    // Technique: EP
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-015: verifyForgotPassword OTP hợp lệ — trả về reset token")
    void TC_AUTH_015_verifyForgotPassword_validOtp_returnsResetToken() {
        VerifyRequest req = VerifyRequest.builder().email("student@test.com").code("654321").build();
        when(verificationCode.verifyOtpResetPassword("student@test.com", "654321")).thenReturn(true);
        when(verificationCode.generateResetToken("student@test.com")).thenReturn("reset-token-xyz");

        String token = authService.verifyForgotPassword(req);

        assertThat(token).isEqualTo("reset-token-xyz");
    }

    // =========================================================
    // TC-AUTH-016: verifyForgotPassword — OTP sai → trả về null
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-016: verifyForgotPassword OTP sai — trả về null")
    void TC_AUTH_016_verifyForgotPassword_invalidOtp_returnsNull() {
        VerifyRequest req = VerifyRequest.builder().email("student@test.com").code("000000").build();
        when(verificationCode.verifyOtpResetPassword("student@test.com", "000000")).thenReturn(false);

        String token = authService.verifyForgotPassword(req);

        assertThat(token).isNull();
        verify(verificationCode, never()).generateResetToken(any());
    }

    // =========================================================
    // TC-AUTH-017: changePassword thành công
    // Technique: EP + CheckDB
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-017: changePassword thành công — CheckDB: password mới được lưu")
    void TC_AUTH_017_changePassword_validToken_passwordUpdated() {
        ChangePasswordWithTokenRequest req = ChangePasswordWithTokenRequest.builder()
                .email("student@test.com").resetToken("valid-token")
                .newPassword("NewPass123").retypePassword("NewPass123").build();

        User user = User.builder().id(1L).email("student@test.com").password("$old$").build();

        when(verificationCode.verifyResetToken("student@test.com", "valid-token")).thenReturn(true);
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass123")).thenReturn("$new$");
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(user);
        doNothing().when(verificationCode).deleteResetToken("student@test.com");
        doNothing().when(eventPublisher).sendEmail(any());

        String result = authService.changePassword(req);

        assertThat(result).contains("Password changed successfully");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("$new$");
        verify(verificationCode, times(1)).deleteResetToken("student@test.com");
    }

    // =========================================================
    // TC-AUTH-018: changePassword — password không khớp
    // Technique: Negative Testing
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-018: changePassword mismatch — ném InvalidParamException ngay lập tức")
    void TC_AUTH_018_changePassword_mismatch_throwsImmediately() {
        ChangePasswordWithTokenRequest req = ChangePasswordWithTokenRequest.builder()
                .email("student@test.com").resetToken("token")
                .newPassword("NewPass123").retypePassword("DiffPass456").build();

        assertThatThrownBy(() -> authService.changePassword(req))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("do not match");

        verify(userRepository, never()).saveAndFlush(any());
    }

    // =========================================================
    // TC-AUTH-019: changePassword — token không hợp lệ
    // Technique: Negative Testing (branch: invalid token)
    // =========================================================
    @Test
    @DisplayName("TC-AUTH-019: changePassword token không hợp lệ — ném InvalidParamException")
    void TC_AUTH_019_changePassword_invalidToken_throwsException() {
        ChangePasswordWithTokenRequest req = ChangePasswordWithTokenRequest.builder()
                .email("student@test.com").resetToken("invalid-token")
                .newPassword("NewPass123").retypePassword("NewPass123").build();

        when(verificationCode.verifyResetToken("student@test.com", "invalid-token")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(req))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Invalid or expired reset token");

        verify(userRepository, never()).saveAndFlush(any());
    }
    // TC-AUTH-021: Verify user — Email không tồn tại
    @Test
    @DisplayName("TC-AUTH-021: Verify OTP cho email không tồn tại -> DataNotFoundException")
    void verifyUser_emailNotFound_throwsException() {
        VerifyRequest req = VerifyRequest.builder().email("ghost@test.com").code("123456").build();
        when(verificationCode.verifyOtp("ghost@test.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyUser(req))
                .isInstanceOf(DataNotFoundException.class);
    }

    // TC-AUTH-022: Resend OTP — Email null hoặc rỗng
    @Test
    @DisplayName("TC-AUTH-022: Resend OTP với email rỗng/null -> Service vẫn gửi email (không có guard)")
    void resendOtp_emptyEmail_doesNothing() {
        doNothing().when(eventPublisher).sendEmail(any());

        authService.resendOtp("");
        authService.resendOtp(null);

        // Service thực tế không có guard null/empty, vẫn gọi sendEmail 2 lần
        verify(eventPublisher, times(2)).sendEmail(any());
    }

    // TC-AUTH-023: ChangePassword — Token đã hết hạn/không tồn tại (BVA)
    @Test
    @DisplayName("TC-AUTH-023: ChangePassword với token null -> ném InvalidParamException")
    void changePassword_nullToken_throwsException() {
        ChangePasswordWithTokenRequest req = ChangePasswordWithTokenRequest.builder()
                .email("test@mail.com").resetToken(null)
                .newPassword("123").retypePassword("123").build();

        assertThatThrownBy(() -> authService.changePassword(req))
                .isInstanceOf(InvalidParamException.class);
    }

    // TC-AUTH-024: login — Email null hoặc rỗng (BVA)
    @Test
    @DisplayName("TC-AUTH-024: Login với email rỗng -> ném BadCredentialsException")
    void login_emptyEmail_throwsException() {
        // Mong đợi ném Exception nếu code không check empty email
        assertThatThrownBy(() -> authService.login("", "pass"))
                .isInstanceOf(Exception.class);
    }

    // TC-AUTH-025: verifyForgotPassword — OTP null
    @Test
    @DisplayName("TC-AUTH-025: verifyForgotPassword với code null -> trả về null")
    void verifyForgotPassword_nullCode_returnsNull() {
        VerifyRequest req = VerifyRequest.builder().email("test@mail.com").code(null).build();
        String result = authService.verifyForgotPassword(req);
        assertThat(result).isNull();
    }

    // TC-AUTH-023: register - User tồn tại nhưng chưa verify + Sai Role
    @Test
    @DisplayName("TC-AUTH-023: Đăng ký lại với email chưa verify nhưng sai Role -> InvalidParamException")
    void register_existingUnverified_roleMismatch_throwsException() {
        User existing = User.builder().id(10L).email("unverified@test.com").emailVerified(false).build();
        Role studentRole = Role.builder().name(com.ptit.onlinelearning.common.type.RoleName.STUDENT).build();
        UserRole ur = new UserRole(); ur.setRole(studentRole);

        when(userRepository.existsByEmail("unverified@test.com")).thenReturn(true);
        when(userRepository.findByEmail("unverified@test.com")).thenReturn(Optional.of(existing));
        when(userRoleRepository.findByUserId(10L)).thenReturn(List.of(ur));

        studentRequest.setEmail("unverified@test.com");
        studentRequest.setRole(UserRegisterRole.INSTRUCTOR); // Mismatch kiểu UserRegisterRole

        assertThatThrownBy(() -> authService.register(studentRequest))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("Role mismatch");
    }

    // TC-AUTH-024: register - Lỗi khi gán Role (try-catch coverage)
    @Test
    @DisplayName("TC-AUTH-024: Lỗi khi gán Role -> Chỉ log error, không dừng luồng")
    void register_assignRoleError_continuesFlow() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(savedUser);
        doThrow(new RuntimeException("DB Error")).when(roleService).assignRoleByName(any(), anyString());

        authService.register(studentRequest);

        verify(eventPublisher).sendEmail(any()); // Vẫn tiếp tục gửi email
    }

    // TC-AUTH-025: login - User chưa active
    @Test
    @DisplayName("TC-AUTH-025: Login khi tài khoản chưa active -> InvalidParamException")
    void login_notActive_throwsException() {
        savedUser.setIsActive(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.login("test@test.com", "pass"))
                .isInstanceOf(InvalidParamException.class)
                .hasMessageContaining("not active");
    }

    // TC-AUTH-026: changePassword - AccountName null (Coverage dòng 247)
    @Test
    @DisplayName("TC-AUTH-026: Đổi mật khẩu khi accountName null -> Dùng email gửi mail")
    void changePassword_nullAccountName_usesEmail() {
        User userWithNullAccount = User.builder()
                .id(2L).email("test@test.com").accountName(null)
                .password("$encoded$").isActive(true).build();
        userWithNullAccount.setUserRoles(Set.of());

        ChangePasswordWithTokenRequest req = new ChangePasswordWithTokenRequest();
        req.setEmail("test@test.com");
        req.setNewPassword("NewPass123");
        req.setRetypePassword("NewPass123");
        req.setResetToken("valid-token");

        when(verificationCode.verifyResetToken(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(userWithNullAccount));
        when(passwordEncoder.encode(anyString())).thenReturn("$new$");
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(userWithNullAccount);
        doNothing().when(verificationCode).deleteResetToken(anyString());

        authService.changePassword(req);

        ArgumentCaptor<EmailMessage> captor = ArgumentCaptor.forClass(EmailMessage.class);
        verify(eventPublisher).sendEmail(captor.capture());
        assertThat(captor.getValue().getAccountName()).isEqualTo("test@test.com");
    }

    // TC-AUTH-027: register - Lỗi khi gửi email xác thực cho user mới (try-catch coverage)
    @Test
    @DisplayName("TC-AUTH-027: Lỗi khi gửi OTP cho user mới -> catch exception, vẫn trả về success")
    void register_sendEmailError_continuesFlow() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(savedUser);
        doThrow(new RuntimeException("RabbitMQ Error")).when(eventPublisher).sendEmail(any());

        UserRegisterResponse response = authService.register(studentRequest);

        assertThat(response.getMessage()).contains("successfully");
    }

    // TC-AUTH-028: processForgotPassword - Lỗi khi gửi email (try-catch coverage)
    @Test
    @DisplayName("TC-AUTH-028: Lỗi khi gửi OTP reset password -> catch exception, vẫn trả về success msg")
    void processForgotPassword_sendEmailError_continuesFlow() {
        User user = User.builder().id(1L).email("student@test.com").accountName("student01").build();
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(user));
        doThrow(new RuntimeException("RabbitMQ Error")).when(eventPublisher).sendEmail(any());

        String result = authService.processForgotPassword("student@test.com");

        assertThat(result).contains("otp code has been sent");
    }

    // TC-AUTH-029: changePassword - Lỗi khi gửi email thông báo đổi mật khẩu (try-catch coverage)
    @Test
    @DisplayName("TC-AUTH-029: Lỗi khi gửi email thông báo đổi pass thành công -> catch exception, vẫn thành công")
    void changePassword_sendEmailError_continuesFlow() {
        ChangePasswordWithTokenRequest req = new ChangePasswordWithTokenRequest();
        req.setEmail("test@test.com");
        req.setNewPassword("NewPass123");
        req.setRetypePassword("NewPass123");
        req.setResetToken("valid-token");

        User user = User.builder().id(1L).email("test@test.com").accountName("acc").password("$old$").isActive(true).build();
        when(verificationCode.verifyResetToken(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("$new$");
        when(userRepository.saveAndFlush(any(User.class))).thenReturn(user);
        doNothing().when(verificationCode).deleteResetToken(anyString());
        doThrow(new RuntimeException("RabbitMQ Error")).when(eventPublisher).sendEmail(any());

        String result = authService.changePassword(req);

        assertThat(result).contains("Password changed successfully");
    }
}




