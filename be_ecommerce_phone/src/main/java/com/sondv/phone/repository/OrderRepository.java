package com.sondv.phone.repository;

import com.sondv.phone.model.Order;
import com.sondv.phone.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    long countByStatus(OrderStatus status);

    List<Order> findByCreatedAtBetweenAndStatus(LocalDateTime startDate, LocalDateTime endDate, OrderStatus status);

    List<Order> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.totalPrice) FROM Order o")
    Double sumTotalRevenue();

    // ✅ Bổ sung: Đếm số đơn hàng theo trạng thái trong khoảng thời gian
    long countByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate);

    // ✅ Bổ sung: Tìm đơn hàng theo trackingNumber trong ShippingInfo
    @Query("SELECT o FROM Order o JOIN o.shippingInfo s WHERE s.trackingNumber = :trackingNumber")
    Optional<Order> findByTrackingNumber(String trackingNumber);

    // ✅ Bổ sung: Tổng doanh thu theo khoảng thời gian
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Double sumTotalRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    // ✅ Bổ sung: Tìm đơn hàng theo carrier
    @Query("SELECT o FROM Order o JOIN o.shippingInfo s WHERE s.carrier = :carrier")
    List<Order> findByCarrier(String carrier);

    List<Order> findByCreatedAtAfter(LocalDateTime startDate);

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC LIMIT ?1")
    List<Order> findTopNByOrderByCreatedAtDesc(int limit);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}