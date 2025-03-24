package com.sondv.phone.controller;

import com.sondv.phone.dto.OrderDetailResponse;
import com.sondv.phone.dto.OrderRequest;
import com.sondv.phone.dto.OrderResponse;
import com.sondv.phone.model.*;
import com.sondv.phone.repository.*;
import com.sondv.phone.service.InventoryService;
import com.sondv.phone.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderService orderService;
    private final InventoryService inventoryService;

    // Khai báo Logger
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        User user = (User) authentication.getPrincipal(); // <-- Dùng user đã xác thực
        Order order = orderService.createOrder(user, orderRequest);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<?> getOrders(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Chưa đăng nhập!"));
        }

        User user = (User) authentication.getPrincipal();
        Optional<Customer> customer = customerRepository.findByUserId(user.getId());

        List<Order> orders;
        if (customer.isPresent()) {
            orders = orderRepository.findByCustomerId(customer.get().getId());
        } else if (user.getRoles().stream().anyMatch(role -> role == RoleName.ADMIN || role == RoleName.STAFF)) {
            orders = orderRepository.findAll();
        } else {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Không có quyền truy cập!"));
        }

        List<OrderResponse> response = orders.stream().map(this::mapToOrderResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Chưa đăng nhập!"));
        }

        User user = (User) authentication.getPrincipal();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        // Nếu user không phải là chủ đơn hàng và cũng không phải admin/staff thì từ chối
        boolean isOwner = order.getCustomer().getUser().getId().equals(user.getId());
        boolean isAdminOrStaff = user.getRoles().stream()
                .anyMatch(role -> role == RoleName.ADMIN || role == RoleName.STAFF);

        if (!isOwner && !isAdminOrStaff) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Bạn không có quyền truy cập đơn hàng này."));
        }

        OrderResponse response = mapToOrderResponse(order);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));

        OrderStatus status = OrderStatus.valueOf(newStatus.toUpperCase());

        if (status == OrderStatus.COMPLETED) {
            for (OrderDetail detail : order.getOrderDetails()) {
                inventoryService.adjustInventory(detail.getProduct().getId(), -detail.getQuantity(), "Hoàn thành đơn hàng", null);
            }
        }

        order.setStatus(status);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        orderRepository.delete(order);
        return ResponseEntity.noContent().build();
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotalPrice(order.getTotalPrice());

        List<OrderDetailResponse> detailDTOs = order.getOrderDetails().stream().map(detail -> {
            OrderDetailResponse d = new OrderDetailResponse();
            d.setId(detail.getId());
            d.setProductName(detail.getProduct().getName());
            d.setQuantity(detail.getQuantity());
            d.setPrice(detail.getPrice());
            return d;
        }).toList();

        dto.setOrderDetails(detailDTOs);
        return dto;
    }
}