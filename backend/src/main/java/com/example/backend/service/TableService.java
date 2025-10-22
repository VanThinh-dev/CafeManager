package com.example.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.controller.WebSocketController;
import com.example.backend.dto.TableStatusUpdateEvent;
import com.example.backend.model.Table;
import com.example.backend.repository.TableRepository;

@Service
public class TableService {

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private WebSocketController webSocketController;

    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }

    public List<Table> getAvailableTables() {
        return tableRepository.findByStatus("AVAILABLE");
    }

    public Table createTable(Table table) {
        if (tableRepository.findByTableNumber(table.getTableNumber()).isPresent()) {
            throw new RuntimeException("Số bàn đã tồn tại");
        }
        table.setStatus("AVAILABLE");
        Table savedTable = tableRepository.save(table);

        TableStatusUpdateEvent event = new TableStatusUpdateEvent(
                savedTable.getId(),
                savedTable.getTableNumber(),
                savedTable.getStatus(),
                savedTable.getSeats(),
                "CREATE");
        webSocketController.broadcastTableUpdate(event);
        return savedTable;
    }

    public Table updateTable(String id, Table table) {
        Table existing = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        String oldStatus = existing.getStatus();
        existing.setTableNumber(table.getTableNumber());
        existing.setSeats(table.getSeats());
        existing.setStatus(table.getStatus());

        Table savedTable = tableRepository.save(existing);

        if (!oldStatus.equals(table.getStatus())) {
            TableStatusUpdateEvent event = new TableStatusUpdateEvent(
                    savedTable.getId(),
                    savedTable.getTableNumber(),
                    savedTable.getStatus(),
                    savedTable.getSeats(),
                    "UPDATE");
            webSocketController.broadcastTableUpdate(event);
        }

        return savedTable;
    }

    public Table updateTableStatus(String id, String status) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        table.setStatus(status);
        Table savedTable = tableRepository.save(table);

        TableStatusUpdateEvent event = new TableStatusUpdateEvent(
                savedTable.getId(),
                savedTable.getTableNumber(),
                savedTable.getStatus(),
                savedTable.getSeats(),
                "UPDATE");
        webSocketController.broadcastTableUpdate(event);

        return savedTable;
    }

    public void deleteTable(String id) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));

        tableRepository.deleteById(id);

        TableStatusUpdateEvent event = new TableStatusUpdateEvent(
                table.getId(),
                table.getTableNumber(),
                table.getStatus(),
                table.getSeats(),
                "DELETE");
        webSocketController.broadcastTableUpdate(event);
    }
}
