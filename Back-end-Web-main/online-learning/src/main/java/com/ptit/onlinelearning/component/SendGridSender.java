package com.ptit.onlinelearning.component;


import com.ptit.onlinelearning.common.template.*;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Instructor;
import com.ptit.onlinelearning.model.InstructorMonthlyEarning;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SendGridSender {
    private final OtpEmailTemplate otpEmailTemplate;
    private final PasswordChangeSuccessEmailTemplate passwordChangeSuccessEmailTemplate;
    private final ResetPasswordEmailTemplate resetPasswordEmailTemplate;
    private final CourseApprovalEmailTemplate courseApprovalEmailTemplate;
    private final CourseRejectionEmailTemplate courseRejectionEmailTemplate;
    private final AdminCourseSubmissionEmailTemplate adminCourseSubmissionEmailTemplate;
    private final InstructorCourseSubmissionEmailTemplate instructorCourseSubmissionEmailTemplate;
    private final InstructorPaymentSuccessEmailTemplate instructorPaymentSuccessEmailTemplate;

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;


    public void sendOtpEmail(String toEmail, String otp) {
        try {
            log.info("Preparing to send OTP email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("OTP: {}", otp);

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom template content
            String htmlContent = otpEmailTemplate.getHtmlContentWithOtp(otp);
            String subject = otpEmailTemplate.getSubject();

            String plainTextContent = otpEmailTemplate.getPlainTextContentWithOtp(otp);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
        }
    }

    public void sendOtpResetPasswordEmail(String toEmail, String otp, String accountName) {
        try {
            log.info("Preparing to send reset password OTP email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Account Name: {}", accountName);
            log.debug("OTP: {}", otp);

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom reset password template content
            String subject = resetPasswordEmailTemplate.getSubject();
            String htmlContent = resetPasswordEmailTemplate.getHtmlContentWithData(otp, accountName);
            String plainTextContent = resetPasswordEmailTemplate.getPlainTextContentWithData(otp, accountName);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom reset password HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending reset password email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Reset password email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send reset password OTP email to: {}", toEmail, e);
        }
    }

    public void sendPasswordChangeSuccessEmail(String toEmail, String accountName, String changeTime) {
        try {
            log.info("Preparing to send password change success email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Account Name: {}", accountName);
            log.debug("Change Time: {}", changeTime);

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom password change success template content
            String subject = passwordChangeSuccessEmailTemplate.getSubject();
            String htmlContent = passwordChangeSuccessEmailTemplate.getHtmlContentWithData(accountName, changeTime);
            String plainTextContent = passwordChangeSuccessEmailTemplate.getPlainTextContentWithData(accountName, changeTime);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom password change success HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending password change success email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Password change success email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send password change success email to: {}", toEmail, e);
        }
    }

    public void sendCourseApprovalEmail(String toEmail, Course course, Instructor instructor, String reasonText) {
        try {
            log.info("Preparing to send course approval email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Course Title: {}", course.getTitle());
            log.debug("Instructor Name: {}", instructor.getUser().getAccountName());

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom course approval template content
            String subject = courseApprovalEmailTemplate.getSubject();
            String htmlContent = courseApprovalEmailTemplate.getHtmlContentWithData(course, instructor, reasonText);
            String plainTextContent = courseApprovalEmailTemplate.getPlainTextContentWithData(course, instructor, reasonText);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom course approval HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending course approval email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Course approval email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send course approval email to: {}", toEmail, e);
        }
    }

    public void sendAdminCourseSubmissionEmail(String toEmail, Course course, Instructor instructor) {
        try {
            log.info("Preparing to send course approval request email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Course Title: {}", course.getTitle());
            log.debug("Instructor Name: {}", instructor.getUser().getAccountName());

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom course approval request template content
            String subject = adminCourseSubmissionEmailTemplate.getSubject();
            String htmlContent = adminCourseSubmissionEmailTemplate.getHtmlContentWithData(course, instructor);
            String plainTextContent = adminCourseSubmissionEmailTemplate.getPlainTextContentWithData(course, instructor);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom course approval request HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending course approval request email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Course approval request email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send course approval request email to: {}", toEmail, e);
        }
    }

    public void sendInstructorCourseSubmissionEmail(String toEmail, Course course, Instructor instructor) {
        try {
            log.info("Preparing to send course approval request email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Course Title: {}", course.getTitle());
            log.debug("Instructor Name: {}", instructor.getUser().getAccountName());

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom course approval request template content
            String subject = instructorCourseSubmissionEmailTemplate.getSubject();
            String htmlContent = instructorCourseSubmissionEmailTemplate.getHtmlContentWithData(course, instructor);
            String plainTextContent = instructorCourseSubmissionEmailTemplate.getPlainTextContentWithData(course, instructor);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom course approval request HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending course approval request email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Course approval request email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send course approval request email to: {}", toEmail, e);
        }
    }

    public void sendCourseRejectEmail(String toEmail, Course course, Instructor instructor, String reasonText) {
        try {
            log.info("Preparing to send course rejection email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Course Title: {}", course.getTitle());
            log.debug("Instructor Name: {}", instructor.getUser().getAccountName());

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom course rejection template content
            String subject = courseRejectionEmailTemplate.getSubject();
            String htmlContent = courseRejectionEmailTemplate.getHtmlContentWithData(course, instructor, reasonText);
            String plainTextContent = courseRejectionEmailTemplate.getPlainTextContentWithData(course, instructor, reasonText);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom course rejection HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending course rejection email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Course rejection email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send course rejection email to: {}", toEmail, e);
        }
    }

    public void sendInstructorPaymentSuccessEmail(String toEmail, InstructorMonthlyEarning earning, Instructor instructor) {
        try {
            log.info("Preparing to send instructor payment success email to: {}", toEmail);
            log.debug("From Email: {}", fromEmail);
            log.debug("Instructor Name: {}", instructor.getUser().getAccountName());
            log.debug("Earning Amount: {}", earning.getTotalEarning());
            log.debug("Period: {}/{}", earning.getMonth(), earning.getYear());

            Email from = new Email(fromEmail);
            Email to = new Email(toEmail);

            // Get custom payment success template content
            String subject = instructorPaymentSuccessEmailTemplate.getSubject();
            String htmlContent = instructorPaymentSuccessEmailTemplate.getHtmlContentWithData(earning, instructor);
            String plainTextContent = instructorPaymentSuccessEmailTemplate.getPlainTextContentWithData(earning, instructor);

            log.debug("Email subject: {}", subject);
            log.debug("Using custom payment success HTML template");

            // Create mail with custom content
            // Note: SendGrid requires text/plain to be first, then text/html
            Content plainTextContentObj = new Content("text/plain", plainTextContent);
            Content htmlContentObj = new Content("text/html", htmlContent);

            Mail mail = new Mail(from, subject, to, plainTextContentObj);
            mail.addContent(htmlContentObj);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            log.info("Sending instructor payment success email via SendGrid API...");
            var response = sg.api(request);
            log.info("SendGrid API response status: {}", response.getStatusCode());
            if (response.getStatusCode() >= 400) {
                log.error("SendGrid API error - Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            } else {
                log.info("Instructor payment success email sent successfully to: {}", toEmail);
            }
        } catch (Exception e) {
            log.error("Failed to send instructor payment success email to: {}", toEmail, e);
        }
    }
}
