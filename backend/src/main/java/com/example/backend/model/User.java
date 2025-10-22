package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String username;

    @JsonIgnore
    private String password;

    private String role = "USER";

    private String fullName;
    private String phone;
}
