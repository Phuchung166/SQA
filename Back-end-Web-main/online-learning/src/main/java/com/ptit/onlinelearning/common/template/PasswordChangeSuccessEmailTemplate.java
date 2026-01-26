package com.ptit.onlinelearning.common.template;

import org.springframework.stereotype.Component;

/**
 * Password Change Success Email Template
 */
@Component
public class PasswordChangeSuccessEmailTemplate implements EmailTemplate {
    
    @Override
    public String getSubject() {
        return "Thay đổi mật khẩu thành công - Online Learning Platform";
    }
    
    @Override
    public String getHtmlContent() {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thay đổi mật khẩu thành công</title>
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
                        color: #059669;
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
                        color: #059669;
                    }
                    .success-container {
                        background-color: #f0fdf4;
                        border: 2px solid #059669;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .success-icon {
                        font-size: 48px;
                        color: #059669;
                        margin-bottom: 15px;
                    }
                    .success-message {
                        font-size: 18px;
                        font-weight: bold;
                        color: #059669;
                        margin: 10px 0;
                    }
                    .timestamp {
                        color: #6b7280;
                        font-size: 14px;
                        margin-top: 10px;
                    }
                    .message {
                        color: #4b5563;
                        margin: 20px 0;
                        line-height: 1.8;
                    }
                    .security-tips {
                        background-color: #eff6ff;
                        border-left: 4px solid #2563eb;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
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
                        background-color: #059669;
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
                        <h1 class="title">Thay đổi mật khẩu thành công</h1>
                    </div>
                    
                    <div class="greeting">
                        <p>Xin chào <span class="account-name">{{ACCOUNT_NAME}}</span>,</p>
                    </div>
                    
                    <div class="success-container">
                        <div class="success-icon">✅</div>
                        <div class="success-message">Mật khẩu đã được thay đổi thành công!</div>
                        <div class="timestamp">Thời gian: {{CHANGE_TIME}}</div>
                    </div>
                    
                    <div class="message">
                        <p>Chúng tôi xác nhận rằng mật khẩu cho tài khoản của bạn trên hệ thống Online Learning Platform đã được thay đổi thành công.</p>
                        <p>Từ bây giờ, bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản của mình.</p>
                    </div>
                    
                    <div class="security-tips">
                        <strong>💡 Mẹo bảo mật:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Hãy ghi nhớ mật khẩu mới và <strong>không chia sẻ</strong> với bất kỳ ai</li>
                            <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                            <li>Không sử dụng cùng một mật khẩu cho nhiều tài khoản khác nhau</li>
                            <li>Thay đổi mật khẩu định kỳ để đảm bảo an toàn tài khoản</li>
                        </ul>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Thông báo bảo mật:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Nếu bạn <strong>KHÔNG</strong> thực hiện thay đổi mật khẩu này, hãy <strong>liên hệ ngay</strong> với đội ngũ hỗ trợ</li>
                            <li>Tài khoản của bạn có thể đã bị xâm phạm và cần được bảo vệ ngay lập tức</li>
                            <li>Trong trường hợp này, hãy thay đổi mật khẩu ngay và kiểm tra các hoạt động gần đây</li>
                        </ul>
                    </div>
                    
                    <div class="message">
                        <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
                        <p>Cảm ơn bạn đã tin tưởng và sử dụng Online Learning Platform!</p>
                        <p><strong>Đội ngũ Online Learning Platform</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Online Learning Platform. All rights reserved.</p>
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
                            Email này được gửi để thông báo về việc thay đổi mật khẩu trên tài khoản của bạn. 
                            Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.
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
            ONLINE LEARNING PLATFORM - THAY ĐỔI MẬT KHẨU THÀNH CÔNG
            
            Xin chào {{ACCOUNT_NAME}},
            
            ✅ MẬT KHẨU ĐÃ ĐƯỢC THAY ĐỔI THÀNH CÔNG!
            Thời gian: {{CHANGE_TIME}}
            
            Chúng tôi xác nhận rằng mật khẩu cho tài khoản của bạn trên hệ thống Online Learning Platform đã được thay đổi thành công.
            
            Từ bây giờ, bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản của mình.
            
            MẸO BẢO MẬT:
            - Hãy ghi nhớ mật khẩu mới và KHÔNG CHIA SẺ với bất kỳ ai
            - Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
            - Không sử dụng cùng một mật khẩu cho nhiều tài khoản khác nhau
            - Thay đổi mật khẩu định kỳ để đảm bảo an toàn tài khoản
            
            THÔNG BÁO BẢO MẬT:
            - Nếu bạn KHÔNG thực hiện thay đổi mật khẩu này, hãy LIÊN HỆ NGAY với đội ngũ hỗ trợ
            - Tài khoản của bạn có thể đã bị xâm phạm và cần được bảo vệ ngay lập tức
            - Trong trường hợp này, hãy thay đổi mật khẩu ngay và kiểm tra các hoạt động gần đây
            
            Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            
            Cảm ơn bạn đã tin tưởng và sử dụng Online Learning Platform!
            
            Đội ngũ Online Learning Platform
            
            ---
            © 2024 Online Learning Platform. All rights reserved.
            Email này được gửi tự động, vui lòng không trả lời.
            
            Email này được gửi để thông báo về việc thay đổi mật khẩu trên tài khoản của bạn. 
            Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.
            """;
    }
    
    /**
     * Replace placeholders with actual values
     */
    public String getHtmlContentWithData(String accountName, String changeTime) {
        return getHtmlContent()
                .replace("{{ACCOUNT_NAME}}", accountName)
                .replace("{{CHANGE_TIME}}", changeTime);
    }
    
    /**
     * Replace placeholders with actual values
     */
    public String getPlainTextContentWithData(String accountName, String changeTime) {
        return getPlainTextContent()
                .replace("{{ACCOUNT_NAME}}", accountName)
                .replace("{{CHANGE_TIME}}", changeTime);
    }
}
