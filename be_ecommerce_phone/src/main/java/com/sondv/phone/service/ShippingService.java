package com.sondv.phone.service;

import com.sondv.phone.model.Order;
import com.sondv.phone.model.OrderStatus;
import com.sondv.phone.model.ShippingInfo;
import com.sondv.phone.repository.OrderRepository;
import com.sondv.phone.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;

    // ✅ 1. Thêm thông tin vận chuyển cho đơn hàng
    public ShippingInfo createShipping(Long orderId, String carrier, String trackingNumber, LocalDateTime estimatedDelivery) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        if (order.getShippingInfo() != null) {
            throw new RuntimeException("Đơn hàng này đã có thông tin vận chuyển!");
        }

        ShippingInfo shippingInfo = new ShippingInfo();
        shippingInfo.setOrder(order);
        shippingInfo.setCarrier(carrier);
        shippingInfo.setTrackingNumber(trackingNumber);
        shippingInfo.setEstimatedDelivery(estimatedDelivery);
        shippingInfo.setAddress(order.getShippingInfo() != null ? order.getShippingInfo().getAddress() : ""); // Nếu đã có address trước đó
        shippingInfo.setPhoneNumber(order.getShippingInfo() != null ? order.getShippingInfo().getPhoneNumber() : "");
        shippingInfo.setShippingFee(order.getShippingInfo() != null ? order.getShippingInfo().getShippingFee() : java.math.BigDecimal.ZERO);

        order.setShippingInfo(shippingInfo);
        order.setStatus(OrderStatus.SHIPPED); // Cập nhật trạng thái đơn hàng
        orderRepository.save(order);

        return shippingRepository.save(shippingInfo);
    }

    // ✅ 2. Lấy thông tin vận chuyển theo đơn hàng
    public Optional<ShippingInfo> getShippingByOrderId(Long orderId) {
        return shippingRepository.findByOrderId(orderId);
    }

    // ✅ 3. Cập nhật thông tin vận chuyển (không cập nhật status ở đây nữa)
    public ShippingInfo updateShippingInfo(Long orderId, String carrier, String trackingNumber, LocalDateTime estimatedDelivery) {
        ShippingInfo shippingInfo = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin vận chuyển!"));

        shippingInfo.setCarrier(carrier);
        shippingInfo.setTrackingNumber(trackingNumber);
        shippingInfo.setEstimatedDelivery(estimatedDelivery);
        return shippingRepository.save(shippingInfo);
    }

    // ✅ 4. Xóa thông tin vận chuyển (nếu đơn hàng bị hủy)
    public void deleteShipping(Long orderId) {
        ShippingInfo shippingInfo = shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin vận chuyển!"));

        Order order = shippingInfo.getOrder();
        order.setShippingInfo(null);
        orderRepository.save(order);
        shippingRepository.delete(shippingInfo);
    }
}