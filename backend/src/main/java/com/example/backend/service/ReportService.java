package com.example.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ReportResponse;
import com.example.backend.model.Order;
import com.example.backend.repository.OrderRepository;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    public ReportResponse getTodayReport() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        return generateReport(startOfDay, endOfDay);
    }

    public ReportResponse getReportByDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        return generateReport(startOfDay, endOfDay);
    }

    private ReportResponse generateReport(LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findByOrderTimeBetween(start, end);

        long totalCustomers = orders.stream()
                .map(order -> order.getUser().getId())
                .distinct()
                .count();

        double totalRevenue = orders.stream()
                .filter(order -> "PAID".equals(order.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();

        long totalOrders = orders.size();
        long completedOrders = orders.stream()
                .filter(order -> "PAID".equals(order.getStatus()))
                .count();

        ReportResponse response = new ReportResponse();
        response.setTotalCustomers(totalCustomers);
        response.setTotalRevenue(totalRevenue);
        response.setTotalOrders(totalOrders);
        response.setCompletedOrders(completedOrders);
        response.setStartDate(start);
        response.setEndDate(end);

        return response;
    }
}