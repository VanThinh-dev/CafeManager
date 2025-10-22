package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "menu_items")
public class MenuItem {
    @Id
    private String id;

    private String name;

    private String description;

    private Double price;

    private String category;

    private Boolean available = true;
}
