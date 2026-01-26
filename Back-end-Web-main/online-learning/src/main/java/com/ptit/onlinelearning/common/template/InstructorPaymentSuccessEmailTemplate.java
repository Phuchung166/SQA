package com.ptit.onlinelearning.common.template;

import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.InstructorMonthlyEarning;
import org.springframework.stereotype.Component;
import java.text.NumberFormat;
import java.util.Locale;

@Component
public class InstructorPaymentSuccessEmailTemplate implements EmailTemplate {

    @Override
    public String getSubject() {
        return "Thanh toán thành công - Online Learning Platform";
    }

    @Override
    public String getHtmlContent() {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thanh toán thành công</title>
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
                    .payment-info {
                        background-color: #f9fafb;
                        border-left: 4px solid #2563eb;
                        padding: 15px 20px;
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                    .payment-info p {
                        margin: 8px 0;
                        color: #4b5563;
                    }
                    .amount {
                        font-size: 24px;
                        font-weight: bold;
                        color: #059669;
                        margin: 15px 0;
                    }
                    .period {
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .bank-info {
                        background-color: #eff6ff;
                        border-left: 4px solid #2563eb;
                        padding: 15px 20px;
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                    .bank-info p {
                        margin: 5px 0;
                        color: #4b5563;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .note {
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 6px;
                        color: #92400e;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">💰 Online Learning Platform</div>
                        <h1 class="title">Thanh toán thành công</h1>
                    </div>
                    
                    <div class="greeting">
                        <p>Xin chào <strong>{{INSTRUCTOR_NAME}}</strong>,</p>
                    </div>
                    
                    <div class="success-container">
                        <div class="success-icon">✅</div>
                        <div class="success-message">Thanh toán đã được xử lý thành công!</div>
                    </div>
                    
                    <div class="payment-info">
                        <p><strong>Thông tin thanh toán:</strong></p>
                        <p class="period">Kỳ thanh toán: <strong>{{MONTH_YEAR}}</strong></p>
                        <p class="amount">{{TOTAL_EARNING}} VNĐ</p>
                        <p>Thời gian thanh toán: <strong>{{PAID_AT}}</strong></p>
                    </div>
                    
                    <div class="bank-info">
                        <p><strong>Thông tin tài khoản nhận thanh toán:</strong></p>
                        <p>🏦 Ngân hàng: <strong>{{BANK_NAME}}</strong></p>
                        <p>💳 Số tài khoản: <strong>{{BANK_ACCOUNT}}</strong></p>
                    </div>
                    
                    <div class="note">
                        <p><strong>Lưu ý:</strong> Số tiền sẽ được chuyển vào tài khoản của bạn trong vòng 1-3 ngày làm việc. 
                        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ.</p>
                    </div>
                    
                    <p>Cảm ơn bạn đã đồng hành cùng Online Learning Platform!</p>
                    
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
            ONLINE LEARNING PLATFORM - THANH TOÁN THÀNH CÔNG
            
            Xin chào {{INSTRUCTOR_NAME}},
            
            Thanh toán đã được xử lý thành công!
            
            Thông tin thanh toán:
            - Kỳ thanh toán: {{MONTH_YEAR}}
            - Số tiền: {{TOTAL_EARNING}} VNĐ
            - Thời gian thanh toán: {{PAID_AT}}
            
            Thông tin tài khoản nhận thanh toán:
            - Ngân hàng: {{BANK_NAME}}
            - Số tài khoản: {{BANK_ACCOUNT}}
            
            Lưu ý: Số tiền sẽ được chuyển vào tài khoản của bạn trong vòng 1-3 ngày làm việc. 
            Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với bộ phận hỗ trợ.
            
            Cảm ơn bạn đã đồng hành cùng Online Learning Platform!
            
            ---
            © 2024 Online Learning Platform. All rights reserved.
            Email này được gửi tự động, vui lòng không trả lời.
            """;
    }

    public String getHtmlContentWithData(InstructorMonthlyEarning earning, Instructor instructor) {
        String instructorName = instructor.getUser().getFirstName() + " " + instructor.getUser().getLastName();
        String monthYear = String.format("%02d/%d", earning.getMonth(), earning.getYear());
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.of("vi", "VN"));
        String totalEarning = formatter.format(earning.getTotalEarning());
        String paidAt = earning.getPaidAt() != null 
                ? earning.getPaidAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
                : java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        String bankName = instructor.getBankName() != null ? instructor.getBankName() : "Chưa cập nhật";
        String bankAccount = instructor.getBankAccount() != null ? instructor.getBankAccount() : "Chưa cập nhật";
        
        return getHtmlContent()
                .replace("{{INSTRUCTOR_NAME}}", instructorName)
                .replace("{{MONTH_YEAR}}", monthYear)
                .replace("{{TOTAL_EARNING}}", totalEarning)
                .replace("{{PAID_AT}}", paidAt)
                .replace("{{BANK_NAME}}", bankName)
                .replace("{{BANK_ACCOUNT}}", bankAccount);
    }

    public String getPlainTextContentWithData(InstructorMonthlyEarning earning, Instructor instructor) {
        String instructorName = instructor.getUser().getFirstName() + " " + instructor.getUser().getLastName();
        String monthYear = String.format("%02d/%d", earning.getMonth(), earning.getYear());
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.of("vi", "VN"));
        String totalEarning = formatter.format(earning.getTotalEarning());
        String paidAt = earning.getPaidAt() != null 
                ? earning.getPaidAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
                : java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        String bankName = instructor.getBankName() != null ? instructor.getBankName() : "Chưa cập nhật";
        String bankAccount = instructor.getBankAccount() != null ? instructor.getBankAccount() : "Chưa cập nhật";
        
        return getPlainTextContent()
                .replace("{{INSTRUCTOR_NAME}}", instructorName)
                .replace("{{MONTH_YEAR}}", monthYear)
                .replace("{{TOTAL_EARNING}}", totalEarning)
                .replace("{{PAID_AT}}", paidAt)
                .replace("{{BANK_NAME}}", bankName)
                .replace("{{BANK_ACCOUNT}}", bankAccount);
    }
}

