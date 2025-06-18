package com.socialmicroservice.services;

import com.mailersend.sdk.MailerSend;
import com.mailersend.sdk.MailerSendResponse;
import com.mailersend.sdk.emails.Email;
import com.mailersend.sdk.exceptions.MailerSendException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${mailersend.api.key}")
    private String apiKey;

    @Value("${mailersend.from.email}")
    private String fromEmail;

    @Value("${mailersend.from.name}")
    private String fromName;

    public void sendEmail(String recipientEmail, String recipientName, String subject, String plainText, String htmlContent) {
        MailerSend mailerSend = new MailerSend();
        mailerSend.setToken(apiKey);

        Email email = new Email();
        email.setFrom(fromName, fromEmail);
        email.addRecipient(recipientName, recipientEmail);
        email.setSubject(subject);
        email.setPlain(plainText);
        email.setHtml(htmlContent);

        try {
            MailerSendResponse response = mailerSend.emails().send(email);
        } catch (MailerSendException e) {
            e.printStackTrace();
        }
    }
}
