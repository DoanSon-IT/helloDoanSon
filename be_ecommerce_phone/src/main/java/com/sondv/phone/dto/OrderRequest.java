package com.sondv.phone.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderRequest {
    private List<Long> productIds;
    private List<Integer> quantities;
    private String address;
    private String phoneNumber;
    private String carrier;
    private BigDecimal shippingFee;
    private LocalDateTime estimatedDelivery;
}