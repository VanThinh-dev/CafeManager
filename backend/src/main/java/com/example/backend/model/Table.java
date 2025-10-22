package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "tables")
public class Table {
    @Id
    private String id;

    private Integer tableNumber;

    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, PAID

    private Integer seats;
}
