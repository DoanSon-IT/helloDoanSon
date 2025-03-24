package com.sondv.phone.model;

public enum PaymentStatus {
    PENDING,      // Chờ thanh toán
    PAID,         // Đã thanh toán
    FAILED,       // Thanh toán thất bại
    AWAITING_DELIVERY  // Chờ giao hàng (cho COD)
}