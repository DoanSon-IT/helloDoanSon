package com.sondv.phone.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String content) {
        int retryCount = 3; // Số lần thử lại nếu gửi email thất bại

        for (int i = 0; i < retryCount; i++) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(content, true);

                mailSender.send(message);
                System.out.println("✅ Email đã được gửi đến: " + to);
                return;
            } catch (MailException | MessagingException e) {
                System.err.println("⚠️ Thử lại lần " + (i + 1) + " gửi email đến " + to + " thất bại: " + e.getMessage());
            }
        }

        throw new RuntimeException("⚠️ Gửi email thất bại sau nhiều lần thử!");
    }
}
