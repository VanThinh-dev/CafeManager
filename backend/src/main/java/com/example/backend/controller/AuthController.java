    package com.example.backend.controller;

    import java.util.HashMap;
    import java.util.Map;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpHeaders;
    import org.springframework.http.ResponseCookie;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import com.example.backend.dto.LoginRequest;
    import com.example.backend.dto.LoginResponseDto;
    import com.example.backend.dto.RegisterRequest;
    import com.example.backend.dto.UserResponseDto;
    import com.example.backend.model.User;
    import com.example.backend.service.UserService;
    import com.example.backend.util.DtoMapper;

    @RestController
    @RequestMapping("/api/auth")
    public class AuthController {

        @Autowired
        private UserService userService;

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
            try {
                User user = userService.register(request);
                UserResponseDto userDto = DtoMapper.toUserResponseDto(user);
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Đăng ký thành công");
                response.put("user", userDto);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest request) {
            try {
                Map<String, Object> response = userService.login(request);
                String token = (String) response.get("token");
                User user = (User) response.get("user");

                LoginResponseDto loginResponse = DtoMapper.toLoginResponseDto(user, token);

                // Tạo cookie với JWT token
                ResponseCookie cookie = ResponseCookie.from("jwt", token)
                        .httpOnly(true)
                        .secure(false) // Set true trong production với HTTPS
                        .path("/")
                        .maxAge(24 * 60 * 60) // 24 hours
                        .sameSite("Lax") // Lax cho môi trường dev với proxy
                        .build();

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body(loginResponse);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
            }
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout() {
            // Xóa cookie bằng cách set maxAge = 0
            ResponseCookie cookie = ResponseCookie.from("jwt", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Lax")
                    .build();

            Map<String, String> response = new HashMap<>();
            response.put("message", "Đăng xuất thành công");

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser() {
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated() ||
                        "anonymousUser".equals(authentication.getPrincipal())) {
                    return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
                }

                String username = authentication.getName();
                User user = userService.findByUsername(username);

                if (user == null) {
                    return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy user"));
                }

                UserResponseDto userDto = DtoMapper.toUserResponseDto(user);
                return ResponseEntity.ok(userDto);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
            }
        }

    }