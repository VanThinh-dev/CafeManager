package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TableResponseDto {
    private String id;
    private Integer tableNumber;
    private String status;
    private Integer seats;
}
