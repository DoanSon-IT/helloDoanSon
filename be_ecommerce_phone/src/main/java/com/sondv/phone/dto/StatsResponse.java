package com.sondv.phone.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class StatsResponse {
    // Thống kê nhanh
    private BigDecimal totalRevenue;        // Tổng doanh thu
    private Long totalOrders;              // Tổng số đơn hàng
    private Long topSellingProductsCount;  // Số sản phẩm bán chạy
    private Long newUsersCount;            // Số người dùng mới

    // Dữ liệu biểu đồ
    private Map<String, BigDecimal> revenueByTime;  // Doanh thu theo thời gian (key: ngày, value: doanh thu)
    private Map<String, Long> ordersByTime;         // Số đơn hàng theo thời gian (key: ngày, value: số lượng)
}