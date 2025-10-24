package com.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * DataInitializer - Creates default users for the cafe management system
 * This class runs after application startup to create essential users
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting default user initialization...");

        try {
            
            // Create admin user
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setFullName("System Administrator");
                userRepository.save(admin);
                log.info("Admin user created: username=admin, password=admin123");
            }

            // Create customer user
            if (userRepository.findByUsername("customer").isEmpty()) {
                User customer = new User();
                customer.setUsername("customer");
                customer.setPassword(passwordEncoder.encode("customer123"));
                customer.setRole("USER");
                customer.setFullName("Customer User");
                userRepository.save(customer);
                log.info("Customer user created: username=customer, password=customer123");
            }

            log.info("Default user initialization completed successfully!");
        } catch (Exception e) {
            log.error("Error during default user initialization", e);
            throw e; // Re-throw to fail fast
        }
    }
}
