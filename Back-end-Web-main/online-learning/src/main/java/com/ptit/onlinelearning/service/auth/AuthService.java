package com.ptit.onlinelearning.service.auth;


import com.ptit.onlinelearning.component.JwtTokenUtils;
import com.ptit.onlinelearning.dto.EmailMessage;
import com.ptit.onlinelearning.producer.EventPublisher;
import com.ptit.onlinelearning.request.ChangePasswordWithTokenRequest;
import com.ptit.onlinelearning.request.UserRegisterRequest;
import com.ptit.onlinelearning.request.VerifyRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.exception.InvalidParamException;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.model.UserRole;
import com.ptit.onlinelearning.repository.InstructorRepository;
import com.ptit.onlinelearning.repository.UserRepository;
import com.ptit.onlinelearning.repository.UserRoleRepository;
import com.ptit.onlinelearning.response.auth.UserRegisterResponse;
import com.ptit.onlinelearning.service.role.IRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService implements IAuthService {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final InstructorRepository instructorRepository;
    private final IRoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final VerificationCode verificationCode;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtils jwtTokenUtils;
    private final EventPublisher eventPublisher;

    @Override
    @Transactional
    public UserRegisterResponse register(UserRegisterRequest userRegisterRequest) {
        if (userRepository.existsByEmail(userRegisterRequest.getEmail())) {

          User existingUser = userRepository.findByEmail(userRegisterRequest.getEmail()).get();
          List<UserRole> userRoles = userRoleRepository.findByUserId(existingUser.getId());
          if (existingUser.getEmailVerified()) {
              throw new InvalidParamException("Email is already in use");
          } else {
              String requestedRole = compareRoleRegister(userRegisterRequest, userRoles);
              if ("INSTRUCTOR".equals(requestedRole)) {
                  boolean hasInstructorProfile = instructorRepository.findByUserId(existingUser.getId()).isPresent();
                  if (!hasInstructorProfile) {
                      createInstructorProfile(existingUser);
                  }
              }

              String message = "Please verify your email";
              // Send email via RabbitMQ
              EmailMessage emailMessage = EmailMessage.builder()
                      .emailType("OTP_VERIFICATION")
                      .recipientEmail(existingUser.getEmail())
                      .build();
              eventPublisher.sendEmail(emailMessage);
              log.info("OTP verification email queued for: {}", existingUser.getEmail());
              return UserRegisterResponse.fromEntity(existingUser, message, requestedRole);
          }

        }

        User  newUser = User.builder()
                .email(userRegisterRequest.getEmail())
                .password(passwordEncoder.encode(userRegisterRequest.getPassword()))
                .accountName(userRegisterRequest.getAccountName())
                .isActive(false)
                .emailVerified(false)
                .build();

        newUser = userRepository.save(newUser);
        try {
            String roleName = userRegisterRequest.getRole().name();
            roleService.assignRoleByName(newUser, roleName);
            log.info("Assigned {} role to user: {}", roleName, newUser.getId());
            if ("INSTRUCTOR".equals(roleName)) {
                createInstructorProfile(newUser);
            }
        } catch (Exception e) {
            log.error("Failed to assign role {} to user: {}", userRegisterRequest.getRole().name(), newUser.getId(), e);
        }
        
        try {
            log.info("Attempting to send verification email to: {}", newUser.getEmail());
            // Send email via RabbitMQ
            EmailMessage emailMessage = EmailMessage.builder()
                    .emailType("OTP_VERIFICATION")
                    .recipientEmail(newUser.getEmail())
                    .build();
            eventPublisher.sendEmail(emailMessage);
            log.info("OTP verification email queued successfully for: {}", newUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to queue verification email for user: {} with email: {}", newUser.getId(), newUser.getEmail(), e);
        }

        String message = "User registered successfully. Please verify your email.";

        return UserRegisterResponse.fromEntity(newUser, message, userRegisterRequest.getRole().name());
    }

    private static String compareRoleRegister(UserRegisterRequest userRegisterRequest, List<UserRole> userRoles) {
        String requestedRole = userRegisterRequest.getRole().name();
        if (!userRoles.isEmpty()) {
            String existingRole = userRoles.getFirst().getRole().getName().toString();
            if (!existingRole.equals(requestedRole)) {
                throw new InvalidParamException(
                        String.format("Role mismatch: User already registered with role %s, but requested role is %s",
                                existingRole, requestedRole)
                );
            }
        }
        return requestedRole;
    }

     private void createInstructorProfile(User user) {
             Instructor instructor = Instructor.builder()
                     .userId(user.getId())
                     .slug(user.getAccountName() + "-" + java.util.UUID.randomUUID())
                     .build();
             instructorRepository.save(instructor);
     }

    @Override
    public boolean verifyUser(VerifyRequest verifyRequest) {
        boolean isOtpValid = verificationCode.verifyOtp(verifyRequest.getEmail(), verifyRequest.getCode());
        
        if (!isOtpValid) {
            log.warn("Invalid OTP for email: {}", verifyRequest.getEmail());
            return false;
        }
        User user = userRepository.findByEmail(verifyRequest.getEmail())
                .orElseThrow(() -> new DataNotFoundException("User not found with email: " + verifyRequest.getEmail()));
        
        user.setEmailVerified(true);
        user.setIsActive(true);
        userRepository.save(user);
        log.info("Email verified successfully for user: {}", user.getId());
        return true;
    }

    @Override
    public String login(String email, String password)  {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new DataNotFoundException("User not found with email: " + email);
        }
        User existingUser = optionalUser.get();
        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        if(!existingUser.getIsActive() || !existingUser.getEmailVerified()){
            throw new InvalidParamException("User is not active or email not verified");
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                email, password,
                existingUser.getAuthorities()
        );
        authenticationManager.authenticate(authenticationToken);
       return jwtTokenUtils.generateToken(existingUser);
    }

    @Override
    public void resendOtp(String email) {
        // Send email via RabbitMQ
        EmailMessage emailMessage = EmailMessage.builder()
                .emailType("OTP_VERIFICATION")
                .recipientEmail(email)
                .build();
        eventPublisher.sendEmail(emailMessage);
        log.info("OTP resend email queued for: {}", email);
    }

    @Override
    public String processForgotPassword(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            log.info("User not found with email: {}", email);
            return "If an account with that email exists, a opt code has been sent.";
        }
        User user = optionalUser.get();
        try {
            // Send email via RabbitMQ
            EmailMessage emailMessage = EmailMessage.builder()
                    .emailType("PASSWORD_RESET")
                    .recipientEmail(email)
                    .accountName(user.getAccountName())
                    .build();
            eventPublisher.sendEmail(emailMessage);
            log.info("Password reset OTP email queued for: {}", email);
        } catch (Exception e) {
            log.error("Failed to queue password reset OTP email to: {}", email, e);
        }
        return "If an account with that email exists, a otp code has been sent.";
    }

    @Override
    public String verifyForgotPassword(VerifyRequest verifyRequest) {
        boolean isOtpValid = verificationCode.verifyOtpResetPassword(verifyRequest.getEmail(), verifyRequest.getCode());
        if (!isOtpValid) {
            log.warn("Invalid OTP for password reset for email: {}", verifyRequest.getEmail());
            return null;
        }
        
        // Generate reset token
        String resetToken = verificationCode.generateResetToken(verifyRequest.getEmail());
        log.info("Password reset OTP verified successfully for email: {}", verifyRequest.getEmail());
        return resetToken;
    }

    @Override
    public String changePassword(ChangePasswordWithTokenRequest changePasswordWithTokenRequest) {
        if(!changePasswordWithTokenRequest.getNewPassword().equals(changePasswordWithTokenRequest.getRetypePassword())){
            throw new InvalidParamException("New password and retype password do not match");
        }

        boolean isTokenValid = verificationCode.verifyResetToken(
            changePasswordWithTokenRequest.getEmail(),
            changePasswordWithTokenRequest.getResetToken()
        );
        
        if (!isTokenValid) {
            throw new InvalidParamException("Invalid or expired reset token");
        }
        
        User user = userRepository.findByEmail(changePasswordWithTokenRequest.getEmail())
            .orElseThrow(() -> new DataNotFoundException("User not found with email: " + changePasswordWithTokenRequest.getEmail()));
        
        String encodedPassword = passwordEncoder.encode(changePasswordWithTokenRequest.getNewPassword());
        user.setPassword(encodedPassword);
        userRepository.saveAndFlush(user);
        verificationCode.deleteResetToken(changePasswordWithTokenRequest.getEmail());
        
        try {
            String accountName = user.getAccountName() != null ? user.getAccountName() : user.getEmail();
            // Send email via RabbitMQ
            EmailMessage emailMessage = EmailMessage.builder()
                    .emailType("PASSWORD_CHANGE_SUCCESS")
                    .recipientEmail(user.getEmail())
                    .accountName(accountName)
                    .build();
            eventPublisher.sendEmail(emailMessage);
            log.info("Password change success notification email queued for: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to queue password change success notification to: {}", user.getEmail(), e);
        }
        return "Password changed successfully";
    }

    
}
