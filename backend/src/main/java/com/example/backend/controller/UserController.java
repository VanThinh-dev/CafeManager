package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    // 🔹 Lấy thông tin người dùng hiện tại (qua token)
    @GetMapping("/me")
    public User getCurrentUser(Authentication auth) {
        return repo.findByUsername(auth.getName()).orElse(null);
    }

    // 🔹 Admin lấy danh sách toàn bộ user
    @GetMapping
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    // 🔹 Xóa user (chỉ dành cho admin)
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable String id) {
        repo.deleteById(id);
        return "🗑️ User deleted successfully";
    }
}