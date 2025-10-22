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
            // Create root user
            if (userRepository.findByUsername("root").isEmpty()) {
                User root = new User();
                root.setUsername("root");
                root.setPassword(passwordEncoder.encode("root123"));
                root.setRole("ADMIN");
                root.setFullName("Root User");
                userRepository.save(root);
                log.info("Root user created: username=root, password=root123");
            }

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

            // Create manager user
            if (userRepository.findByUsername("manager").isEmpty()) {
                User manager = new User();
                manager.setUsername("manager");
                manager.setPassword(passwordEncoder.encode("manager123"));
                manager.setRole("MANAGER");
                manager.setFullName("Manager User");
                userRepository.save(manager);
                log.info("Manager user created: username=manager, password=manager123");
            }

            // Create staff user 1
            if (userRepository.findByUsername("staff1").isEmpty()) {
                User staff = new User();
                staff.setUsername("staff1");
                staff.setPassword(passwordEncoder.encode("staff123"));
                staff.setRole("STAFF");
                staff.setFullName("Staff User");
                userRepository.save(staff);
                log.info("Staff user created: username=staff1, password=staff123");
            }

            // Create staff user 2
            if (userRepository.findByUsername("staff2").isEmpty()) {
                User staff = new User();
                staff.setUsername("staff2");
                staff.setPassword(passwordEncoder.encode("staff123"));
                staff.setRole("STAFF");
                staff.setFullName("Staff User");
                userRepository.save(staff);
                log.info("Staff user created: username=staff2, password=staff123");
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
