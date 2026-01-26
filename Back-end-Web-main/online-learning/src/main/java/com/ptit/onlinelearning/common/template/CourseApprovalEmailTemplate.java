package com.ptit.onlinelearning.common.template;

import com.ptit.onlinelearning.common.type.CourseStatus;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import jakarta.annotation.Nullable;
import org.springframework.stereotype.Component;

@Component
public class CourseApprovalEmailTemplate implements EmailTemplate{
    @Override
    public String getSubject() {
        return "Thông tin phê duyệt khóa học - Online Learning Platform";
    }

    @Override
    public String getHtmlContent() {
        return """
                <!DOCTYPE html>
                       <html lang="vi">
                       <head>
                           <meta charset="UTF-8">
                           <meta name="viewport" content="width=device-width, initial-scale=1.0">
                           <title>Phê duyệt khóa học</title>
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
                               .course-info {
                                   background-color: #f9fafb;
                                   border-left: 4px solid #2563eb;
                                   padding: 15px 20px;
                                   border-radius: 6px;
                                   margin-bottom: 20px;
                               }
                               .instructor-info {
                                   background-color: #eef2ff;
                                   border-left: 4px solid #4f46e5;
                                   padding: 15px 20px;
                                   border-radius: 6px;
                                   margin-bottom: 20px;
                               }
                               .status-approved {
                                   color: #16a34a;
                                   font-weight: bold;
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
                                   color: #b91c1c;
                               }
                               .footer {
                                   margin-top: 30px;
                                   padding-top: 20px;
                                   border-top: 1px solid #e5e7eb;
                                   text-align: center;
                                   color: #6b7280;
                                   font-size: 14px;
                               }
                           </style>
                       </head>
                       <body>
                           <div class="container">
                               <div class="header">
                                   <div class="logo">📚 Online Learning Platform</div>
                                   <h1 class="title">Thông báo phê duyệt khóa học</h1>
                               </div> 
                               <p>Xin chào <strong>{{INSTRUCTOR_ACCOUNT_NAME}}</strong>,</p>
                               <p>Khóa học của bạn vừa được quản trị viên xem xét:</p>
                
                               <div class="course-info">
                                   <p><strong>Tên khóa học:</strong> {{COURSE_TITLE}}</p>
                                   <p><strong>Trạng thái:</strong>
                                       <span class="{{STATUS_CLASS}}">{{COURSE_STATUS}}</span>
                                   </p>
                               </div>
                
                               <div class="instructor-info">
                                   <p><strong>Thông tin giảng viên:</strong></p>
                                   <p>👤 <strong>Tên tài khoản:</strong>{{INSTRUCTOR_ACCOUNT_NAME}}</p>
                                   <p>📧 <strong>Email:</strong> {{INSTRUCTOR_EMAIL}}</p>
                               </div>
                
                               {{REASON_TEXT}}
                
                               <p>Cảm ơn bạn đã đóng góp và chia sẻ kiến thức trên nền tảng của chúng tôi!</p>
                
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
                ONLINE LEARNING PLATFORM - THÔNG BÁO PHÊ DUYỆT KHÓA HỌC
                
                Xin chào {{INSTRUCTOR_ACCOUNT_NAME}},
                
                Khóa học của bạn vừa được quản trị viên xem xét.
                
                Tên khóa học: {{COURSE_TITLE}}
                Trạng thái: {{COURSE_STATUS}}
                
                Thông tin giảng viên:
                - Tên tài khoản: {{INSTRUCTOR_ACCOUNT_NAME}}
                - Email: {{INSTRUCTOR_EMAIL}}
                
                {{REASON_TEXT}}
                
                Cảm ơn bạn đã đóng góp và chia sẻ kiến thức trên Online Learning Platform!
                
                ---
                © 2024 Online Learning Platform. All rights reserved.
                Email này được gửi tự động, vui lòng không trả lời.
            """;
    }

    public String getHtmlContentWithData(Course course, Instructor instructor, @Nullable String reasonText) {
        String courseTitle = course.getTitle();
        CourseStatus courseStatus = course.getStatus();
        String instructorAccountName = instructor.getUser().getAccountName();
        String instructorEmail = instructor.getUser().getEmail();
        String statusClass = courseStatus == CourseStatus.ACTIVE ? "status-approved" : "status-rejected";
        return getHtmlContent()
                .replace("{{INSTRUCTOR_ACCOUNT_NAME}}", instructorAccountName)
                .replace("{{COURSE_TITLE}}", courseTitle)
                .replace("{{COURSE_STATUS}}", courseStatus.toString())
                .replace("{{STATUS_CLASS}}", statusClass)
                .replace("{{INSTRUCTOR_EMAIL}}", instructorEmail)
                .replace("{{REASON_TEXT}}", reasonText != null ? reasonText : "");
    }

    public String getPlainTextContentWithData(Course course, Instructor instructor, @Nullable String reasonText) {
        String courseTitle = course.getTitle();
        CourseStatus courseStatus = course.getStatus();
        String instructorName = instructor.getUser().getFirstName() + " " + instructor.getUser().getLastName();
        String instructorAccountName = instructor.getUser().getAccountName();
        String instructorEmail = instructor.getUser().getEmail();
        return getPlainTextContent()
                .replace("{{INSTRUCTOR_ACCOUNT_NAME}}", instructorAccountName)
                .replace("{{COURSE_TITLE}}", courseTitle)
                .replace("{{COURSE_STATUS}}", courseStatus.toString())
                .replace("{{INSTRUCTOR_EMAIL}}", instructorEmail)
                .replace("{{REASON_TEXT}}", reasonText != null ? reasonText : "");
    }
}
