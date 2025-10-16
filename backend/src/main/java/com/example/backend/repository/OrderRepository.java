package com.example.backend.repository;

import com.example.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
