package com.ptit.onlinelearning.service.auth;


import com.ptit.onlinelearning.component.SendGridSender;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationCode {

    private final StringRedisTemplate redisTemplate;
    private final SendGridSender sendGridSender;



    public void generateAndSendOtp(String email) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000)); // 6 số
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        ops.set("otp:" + email, otp, 5, TimeUnit.MINUTES);
        sendGridSender.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String inputOtp) {
        String key = "otp:" + email;
        String savedOtp = redisTemplate.opsForValue().get(key);
        if (savedOtp != null && savedOtp.equals(inputOtp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }


    public void sendOtpToResetPassword(String email, String accountName) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        ops.set("otp:reset:" + email, otp, 10, TimeUnit.MINUTES);
        sendGridSender.sendOtpResetPasswordEmail(email, otp, accountName);
    }
    public boolean verifyOtpResetPassword(String email, String inputOtp) {
        String key = "otp:reset:" + email;
        String savedOtp = redisTemplate.opsForValue().get(key);
        if (savedOtp != null && savedOtp.equals(inputOtp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    public String generateResetToken(String email) {
        String resetToken = UUID.randomUUID().toString();
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        ops.set("reset_token:" + email, resetToken, 15, TimeUnit.MINUTES);
        return resetToken;
    }

    public boolean verifyResetToken(String email, String token) {
        String key = "reset_token:" + email;
        String savedToken = redisTemplate.opsForValue().get(key);
        return savedToken != null && savedToken.equals(token);
    }

    public void deleteResetToken(String email) {
        redisTemplate.delete("reset_token:" + email);
    }

    public void sendPasswordChangeSuccessNotification(String email, String accountName) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String changeTime = now.format(formatter);
        
        sendGridSender.sendPasswordChangeSuccessEmail(email, accountName, changeTime);
    }
}
