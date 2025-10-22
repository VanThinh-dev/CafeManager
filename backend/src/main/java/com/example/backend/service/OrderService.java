package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.controller.WebSocketController;
import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderResponseDto;
import com.example.backend.dto.OrderUpdateEvent;
import com.example.backend.dto.TableStatusUpdateEvent;
import com.example.backend.model.MenuItem;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Table;
import com.example.backend.model.User;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.DtoMapper;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private WebSocketController webSocketController;

    public Order createOrder(OrderRequest request) {
        Table table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        if (!"AVAILABLE".equals(table.getStatus())) {
            throw new RuntimeException("Bàn này đã có khách");
        }

        if (request.getUserId() == null) {
            throw new RuntimeException("Vui lòng đăng nhập để đặt bàn");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Order order = new Order();
        order.setTable(table);
        order.setUser(user);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("PENDING");

        double totalAmount = 0.0;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn"));

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setSubtotal(menuItem.getPrice() * itemReq.getQuantity());

            orderItemRepository.save(orderItem);
            order.getItems().add(orderItem);
            totalAmount += orderItem.getSubtotal();
        }

        order.setTotalAmount(totalAmount);

        // cập nhật bàn
        table.setStatus("PENDING");
        Table savedTable = tableRepository.save(table);

        // lưu đơn
        Order savedOrder = orderRepository.save(order);

        // gửi event socket
        TableStatusUpdateEvent tableEvent = new TableStatusUpdateEvent(
                "UPDATE",
                savedTable.getTableNumber(),
                savedTable.getId(),
                savedTable.getSeats(),
                savedTable.getStatus());
        webSocketController.broadcastTableUpdate(tableEvent);

        OrderResponseDto orderDto = DtoMapper.toOrderResponseDto(savedOrder);
        OrderUpdateEvent orderEvent = new OrderUpdateEvent(
                "created",
                savedOrder.getId(),
                savedOrder.getTable().getId(),
                savedOrder.getUser().getId(),
                savedOrder.getTotalAmount(),
                savedOrder.getStatus(),
                orderDto);
        webSocketController.broadcastOrderUpdate(orderEvent);

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getActiveOrders() {
        return orderRepository.findAll()
                .stream()
                .filter(o -> !"PAID".equals(o.getStatus()))
                .toList();
    }

    public List<Order> getOrdersByTable(String tableId) {
        return orderRepository.findByTable_Id(tableId);
    }

    public Order completeOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus("PAID");
        order.setPaidTime(LocalDateTime.now());
        Table table = order.getTable();
        table.setStatus("AVAILABLE");
        Table savedTable = tableRepository.save(table);
        Order savedOrder = orderRepository.save(order);

        broadcastUpdate(savedTable, savedOrder, "updated");
        return savedOrder;
    }

    public void clearTable(String tableId) {
        Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        table.setStatus("AVAILABLE");
        Table savedTable = tableRepository.save(table);

        TableStatusUpdateEvent event = new TableStatusUpdateEvent(
                "UPDATE",
                savedTable.getTableNumber(),
                savedTable.getId(),
                savedTable.getSeats(),
                savedTable.getStatus());
        webSocketController.broadcastTableUpdate(event);
    }

    public Order confirmOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus("CONFIRMED");
        Order savedOrder = orderRepository.save(order);

        Table table = order.getTable();
        table.setStatus("OCCUPIED");
        Table savedTable = tableRepository.save(table);

        broadcastUpdate(savedTable, savedOrder, "updated");
        return savedOrder;
    }

    public void checkInTable(String tableId) {
        Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
        table.setStatus("OCCUPIED");
        Table savedTable = tableRepository.save(table);

        TableStatusUpdateEvent event = new TableStatusUpdateEvent(
                "UPDATE",
                savedTable.getTableNumber(),
                savedTable.getId(),
                savedTable.getSeats(),
                savedTable.getStatus());
        webSocketController.broadcastTableUpdate(event);

        orderRepository.findByTable_Id(tableId).stream()
                .filter(o -> !"PAID".equals(o.getStatus()))
                .reduce((first, second) -> second)
                .ifPresent(activeOrder -> {
                    activeOrder.setStatus("OCCUPIED");
                    Order savedOrder = orderRepository.save(activeOrder);
                    broadcastUpdate(savedTable, savedOrder, "updated");
                });
    }

    private void broadcastUpdate(Table savedTable, Order savedOrder, String action) {
        TableStatusUpdateEvent tableEvent = new TableStatusUpdateEvent(
                "UPDATE",
                savedTable.getTableNumber(),
                savedTable.getId(),
                savedTable.getSeats(),
                savedTable.getStatus());
        webSocketController.broadcastTableUpdate(tableEvent);

        OrderResponseDto orderDto = DtoMapper.toOrderResponseDto(savedOrder);
        OrderUpdateEvent orderEvent = new OrderUpdateEvent(
                action,
                savedOrder.getId(),
                savedOrder.getTable().getId(),
                savedOrder.getUser().getId(),
                savedOrder.getTotalAmount(),
                savedOrder.getStatus(),
                orderDto);
        webSocketController.broadcastOrderUpdate(orderEvent);
    }
}
