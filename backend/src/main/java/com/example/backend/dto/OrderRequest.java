package com.example.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String tableId;
    private String userId;
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private String menuItemId;
        private Integer quantity;
    }
}