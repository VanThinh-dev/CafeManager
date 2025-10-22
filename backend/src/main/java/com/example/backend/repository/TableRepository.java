package com.example.backend.repository;

import com.example.backend.model.Table;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface TableRepository extends  MongoRepository<Table, String> {
    List<Table> findByStatus(String status);
    Optional<Table> findByTableNumber(Integer tableNumber);
}