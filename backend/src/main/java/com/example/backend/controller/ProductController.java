package com.example.backend.controller;

import com.example.backend.dto.ProductDTO;
import com.example.backend.model.CustomUserDetails;
import com.example.backend.model.Product;
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<?> getProducts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        if (isAdmin) {
            return productRepository.findAll(); // admin xem full product
        } else {
            return productRepository.findAll()
                    .stream()
                    .map(p -> new ProductDTO(p.getName(), p.getPrice()))
                    .toList(); // user chỉ xem name + price
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(@PathVariable String id, @RequestBody Product updatedProduct) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Không tìm thấy sản phẩm"));
        p.setName(updatedProduct.getName());
        p.setPrice(updatedProduct.getPrice());
        return productRepository.save(p);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(@PathVariable String id) {
        productRepository.deleteById(id);
    }
}
