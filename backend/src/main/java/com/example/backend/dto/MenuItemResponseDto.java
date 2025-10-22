package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuItemResponseDto {
    private String id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Boolean available;
}
