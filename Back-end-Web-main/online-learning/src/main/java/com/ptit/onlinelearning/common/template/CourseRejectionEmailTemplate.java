package com.ptit.onlinelearning.common.template;

import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import jakarta.annotation.Nullable;
import org.springframework.stereotype.Component;

@Component
public class CourseRejectionEmailTemplate implements EmailTemplate{
    @Override
    public String getSubject() {
        return "Khóa học không được phê duyệt - Online Learning Platform";
    }

    @Override
    public String getHtmlContent() {
        return """
                <!DOCTYPE html>
                       <html lang="vi">
                       <head>
                           <meta charset="UTF-8">
                           <meta name="viewport" content="width=device-width, initial-scale=1.0">
                           <title>Khóa học không được phê duyệt</title>
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
                               .course-info {
                                   background-color: #fef2f2;
                                   border-left: 4px solid #dc2626;
                                   padding: 15px 20px;
                                   border-radius: 6px;
                                   margin-bottom: 20px;
                               }
                               .instructor-info {
                                   background-color: #f9fafb;
                                   border-left: 4px solid #6b7280;
                                   padding: 15px 20px;
                                   border-radius: 6px;
                                   margin-bottom: 20px;
                               }
                               .status-rejected {
                                   color: #dc2626;
                                   font-weight: bold;
                               }
                               .reason {
                                   background-color: #fef2f2;
                                   border-left: 4px solid #dc2626;
                                   padding: 15px;
                                   border-radius: 6px;
                                   margin-top: 15px;
                               }
                               .reason-title {
                                   font-weight: bold;
                                   color: #b91c1c;
                                   margin-bottom: 8px;
                               }
                               .reason-content {
                                   color: #991b1b;
                                   line-height: 1.5;
                               }
                               .footer {
                                   margin-top: 30px;
                                   padding-top: 20px;
                                   border-top: 1px solid #e5e7eb;
                                   text-align: center;
                                   color: #6b7280;
                                   font-size: 14px;
                               }
                               .action-text {
                                   background-color: #fef3c7;
                                   border-left: 4px solid #f59e0b;
                                   padding: 15px;
                                   border-radius: 6px;
                                   margin-top: 20px;
                               }
                           </style>
                       </head>
                       <body>
                           <div class="container">
                               <div class="header">
                                   <div class="logo">📚 Online Learning Platform</div>
                                   <h1 class="title">Thông báo từ chối khóa học</h1>
                               </div> 
                               <p>Xin chào <strong>{{INSTRUCTOR_ACCOUNT_NAME}}</strong>,</p>
                               <p>Rất tiếc, khóa học của bạn chưa được phê duyệt bởi quản trị viên:</p>
                
                               <div class="course-info">
                                   <p><strong>Tên khóa học:</strong> {{COURSE_TITLE}}</p>
                                   <p><strong>Trạng thái:</strong>
                                       <span class="status-rejected">{{COURSE_STATUS}}</span>
                                   </p>
                               </div>
                
                               <div class="instructor-info">
                                   <p><strong>Thông tin giảng viên:</strong></p>
                                   <p>👤 <strong>Tên tài khoản:</strong> {{INSTRUCTOR_ACCOUNT_NAME}}</p>
                                   <p>📧 <strong>Email:</strong> {{INSTRUCTOR_EMAIL}}</p>
                               </div>
                
                               {{REASON_TEXT}}
                
                               <div class="action-text">
                                   <p><strong>💡 Bước tiếp theo:</strong></p>
                                   <p>Vui lòng xem xét các lý do trên và chỉnh sửa khóa học của bạn. Sau đó, bạn có thể gửi lại khóa học để được xem xét.</p>
                               </div>
                
                               <p style="margin-top: 20px;">Cảm ơn bạn đã hiểu và hợp tác!</p>
                
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
                ONLINE LEARNING PLATFORM - THÔNG BÁO TỪ CHỐI KHÓA HỌC
                
                Xin chào {{INSTRUCTOR_ACCOUNT_NAME}},
                
                Rất tiếc, khóa học của bạn chưa được phê duyệt bởi quản trị viên.
                
                Tên khóa học: {{COURSE_TITLE}}
                Trạng thái: {{COURSE_STATUS}}
                
                Thông tin giảng viên:
                - Tên tài khoản: {{INSTRUCTOR_ACCOUNT_NAME}}
                - Email: {{INSTRUCTOR_EMAIL}}
                
                {{REASON_TEXT}}
                
                Bước tiếp theo:
                Vui lòng xem xét các lý do trên và chỉnh sửa khóa học của bạn. Sau đó, bạn có thể gửi lại khóa học để được xem xét.
                
                Cảm ơn bạn đã hiểu và hợp tác!
                
                ---
                © 2024 Online Learning Platform. All rights reserved.
                Email này được gửi tự động, vui lòng không trả lời.
            """;
    }

    public String getHtmlContentWithData(Course course, Instructor instructor, @Nullable String reasonText) {
        String courseTitle = course.getTitle();
        String courseStatus = course.getStatus().toString();
        String instructorAccountName = instructor.getUser().getAccountName();
        String instructorEmail = instructor.getUser().getEmail();
        
        String formattedReason = "";
        if (reasonText != null && !reasonText.trim().isEmpty()) {
            formattedReason = """
                <div class="reason">
                    <div class="reason-title">📋 Lý do từ chối:</div>
                    <div class="reason-content">%s</div>
                </div>
                """.formatted(reasonText);
        }
        
        return getHtmlContent()
                .replace("{{INSTRUCTOR_ACCOUNT_NAME}}", instructorAccountName)
                .replace("{{COURSE_TITLE}}", courseTitle)
                .replace("{{COURSE_STATUS}}", courseStatus)
                .replace("{{INSTRUCTOR_EMAIL}}", instructorEmail)
                .replace("{{REASON_TEXT}}", formattedReason);
    }

    public String getPlainTextContentWithData(Course course, Instructor instructor, @Nullable String reasonText) {
        String courseTitle = course.getTitle();
        String courseStatus = course.getStatus().toString();
        String instructorAccountName = instructor.getUser().getAccountName();
        String instructorEmail = instructor.getUser().getEmail();
        
        String formattedReason = "";
        if (reasonText != null && !reasonText.trim().isEmpty()) {
            formattedReason = "Lý do từ chối:\n" + reasonText + "\n";
        }
        
        return getPlainTextContent()
                .replace("{{INSTRUCTOR_ACCOUNT_NAME}}", instructorAccountName)
                .replace("{{COURSE_TITLE}}", courseTitle)
                .replace("{{COURSE_STATUS}}", courseStatus)
                .replace("{{INSTRUCTOR_EMAIL}}", instructorEmail)
                .replace("{{REASON_TEXT}}", formattedReason);
    }
}

