package com.ptit.onlinelearning.common.template;

import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class AdminCourseSubmissionEmailTemplate implements EmailTemplate {

    @Override
    public String getSubject() {
        return "Yêu cầu phê duyệt khóa học mới - Online Learning Platform";
    }

    @Override
    public String getHtmlContent() {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Yêu cầu phê duyệt khóa học</title>
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
                    .button {
                        display: inline-block;
                        background-color: #2563eb;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        margin-top: 20px;
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
                        <h1 class="title">Yêu cầu phê duyệt khóa học mới</h1>
                    </div>

                    <p>Xin chào Quản trị viên,</p>
                    <p>Một giảng viên vừa gửi yêu cầu phê duyệt khóa học mới. Dưới đây là thông tin chi tiết:</p>

                    <div class="course-info">
                        <p><strong>Tên khóa học:</strong> {{COURSE_TITLE}}</p>
                        <p><strong>Mô tả ngắn:</strong> {{COURSE_DESCRIPTION}}</p>
                        <p><strong>Ngày gửi yêu cầu:</strong> {{SUBMITTED_DATE}}</p>
                    </div>

                    <div class="instructor-info">
                        <p><strong>Thông tin giảng viên:</strong></p>
                        <p>👤 <strong>Tài khoản:</strong> {{INSTRUCTOR_NAME}}</p>
                        <p>📧 <strong>Email:</strong> {{INSTRUCTOR_EMAIL}}</p>
                    </div>

                    <p>Vui lòng xem xét và phê duyệt khóa học này trong hệ thống.</p>

                    <a href="{{REVIEW_LINK}}" class="button">Phê duyệt khóa học</a>

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
            ONLINE LEARNING PLATFORM - YÊU CẦU PHÊ DUYỆT KHÓA HỌC MỚI
            
            Xin chào Quản trị viên,

            Một giảng viên vừa gửi yêu cầu phê duyệt khóa học mới.

            Tên khóa học: {{COURSE_TITLE}}
            Mô tả ngắn: {{COURSE_DESCRIPTION}}
            Ngày gửi yêu cầu: {{SUBMITTED_DATE}}

            Thông tin giảng viên:
            - Tài khoản: {{INSTRUCTOR_NAME}}
            - Email: {{INSTRUCTOR_EMAIL}}

            Vui lòng đăng nhập vào hệ thống để xem xét và phê duyệt khóa học:
            {{REVIEW_LINK}}

            ---
            © 2024 Online Learning Platform. All rights reserved.
            Email này được gửi tự động, vui lòng không trả lời.
            """;
    }

    public String getHtmlContentWithData(Course course, Instructor instructor) {
        LocalDateTime publishedAt = course.getPublishedAt();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = publishedAt.format(formatter);
        return getHtmlContent()
                .replace("{{COURSE_TITLE}}", course.getTitle())
                .replace("{{COURSE_DESCRIPTION}}", course.getDescription() == null ? "(Không có mô tả)" : course.getDescription())
                .replace("{{SUBMITTED_DATE}}", formattedDate)
                .replace("{{INSTRUCTOR_NAME}}", instructor.getUser().getAccountName())
                .replace("{{INSTRUCTOR_EMAIL}}", instructor.getUser().getEmail())
                .replace("{{REVIEW_LINK}}", "https://onlinelearningplatform.com/admin/courses/review/" + course.getId());
    }

    public String getPlainTextContentWithData(Course course, Instructor instructor) {
        LocalDateTime publishedAt = course.getPublishedAt();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = publishedAt.format(formatter);
        return getPlainTextContent()
                .replace("{{COURSE_TITLE}}", course.getTitle())
                .replace("{{COURSE_DESCRIPTION}}", course.getDescription() == null ? "(Không có mô tả)" : course.getDescription())
                .replace("{{SUBMITTED_DATE}}", formattedDate)
                .replace("{{INSTRUCTOR_NAME}}", instructor.getUser().getAccountName())
                .replace("{{INSTRUCTOR_EMAIL}}", instructor.getUser().getEmail())
                .replace("{{REVIEW_LINK}}", "https://onlinelearningplatform.com/admin/courses/review/" + course.getId());
    }
}
