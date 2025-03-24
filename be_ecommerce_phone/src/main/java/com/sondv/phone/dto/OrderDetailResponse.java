package com.sondv.phone.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderDetailResponse {
    private Long id;
    private String productName;
    private int quantity;
    private BigDecimal price;
}
