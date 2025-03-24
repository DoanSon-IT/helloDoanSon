package com.sondv.phone.service;

import com.sondv.phone.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender mailSender;
    private static final Logger logger = Logger.getLogger(NotificationService.class.getName());

    // ✅ Gửi thông báo khi tồn kho thấp
    public void sendLowStockAlert(Product product, int quantity) {
        String message = "⚠️ CẢNH BÁO: Sản phẩm '" + product.getName() + "' chỉ còn " + quantity + " trong kho!";
        logger.warning(message); // ✅ Ghi log cảnh báo

        // ✅ Gửi email cho Admin
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo("admin@example.com");
        mail.setSubject("Cảnh Báo Tồn Kho Thấp");
        mail.setText(message);
        mailSender.send(mail);
    }
}
