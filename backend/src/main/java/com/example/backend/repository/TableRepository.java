package com.example.backend.repository;

import com.example.backend.model.Table;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface TableRepository extends MongoRepository<Table, String> {
    Optional<Table> findByTableNumber(int tableNumber);
}

