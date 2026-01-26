package com.ptit.onlinelearning.common.template;

/**
 * Interface for email templates
 */
public interface EmailTemplate {
    String getSubject();
    String getHtmlContent();
    String getPlainTextContent();
}
