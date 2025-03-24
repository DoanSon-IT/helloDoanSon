package com.sondv.phone.controller;

import com.sondv.phone.dto.StatsResponse;
import com.sondv.phone.model.Order;
import com.sondv.phone.model.Product;
import com.sondv.phone.model.User;
import com.sondv.phone.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Thống kê nhanh và dữ liệu biểu đồ cho Dashboard
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getDashboardStats(
            @RequestParam(defaultValue = "7") int days) {  // Mặc định lấy dữ liệu 7 ngày
        StatsResponse stats = adminService.getDashboardStats(days);
        return ResponseEntity.ok(stats);
    }

    // Danh sách đơn hàng gần đây
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/recent-orders")
    public ResponseEntity<List<Order>> getRecentOrders(
            @RequestParam(defaultValue = "5") int limit) {  // Mặc định lấy 5 đơn hàng
        return ResponseEntity.ok(adminService.getRecentOrders(limit));
    }

    // Danh sách sản phẩm bán chạy
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/top-products")
    public ResponseEntity<List<Product>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {  // Mặc định lấy 5 sản phẩm
        return ResponseEntity.ok(adminService.getTopSellingProducts(limit));
    }

    // Danh sách người dùng mới
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/recent-users")
    public ResponseEntity<List<User>> getRecentUsers(
            @RequestParam(defaultValue = "5") int limit) {  // Mặc định lấy 5 người dùng
        return ResponseEntity.ok(adminService.getRecentUsers(limit));
    }
}