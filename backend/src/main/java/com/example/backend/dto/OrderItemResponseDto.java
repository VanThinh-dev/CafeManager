package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponseDto {
    private String id;
    private MenuItemResponseDto menuItem;
    private Integer quantity;
    private Double price;
    private Double subtotal;
}
