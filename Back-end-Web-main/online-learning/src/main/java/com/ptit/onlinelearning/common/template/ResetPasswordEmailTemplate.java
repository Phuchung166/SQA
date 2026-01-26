package com.ptit.onlinelearning.common.template;

import org.springframework.stereotype.Component;

/**
 * Reset Password Email Template
 */
@Component
public class ResetPasswordEmailTemplate implements EmailTemplate {
    
    @Override
    public String getSubject() {
        return "Đặt lại mật khẩu - Online Learning Platform";
    }
    
    @Override
    public String getHtmlContent() {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Đặt lại mật khẩu</title>
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
                        color: #dc2626;
                        margin-bottom: 10px;
                    }
                    .title {
                        color: #1f2937;
                        font-size: 20px;
                        margin-bottom: 20px;
                    }
                    .greeting {
                        color: #4b5563;
                        font-size: 16px;
                        margin-bottom: 20px;
                    }
                    .account-name {
                        font-weight: bold;
                        color: #dc2626;
                    }
                    .otp-container {
                        background-color: #fef2f2;
                        border: 2px dashed #dc2626;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .otp-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #dc2626;
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
                    .security-notice {
                        background-color: #fef2f2;
                        border-left: 4px solid #dc2626;
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
                        background-color: #dc2626;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        margin: 10px 0;
                    }
                    .icon {
                        font-size: 48px;
                        margin-bottom: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="icon">🔐</div>
                        <div class="logo">📚 Online Learning Platform</div>
                        <h1 class="title">Yêu cầu đặt lại mật khẩu</h1>
                    </div>
                    
                    <div class="greeting">
                        <p>Xin chào <span class="account-name">{{ACCOUNT_NAME}}</span>,</p>
                    </div>
                    
                    <div class="message">
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên hệ thống Online Learning Platform.</p>
                        <p>Để tiếp tục quá trình đặt lại mật khẩu, vui lòng sử dụng mã xác thực dưới đây:</p>
                    </div>
                    
                    <div class="otp-container">
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">MÃ XÁC THỰC RESET PASSWORD</div>
                        <div class="otp-code">{{OTP}}</div>
                        <div style="color: #6b7280; font-size: 12px; margin-top: 10px;">Mã có hiệu lực trong 10 phút</div>
                    </div>
                    
                    <div class="security-notice">
                        <strong>🔒 Thông báo bảo mật:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Nếu bạn <strong>KHÔNG</strong> yêu cầu đặt lại mật khẩu, vui lòng <strong>BỎ QUA</strong> email này</li>
                            <li>Tài khoản của bạn vẫn an toàn và mật khẩu không bị thay đổi</li>
                            <li>Nếu bạn lo ngại về bảo mật, hãy liên hệ với chúng tôi ngay lập tức</li>
                        </ul>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Lưu ý quan trọng:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Mã xác thực này chỉ có hiệu lực trong <strong>10 phút</strong></li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Chỉ sử dụng mã này trên trang web chính thức của chúng tôi</li>
                            <li>Sau khi đặt lại mật khẩu, hãy chọn mật khẩu mạnh và bảo mật</li>
                        </ul>
                    </div>
                    
                    <div class="message">
                        <p>Nếu bạn gặp khó khăn trong việc đặt lại mật khẩu, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
                        <p><strong>Đội ngũ Online Learning Platform</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Online Learning Platform. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
                            Nếu bạn không yêu cầu đặt lại mật khẩu, có thể ai đó đã nhập nhầm địa chỉ email của bạn. 
                            Bạn có thể bỏ qua email này một cách an toàn.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
    
    @Override
    public String getPlainTextContent() {
        return """
            ONLINE LEARNING PLATFORM - ĐẶT LẠI MẬT KHẨU
            
            Xin chào {{ACCOUNT_NAME}},
            
            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên hệ thống Online Learning Platform.
            
            MÃ XÁC THỰC RESET PASSWORD: {{OTP}}
            
            THÔNG BÁO BẢO MẬT:
            - Nếu bạn KHÔNG yêu cầu đặt lại mật khẩu, vui lòng BỎ QUA email này
            - Tài khoản của bạn vẫn an toàn và mật khẩu không bị thay đổi
            - Nếu bạn lo ngại về bảo mật, hãy liên hệ với chúng tôi ngay lập tức
            
            LƯU Ý QUAN TRỌNG:
            - Mã xác thực này chỉ có hiệu lực trong 10 phút
            - Không chia sẻ mã này với bất kỳ ai
            - Chỉ sử dụng mã này trên trang web chính thức của chúng tôi
            - Sau khi đặt lại mật khẩu, hãy chọn mật khẩu mạnh và bảo mật
            
            Nếu bạn gặp khó khăn trong việc đặt lại mật khẩu, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            
            Đội ngũ Online Learning Platform
            
            ---
            © 2024 Online Learning Platform. All rights reserved.
            Email này được gửi tự động, vui lòng không trả lời.
            
            Nếu bạn không yêu cầu đặt lại mật khẩu, có thể ai đó đã nhập nhầm địa chỉ email của bạn. 
            Bạn có thể bỏ qua email này một cách an toàn.
            """;
    }
    
    /**
     * Replace placeholders with actual values
     */
    public String getHtmlContentWithData(String otp, String accountName) {
        return getHtmlContent()
                .replace("{{OTP}}", otp)
                .replace("{{ACCOUNT_NAME}}", accountName);
    }
    
    /**
     * Replace placeholders with actual values
     */
    public String getPlainTextContentWithData(String otp, String accountName) {
        return getPlainTextContent()
                .replace("{{OTP}}", otp)
                .replace("{{ACCOUNT_NAME}}", accountName);
    }
}
