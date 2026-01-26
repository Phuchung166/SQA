package com.ptit.onlinelearning.consumer;


import com.ptit.onlinelearning.dto.EmailMessage;
import com.ptit.onlinelearning.service.auth.VerificationCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSendConsumer {
    
    private final VerificationCode verificationCode;
    
    @RabbitListener(queues = "${app.rabbitmq.email.send.queue}")
    public void handleEmailMessage(EmailMessage emailMessage) {
        try {
            log.info("Received email message: type={}, recipient={}", 
                    emailMessage.getEmailType(), emailMessage.getRecipientEmail());
            
            switch (emailMessage.getEmailType()) {
                case "OTP_VERIFICATION":
                    handleOtpVerification(emailMessage);
                    break;
                case "PASSWORD_RESET":
                    handlePasswordReset(emailMessage);
                    break;
                case "PASSWORD_CHANGE_SUCCESS":
                    handlePasswordChangeSuccess(emailMessage);
                    break;
                default:
                    log.warn("Unknown email type: {}", emailMessage.getEmailType());
            }
            
            log.info("Email message processed successfully for: {}", emailMessage.getRecipientEmail());
        } catch (Exception e) {
            log.error("Failed to process email message for: {}", emailMessage.getRecipientEmail(), e);
        }
    }
    
    private void handleOtpVerification(EmailMessage emailMessage) {
        verificationCode.generateAndSendOtp(emailMessage.getRecipientEmail());
    }
    
    private void handlePasswordReset(EmailMessage emailMessage) {
        verificationCode.sendOtpToResetPassword(
                emailMessage.getRecipientEmail(), 
                emailMessage.getAccountName()
        );
    }
    
    private void handlePasswordChangeSuccess(EmailMessage emailMessage) {
        verificationCode.sendPasswordChangeSuccessNotification(
                emailMessage.getRecipientEmail(), 
                emailMessage.getAccountName()
        );
    }
}
