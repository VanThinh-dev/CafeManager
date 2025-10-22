package com.example.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderResponseDto;
import com.example.backend.model.Order;
import com.example.backend.service.OrderService;
import com.example.backend.util.DtoMapper;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/orders/book")
    public ResponseEntity<?> bookTable(@RequestBody OrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            OrderResponseDto orderDto = DtoMapper.toOrderResponseDto(order);
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderResponseDto> orderDtos = orders.stream()
                .map(DtoMapper::toOrderResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orderDtos);
    }

    @GetMapping("/admin/orders/active")
    public ResponseEntity<List<OrderResponseDto>> getActiveOrders() {
        List<Order> orders = orderService.getActiveOrders();
        List<OrderResponseDto> orderDtos = orders.stream()
                .map(DtoMapper::toOrderResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orderDtos);
    }

    @GetMapping("/admin/orders/table/{tableId}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByTable(@PathVariable String tableId) {
        List<Order> orders = orderService.getOrdersByTable(tableId);
        List<OrderResponseDto> orderDtos = orders.stream()
                .map(DtoMapper::toOrderResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orderDtos);
    }

    @PutMapping("/admin/orders/{id}/complete")
    public ResponseEntity<OrderResponseDto> completeOrder(@PathVariable("id") String id) {
        Order completedOrder = orderService.completeOrder(id);
        OrderResponseDto orderDto = DtoMapper.toOrderResponseDto(completedOrder);
        return ResponseEntity.ok(orderDto);
    }

    @PutMapping("/admin/orders/{id}/confirm")
    public ResponseEntity<OrderResponseDto> confirmOrder(@PathVariable("id") String id) {
        Order confirmed = orderService.confirmOrder(id);
        OrderResponseDto orderDto = DtoMapper.toOrderResponseDto(confirmed);
        return ResponseEntity.ok(orderDto);
    }

    @PutMapping("/admin/tables/{id}/checkin")
    public ResponseEntity<?> checkInTable(@PathVariable("id") String id) {
        orderService.checkInTable(id);
        return ResponseEntity.ok(Map.of("message", "Check-in thành công"));
    }
}
