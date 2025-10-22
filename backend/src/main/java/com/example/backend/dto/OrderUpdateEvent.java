package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateEvent {
    private String eventType; // created / updated
    private String orderId;
    private String tableId;
    private String userId;
    private Double totalAmount;
    private String status;
    private OrderResponseDto order;
}
