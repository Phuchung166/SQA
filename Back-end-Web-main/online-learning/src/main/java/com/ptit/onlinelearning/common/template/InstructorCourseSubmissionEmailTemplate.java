package com.ptit.onlinelearning.common.template;

import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class InstructorCourseSubmissionEmailTemplate implements EmailTemplate {

    @Override
    public String getSubject() {
        return "Xác nhận yêu cầu phê duyệt khóa học - Online Learning Platform";
    }

    @Override
    public String getHtmlContent() {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Xác nhận yêu cầu phê duyệt khóa học</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f9fafb;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        background: #fff;
                        border-radius: 10px;
                        padding: 30px;
                        max-width: 600px;
                        margin: auto;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        color: #2563eb;
                        font-size: 22px;
                        margin-bottom: 20px;
                    }
                    .content p {
                        line-height: 1.6;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 14px;
                        color: #6b7280;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">📚 Online Learning Platform</div>
                    <h2>Xác nhận gửi yêu cầu phê duyệt khóa học</h2>
                    <div class="content">
                        <p>Xin chào <strong>{{INSTRUCTOR_NAME}}</strong>,</p>
                        <p>Bạn đã gửi yêu cầu phê duyệt cho khóa học <strong>{{COURSE_TITLE}}</strong> vào ngày <strong>{{SUBMITTED_DATE}}</strong>.</p>
                        <p>Hệ thống đã ghi nhận yêu cầu của bạn. Quản trị viên sẽ xem xét và phản hồi sớm nhất có thể.</p>
                        <p>Bạn có thể kiểm tra trạng thái khóa học tại trang quản lý khóa học của mình:</p>
                        <p><a href="{{COURSE_MANAGE_LINK}}" style="color:#2563eb;">Xem chi tiết khóa học</a></p>
                    </div>
                    <div class="footer">
                        © 2024 Online Learning Platform. Email này được gửi tự động, vui lòng không trả lời.
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    @Override
    public String getPlainTextContent() {
        return """
            ONLINE LEARNING PLATFORM - XÁC NHẬN YÊU CẦU PHÊ DUYỆT KHÓA HỌC

            Xin chào {{INSTRUCTOR_NAME}},

            Bạn đã gửi yêu cầu phê duyệt cho khóa học "{{COURSE_TITLE}}" vào ngày {{SUBMITTED_DATE}}.

            Hệ thống đã ghi nhận yêu cầu của bạn. Quản trị viên sẽ xem xét và phản hồi sớm nhất có thể.

            Bạn có thể kiểm tra trạng thái khóa học tại:
            {{COURSE_MANAGE_LINK}}

            ---
            © 2024 Online Learning Platform. Email này được gửi tự động, vui lòng không trả lời.
            """;
    }

    public String getHtmlContentWithData(Course course, Instructor instructor) {
        LocalDateTime publishedAt = course.getPublishedAt();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = publishedAt.format(formatter);
        return getHtmlContent()
                .replace("{{COURSE_TITLE}}", course.getTitle())
                .replace("{{SUBMITTED_DATE}}", formattedDate)
                .replace("{{INSTRUCTOR_NAME}}", instructor.getUser().getAccountName())
                .replace("{{COURSE_MANAGE_LINK}}", "https://onlinelearningplatform.com/instructor/courses/" + course.getId());
    }

    public String getPlainTextContentWithData(Course course, Instructor instructor) {
        LocalDateTime publishedAt = course.getPublishedAt();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = publishedAt.format(formatter);
        return getPlainTextContent()
                .replace("{{COURSE_TITLE}}", course.getTitle())
                .replace("{{SUBMITTED_DATE}}", formattedDate)
                .replace("{{INSTRUCTOR_NAME}}", instructor.getUser().getAccountName())
                .replace("{{COURSE_MANAGE_LINK}}", "https://onlinelearningplatform.com/instructor/courses/" + course.getId());
    }
}
