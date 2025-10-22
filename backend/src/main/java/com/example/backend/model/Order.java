package com.example.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    @DBRef
    private Table table;

    @DBRef
    private User user;

    @DBRef
    private List<OrderItem> items = new ArrayList<>();

    private Double totalAmount = 0.0;

    private LocalDateTime orderTime = LocalDateTime.now();

    private LocalDateTime paidTime;

    private String status = "PENDING"; // PENDING, COMPLETED
}
