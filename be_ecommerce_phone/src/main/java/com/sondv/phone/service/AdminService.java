package com.sondv.phone.service;

import com.sondv.phone.dto.StatsResponse;
import com.sondv.phone.model.Order;
import com.sondv.phone.model.Product;
import com.sondv.phone.model.User;

import java.util.List;

public interface AdminService {
    StatsResponse getDashboardStats(int days);  // Thêm days để lấy dữ liệu theo khoảng thời gian
    List<Order> getRecentOrders(int limit);     // Thêm limit để giới hạn số đơn hàng
    List<Product> getTopSellingProducts(int limit);  // Thêm limit để giới hạn số sản phẩm
    List<User> getRecentUsers(int limit);       // Thêm limitGOD để giới hạn số người dùng
}