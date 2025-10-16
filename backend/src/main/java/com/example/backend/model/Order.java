package com.example.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document("orders")
public class Order {
    @Id
    private String id;
    private String userId;
    private String tableId;
    private List<Item> items;
    private String status; // "Đã đặt", "Đã thanh toán"
    private LocalDateTime createdAt;
    private double totalPrice;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {
        private String productId;
        private int quantity;
        private double price;
    }
}
