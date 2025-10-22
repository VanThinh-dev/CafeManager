package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponseDto {
    private String id;
    private TableResponseDto table;
    private UserResponseDto user;
    private List<OrderItemResponseDto> items;
    private Double totalAmount;
    private LocalDateTime orderTime;
    private LocalDateTime paidTime;
    private String status;
}
