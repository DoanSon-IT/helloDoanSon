package com.sondv.phone.controller;

import com.sondv.phone.dto.PaymentRequest;
import com.sondv.phone.dto.PaymentUpdateRequest;
import com.sondv.phone.model.*;
import com.sondv.phone.service.MomoService;
import com.sondv.phone.service.PaymentService;
import com.sondv.phone.service.VNPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final MomoService momoService;

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @PostMapping
    public ResponseEntity<Map<String, String>> createPayment(@RequestBody PaymentRequest paymentRequest, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Order order = paymentService.getOrderById(paymentRequest.getOrderId());

        if (!order.getCustomer().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        Payment payment = paymentService.createPayment(order.getId(), paymentRequest.getMethod());
        String paymentUrl = "";

        switch (paymentRequest.getMethod()) {
            case VNPAY:
                paymentUrl = vnPayService.createVNPayPayment(payment.getId(), order.getTotalPrice().doubleValue());
                break;
            case MOMO:
                paymentUrl = momoService.createMomoPayment(payment.getId(), order.getTotalPrice().doubleValue());
                break;
            case COD:
                paymentService.updatePaymentStatus(order.getId(), PaymentStatus.AWAITING_DELIVERY, null);
                paymentUrl = "/order-confirmation";
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('CUSTOMER') or hasAuthority('ADMIN')")
    @GetMapping("/{orderId}")
    public ResponseEntity<Payment> getPayment(@PathVariable Long orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = paymentService.getUserByEmail(email);

        Payment payment = paymentService.getPaymentByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán!"));

        if (!payment.getOrder().getCustomer().getUser().getEmail().equals(email) &&
                !user.getRoles().contains("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(payment);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{orderId}")
    public ResponseEntity<Payment> updatePaymentStatus(@PathVariable Long orderId,
                                                       @RequestBody PaymentUpdateRequest paymentUpdateRequest) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(
                orderId,
                paymentUpdateRequest.getStatus(),
                paymentUpdateRequest.getTransactionId()));
    }
}