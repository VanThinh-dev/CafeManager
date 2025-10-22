package com.example.backend.controller;

import java.util.List;
import java.util.Map;
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

import com.example.backend.dto.TableResponseDto;
import com.example.backend.model.Table;
import com.example.backend.service.TableService;
import com.example.backend.util.DtoMapper;

@RestController
@RequestMapping("/api")
public class TableController {

    @Autowired
    private TableService tableService;

    @GetMapping("/tables")
    public ResponseEntity<List<TableResponseDto>> getAllTables() {
        List<Table> tables = tableService.getAllTables();
        List<TableResponseDto> tableDtos = tables.stream()
                .map(DtoMapper::toTableResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tableDtos);
    }

    @GetMapping("/tables/available")
    public ResponseEntity<List<TableResponseDto>> getAvailableTables() {
        List<Table> tables = tableService.getAvailableTables();
        List<TableResponseDto> tableDtos = tables.stream()
                .map(DtoMapper::toTableResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tableDtos);
    }

    @PostMapping("/admin/tables")
    public ResponseEntity<TableResponseDto> createTable(@RequestBody Table table) {
        Table createdTable = tableService.createTable(table);
        TableResponseDto tableDto = DtoMapper.toTableResponseDto(createdTable);
        return ResponseEntity.ok(tableDto);
    }

    @PutMapping("/admin/tables/{id}")
    public ResponseEntity<TableResponseDto> updateTable(@PathVariable String id, @RequestBody Table table) {
        Table updatedTable = tableService.updateTable(id, table);
        TableResponseDto tableDto = DtoMapper.toTableResponseDto(updatedTable);
        return ResponseEntity.ok(tableDto);
    }

    @PutMapping("/admin/tables/{id}/status")
    public ResponseEntity<TableResponseDto> updateTableStatus(@PathVariable String id,
            @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        Table updatedTable = tableService.updateTableStatus(id, status);
        TableResponseDto tableDto = DtoMapper.toTableResponseDto(updatedTable);
        return ResponseEntity.ok(tableDto);
    }

    @DeleteMapping("/admin/tables/{id}")
    public ResponseEntity<?> deleteTable(@PathVariable String id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/tables/{id}/clear")
    public ResponseEntity<TableResponseDto> clearTable(@PathVariable String id) {
        Table updatedTable = tableService.updateTableStatus(id, "AVAILABLE");
        TableResponseDto tableDto = DtoMapper.toTableResponseDto(updatedTable);
        return ResponseEntity.ok(tableDto);
    }
}