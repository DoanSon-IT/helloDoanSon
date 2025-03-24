package com.sondv.phone.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShippingRequest {
    private Long orderId;
    private String carrier;
    private String trackingNumber;
    private LocalDateTime estimatedDelivery;
}