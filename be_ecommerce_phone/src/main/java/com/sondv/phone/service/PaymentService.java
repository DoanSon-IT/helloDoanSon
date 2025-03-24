package com.sondv.phone.service;

import com.sondv.phone.model.Order;
import com.sondv.phone.model.Payment;
import com.sondv.phone.model.PaymentMethod;
import com.sondv.phone.model.PaymentStatus;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.OrderRepository;
import com.sondv.phone.repository.PaymentRepository;
import com.sondv.phone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
    }

    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public Payment createPayment(Long orderId, PaymentMethod method) {
        Order order = getOrderById(orderId);
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(method);
        payment.setStatus(PaymentStatus.PENDING); // Sử dụng Enum thay vì String
        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatus(Long orderId, PaymentStatus status, String transactionId) {
        Payment payment = getPaymentByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán!"));
        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        return paymentRepository.save(payment);
    }
}
