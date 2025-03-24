package com.sondv.phone.controller;

import com.sondv.phone.dto.ShippingRequest;
import com.sondv.phone.model.Order;
import com.sondv.phone.model.ShippingInfo;
import com.sondv.phone.repository.OrderRepository;
import com.sondv.phone.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;
    private final OrderRepository orderRepository;

    // ✅ 1. Lấy thông tin vận chuyển
    @GetMapping("/{orderId}")
    public ResponseEntity<Optional<ShippingInfo>> getShipping(
            @PathVariable Long orderId,
            Authentication authentication) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        // Kiểm tra quyền: Chỉ CUSTOMER sở hữu đơn hàng, ADMIN hoặc STAFF mới được xem
        String email = authentication.getName();
        boolean isCustomer = order.getCustomer().getUser().getEmail().equals(email);
        boolean isAdminOrStaff = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") || auth.getAuthority().equals("ROLE_STAFF"));

        if (!isCustomer && !isAdminOrStaff) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(shippingService.getShippingByOrderId(orderId));
    }

    // ✅ 2. Thêm thông tin vận chuyển
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ShippingInfo> createShipping(@RequestBody ShippingRequest shippingRequest) {
        ShippingInfo shippingInfo = shippingService.createShipping(
                shippingRequest.getOrderId(),
                shippingRequest.getCarrier(),
                shippingRequest.getTrackingNumber(),
                shippingRequest.getEstimatedDelivery()
        );
        return ResponseEntity.ok(shippingInfo);
    }

    // ✅ 3. Cập nhật thông tin vận chuyển
    @PutMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ShippingInfo> updateShipping(
            @PathVariable Long orderId,
            @RequestBody ShippingRequest shippingRequest) {
        return ResponseEntity.ok(shippingService.updateShippingInfo(
                orderId,
                shippingRequest.getCarrier(),
                shippingRequest.getTrackingNumber(),
                shippingRequest.getEstimatedDelivery()
        ));
    }

    // ✅ 4. Xóa thông tin vận chuyển
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<String> deleteShipping(@PathVariable Long orderId) {
        shippingService.deleteShipping(orderId);
        return ResponseEntity.ok("Xóa thông tin vận chuyển thành công!");
    }
}