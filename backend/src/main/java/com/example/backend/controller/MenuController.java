package com.example.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.MenuItemResponseDto;
import com.example.backend.model.MenuItem;
import com.example.backend.service.MenuService;
import com.example.backend.util.DtoMapper;

@RestController
@RequestMapping("/api")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/menu")
    public ResponseEntity<List<MenuItemResponseDto>> getAllMenuItems() {
        List<MenuItem> menuItems = menuService.getAllMenuItems();
        List<MenuItemResponseDto> menuItemDtos = menuItems.stream()
                .map(DtoMapper::toMenuItemResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(menuItemDtos);
    }

    @GetMapping("/menu/available")
    public ResponseEntity<List<MenuItemResponseDto>> getAvailableMenuItems() {
        List<MenuItem> menuItems = menuService.getAvailableMenuItems();
        List<MenuItemResponseDto> menuItemDtos = menuItems.stream()
                .map(DtoMapper::toMenuItemResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(menuItemDtos);
    }

    @PostMapping("/admin/menu")
    public ResponseEntity<MenuItemResponseDto> createMenuItem(@RequestBody MenuItem menuItem) {
        MenuItem createdMenuItem = menuService.createMenuItem(menuItem);
        MenuItemResponseDto menuItemDto = DtoMapper.toMenuItemResponseDto(createdMenuItem);
        return ResponseEntity.ok(menuItemDto);
    }

    @PutMapping("/admin/menu/{id}")
    public ResponseEntity<MenuItemResponseDto> updateMenuItem(@PathVariable String id, @RequestBody MenuItem menuItem) {
        MenuItem updatedMenuItem = menuService.updateMenuItem(id, menuItem);
        MenuItemResponseDto menuItemDto = DtoMapper.toMenuItemResponseDto(updatedMenuItem);
        return ResponseEntity.ok(menuItemDto);
    }

    @DeleteMapping("/admin/menu/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok().build();
    }
}