package com.example.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDto {
    private UserResponseDto user;
    private String token;
    private String message;
}
