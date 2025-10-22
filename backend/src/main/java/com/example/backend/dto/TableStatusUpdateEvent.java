package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableStatusUpdateEvent {
    private String eventType;     // "UPDATE"
    private Integer tableNumber;
    private String tableId;
    private Integer seats;
    private String status;
}
