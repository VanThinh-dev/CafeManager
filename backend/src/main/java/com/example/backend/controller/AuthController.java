package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.dto.AuthResponse;
import com.example.backend.repository.UserRepository;
import com.example.backend.config.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
	private final AuthenticationManager authManager;
	private final UserRepository repo;
	private final PasswordEncoder encoder;
	private final JwtUtil jwtUtil;

	public AuthController(AuthenticationManager authManager, UserRepository repo, PasswordEncoder encoder,
			JwtUtil jwtUtil) {
		this.authManager = authManager;
		this.repo = repo;
		this.encoder = encoder;
		this.jwtUtil = jwtUtil;
	}

	// 🔹 API đăng ký người dùng mới — mặc định role USER
	@PostMapping("/register")
	public String register(@RequestBody RegisterRequest req) {
		if (repo.findByUsername(req.getUsername()).isPresent()) {
			return "❌ Username already exists";
		}
		User user = User.builder()
				.username(req.getUsername())
				.email(req.getEmail())
				.password(encoder.encode(req.getPassword()))
				.role((Role.USER))
				.build();
		repo.save(user);
		return "✅ User registered successfully!";
	}

	// 🔹 API đăng nhập — trả JWT token
	@PostMapping("/login")
public AuthResponse login(@RequestBody LoginRequest req) {
	authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

	User user = repo.findByUsername(req.getUsername())
			.orElseThrow(() -> new RuntimeException("User not found"));

	var token = jwtUtil.generateToken(req.getUsername());

	return new AuthResponse(token, user.getRole().name());
}
}