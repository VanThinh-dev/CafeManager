package com.example.backend.controller;


import com.example.backend.model.Table;
import com.example.backend.repository.TableRepository;  
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    @Autowired
    private TableRepository tableRepository;

    // Lấy tất cả bàn
    @GetMapping
    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }

    // Tạo bàn mới
    @PostMapping
    public Table createTable(@RequestBody Table table) {
        // check trùng số bàn
        if (tableRepository.findByTableNumber(table.getTableNumber()).isPresent()) {
            throw new RuntimeException("❌ Số bàn đã tồn tại!");
        }
        table.setStatus("AVAILABLE");
        return tableRepository.save(table);
    }

    // Cập nhật trạng thái bàn
    @PutMapping("/{id}/status")
    public Table updateTableStatus(@PathVariable String id, @RequestParam String status) {
        Table t = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Không tìm thấy bàn"));
        t.setStatus(status);
        return tableRepository.save(t);
    }

    // Xóa bàn
    @DeleteMapping("/{id}")
    public void deleteTable(@PathVariable String id) {
        tableRepository.deleteById(id);
    }
}
