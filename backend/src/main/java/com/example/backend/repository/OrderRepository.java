package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Order;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByStatus(String status);

    List<Order> findByTable_Id(String tableId);

    List<Order> findByOrderTimeBetween(LocalDateTime start, LocalDateTime end);
}
