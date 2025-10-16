package com.example.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document("tables")
public class Table {
    @Id
    private String id;

    private int tableNumber; // <--- số bàn, thay cho name
    private String status;   // AVAILABLE, OCCUPIED, RESERVED
}
