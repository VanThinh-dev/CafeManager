package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDto {
    private String id;
    private String username;
    private String fullName;
    private String phone;
    private String role;

    // Không bao gồm password để bảo mật
}
