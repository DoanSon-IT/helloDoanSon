package com.sondv.phone.service;

import com.sondv.phone.dto.StatsResponse;
import com.sondv.phone.model.Order;
import com.sondv.phone.model.Product;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.OrderRepository;
import com.sondv.phone.repository.ProductRepository;
import com.sondv.phone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public StatsResponse getDashboardStats(int days) {
        StatsResponse stats = new StatsResponse();
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        // 1. Tổng doanh thu (giả định tính từ OrderDetail hoặc một cách khác)
        List<Order> orders = orderRepository.findByCreatedAtAfter(startDateTime);
        BigDecimal totalRevenue = calculateTotalRevenue(orders);  // Hàm mới để tính doanh thu
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // 2. Tổng số đơn hàng
        Long totalOrders = (long) orders.size();
        stats.setTotalOrders(totalOrders);

        // 3. Số sản phẩm bán chạy (có soldQuantity > 0)
        Long topSellingProductsCount = (long) productRepository.findBySoldQuantityGreaterThan(0).size();
        stats.setTopSellingProductsCount(topSellingProductsCount);

        // 4. Số người dùng mới
        Long newUsersCount = (long) userRepository.findByCreatedAtAfter(startDateTime).size();
        stats.setNewUsersCount(newUsersCount);

        // 5. Dữ liệu biểu đồ: Doanh thu và số đơn hàng theo ngày
        Map<String, BigDecimal> revenueByTime = new HashMap<>();
        Map<String, Long> ordersByTime = new HashMap<>();
        for (LocalDate date = startDate; !date.isAfter(LocalDate.now()); date = date.plusDays(1)) {
            String dateKey = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            LocalDateTime dateStart = date.atStartOfDay();
            LocalDateTime dateEnd = date.atTime(23, 59, 59);
            List<Order> dailyOrders = orderRepository.findByCreatedAtBetween(dateStart, dateEnd);
            BigDecimal dailyRevenue = calculateTotalRevenue(dailyOrders);
            Long dailyOrdersCount = (long) dailyOrders.size();
            revenueByTime.put(dateKey, dailyRevenue != null ? dailyRevenue : BigDecimal.ZERO);
            ordersByTime.put(dateKey, dailyOrdersCount);
        }
        stats.setRevenueByTime(revenueByTime);
        stats.setOrdersByTime(ordersByTime);

        return stats;
    }

    // Hàm mới để tính tổng doanh thu (cần điều chỉnh dựa trên model thực tế)
    private BigDecimal calculateTotalRevenue(List<Order> orders) {
        if (orders == null || orders.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Giả định Order có OrderDetail, và tính tổng từ OrderDetail
        // Bạn cần thay đổi logic này dựa trên model thực tế của bạn
        return orders.stream()
                .map(order -> {
                    // Ví dụ: Nếu Order có danh sách OrderDetail, tính tổng giá từ OrderDetail
                    return order.getOrderDetails().stream()
                            .map(detail -> detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public List<Order> getRecentOrders(int limit) {
        return orderRepository.findTopNByOrderByCreatedAtDesc(limit);
    }

    @Override
    public List<Product> getTopSellingProducts(int limit) {
        return productRepository.findTopNByOrderBySoldQuantityDesc(limit);
    }

    @Override
    public List<User> getRecentUsers(int limit) {
        return userRepository.findTopNByOrderByCreatedAtDesc(limit);
    }
}