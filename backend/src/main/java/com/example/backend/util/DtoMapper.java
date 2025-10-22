package com.example.backend.util;

import java.util.List;
import java.util.stream.Collectors;

import com.example.backend.dto.LoginResponseDto;
import com.example.backend.dto.MenuItemResponseDto;
import com.example.backend.dto.OrderItemResponseDto;
import com.example.backend.dto.OrderResponseDto;
import com.example.backend.dto.TableResponseDto;
import com.example.backend.dto.UserResponseDto;
import com.example.backend.model.MenuItem;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Table;
import com.example.backend.model.User;

public class DtoMapper {

    public static UserResponseDto toUserResponseDto(User user) {
        if (user == null)
            return null;

        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }

    public static MenuItemResponseDto toMenuItemResponseDto(MenuItem menuItem) {
        if (menuItem == null)
            return null;

        return MenuItemResponseDto.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .category(menuItem.getCategory())
                .available(menuItem.getAvailable())
                .build();
    }

    public static TableResponseDto toTableResponseDto(Table table) {
        if (table == null)
            return null;

        return TableResponseDto.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .status(table.getStatus())
                .seats(table.getSeats())
                .build();
    }

    public static OrderItemResponseDto toOrderItemResponseDto(OrderItem orderItem) {
        if (orderItem == null)
            return null;

        return OrderItemResponseDto.builder()
                .id(orderItem.getId())
                .menuItem(toMenuItemResponseDto(orderItem.getMenuItem()))
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .subtotal(orderItem.getSubtotal())
                .build();
    }

    public static OrderResponseDto toOrderResponseDto(Order order) {
        if (order == null)
            return null;

        List<OrderItemResponseDto> items = null;
        if (order.getItems() != null) {
            items = order.getItems().stream()
                    .map(DtoMapper::toOrderItemResponseDto)
                    .collect(Collectors.toList());
        }

        return OrderResponseDto.builder()
                .id(order.getId())
                .table(toTableResponseDto(order.getTable()))
                .user(toUserResponseDto(order.getUser()))
                .items(items)
                .totalAmount(order.getTotalAmount())
                .orderTime(order.getOrderTime())
                .paidTime(order.getPaidTime())
                .status(order.getStatus())
                .build();
    }

    public static LoginResponseDto toLoginResponseDto(User user, String token) {
        if (user == null)
            return null;

        return LoginResponseDto.builder()
                .user(toUserResponseDto(user))
                .token(token)
                .message("Đăng nhập thành công")
                .build();
    }
}
