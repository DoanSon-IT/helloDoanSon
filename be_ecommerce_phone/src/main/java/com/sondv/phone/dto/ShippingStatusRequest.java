package com.sondv.phone.dto;

import com.sondv.phone.model.OrderStatus;
import lombok.Data;

@Data
public class ShippingStatusRequest {
    private OrderStatus status;
}