package com.sondv.phone.repository;

import com.sondv.phone.model.OrderDetail;
import com.sondv.phone.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List<OrderDetail> findByOrderId(Long orderId); // ✅ Tìm sản phẩm theo ID đơn hàng

    List<OrderDetail> findByOrderCreatedAtBetweenAndOrderStatus(
            LocalDateTime startDate,
            LocalDateTime endDate,
            OrderStatus status
    );
}
