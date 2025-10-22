package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "order_items")
public class OrderItem {
    @Id
    private String id;

    @DBRef
    private Order order;

    @DBRef
    private MenuItem menuItem;

    private Integer quantity;

    private Double price;

    private Double subtotal;
}
