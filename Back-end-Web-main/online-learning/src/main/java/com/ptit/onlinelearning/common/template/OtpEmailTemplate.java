package com.ptit.onlinelearning.common.template;

import org.springframework.stereotype.Component;

/**
 * OTP Email Template
 */
@Component
public class OtpEmailTemplate implements EmailTemplate {
    
    @Override
    public String getSubject() {
        return "Mã xác thực OTP - Online Learning Platform";
    }
    
    @Override
    public String getHtmlContent() {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mã xác thực OTP</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 10px;
                    }
                    .title {
                        color: #1f2937;
                        font-size: 20px;
                        margin-bottom: 20px;
                    }
                    .otp-container {
                        background-color: #f8fafc;
                        border: 2px dashed #2563eb;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .otp-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #2563eb;
                        letter-spacing: 4px;
                        margin: 10px 0;
                    }
                    .message {
                        color: #4b5563;
                        margin: 20px 0;
                        line-height: 1.8;
                    }
                    .warning {
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #2563eb;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">📚 Online Learning Platform</div>
                        <h1 class="title">Xác thực tài khoản của bạn</h1>
                    </div>
                    
                    <div class="message">
                        <p>Xin chào,</p>
                        <p>Bạn đã yêu cầu mã xác thực để hoàn tất quá trình đăng ký/đăng nhập vào hệ thống Online Learning Platform.</p>
                        <p>Vui lòng sử dụng mã OTP dưới đây để xác thực tài khoản:</p>
                    </div>
                    
                    <div class="otp-container">
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">MÃ XÁC THỰC OTP</div>
                        <div class="otp-code">{{OTP}}</div>
                        <div style="color: #6b7280; font-size: 12px; margin-top: 10px;">Mã có hiệu lực trong 5 phút</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Lưu ý quan trọng:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Mã OTP này chỉ có hiệu lực trong <strong>5 phút</strong></li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email</li>
                        </ul>
                    </div>
                    
                    <div class="message">
                        <p>Nếu bạn gặp khó khăn trong việc xác thực, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
                        <p>Cảm ơn bạn đã sử dụng Online Learning Platform!</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Online Learning Platform. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
    
    @Override
    public String getPlainTextContent() {
        return """
            ONLINE LEARNING PLATFORM - MÃ XÁC THỰC OTP
            
            Xin chào,
            
            Bạn đã yêu cầu mã xác thực để hoàn tất quá trình đăng ký/đăng nhập vào hệ thống Online Learning Platform.
            
            MÃ XÁC THỰC OTP: {{OTP}}
            
            LƯU Ý QUAN TRỌNG:
            - Mã OTP này chỉ có hiệu lực trong 5 phút
            - Không chia sẻ mã này với bất kỳ ai
            - Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email
            
            Nếu bạn gặp khó khăn trong việc xác thực, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            
            Cảm ơn bạn đã sử dụng Online Learning Platform!
            
            ---
            © 2024 Online Learning Platform. All rights reserved.
            Email này được gửi tự động, vui lòng không trả lời.
            """;
    }
    
    /**
     * Replace OTP placeholder with actual OTP code
     */
    public String getHtmlContentWithOtp(String otp) {
        return getHtmlContent().replace("{{OTP}}", otp);
    }
    
    /**
     * Replace OTP placeholder with actual OTP code
     */
    public String getPlainTextContentWithOtp(String otp) {
        return getPlainTextContent().replace("{{OTP}}", otp);
    }
}
