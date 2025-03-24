package com.sondv.phone.service;

import com.sondv.phone.dto.OrderRequest;
import com.sondv.phone.model.*;
import com.sondv.phone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final InventoryService inventoryService;

    @Transactional
    public Order createOrder(User user, OrderRequest orderRequest) {
        if (orderRequest.getProductIds().size() != orderRequest.getQuantities().size()) {
            throw new IllegalArgumentException("Số lượng productIds và quantities không khớp!");
        }

        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setUser(user);
                    return customerRepository.save(newCustomer);
                });

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(BigDecimal.ZERO);
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (int i = 0; i < orderRequest.getProductIds().size(); i++) {
            Long productId = orderRequest.getProductIds().get(i);
            int requestedQuantity = orderRequest.getQuantities().get(i);

            Inventory inventory = inventoryService.getInventoryByProduct(productId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tồn kho cho sản phẩm ID: " + productId));

            if (inventory.getQuantity() < requestedQuantity) {
                throw new RuntimeException("Sản phẩm '" + inventory.getProduct().getName() + "' không đủ hàng!");
            }

            inventoryService.adjustInventory(productId, -requestedQuantity, "Tạo đơn hàng", user.getId());

            Product product = inventory.getProduct();
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(requestedQuantity);
            detail.setPrice(product.getSellingPrice());
            orderDetails.add(detail);
        }

        BigDecimal totalPrice = orderDetails.stream()
                .map(detail -> detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalPrice(totalPrice.add(orderRequest.getShippingFee() != null ? orderRequest.getShippingFee() : BigDecimal.ZERO));
        order.setOrderDetails(orderDetails);

        ShippingInfo shippingInfo = new ShippingInfo();
        shippingInfo.setOrder(order);
        shippingInfo.setAddress(orderRequest.getAddress());
        shippingInfo.setPhoneNumber(orderRequest.getPhoneNumber());
        shippingInfo.setCarrier(orderRequest.getCarrier());
        shippingInfo.setShippingFee(orderRequest.getShippingFee());
        shippingInfo.setEstimatedDelivery(orderRequest.getEstimatedDelivery());
        order.setShippingInfo(shippingInfo);

        return orderRepository.save(order);
    }
}
