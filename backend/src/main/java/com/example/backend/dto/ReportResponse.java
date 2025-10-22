package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportResponse {
    private Long totalCustomers;
    private Double totalRevenue;
    private Long totalOrders;
    private Long completedOrders;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}