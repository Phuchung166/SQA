package com.ptit.onlinelearning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailMessage {
    private String emailType; // OTP_VERIFICATION, PASSWORD_RESET, PASSWORD_CHANGE_SUCCESS
    private String recipientEmail;
    private String accountName;
    private String otpCode;
}

