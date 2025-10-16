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

    // Lấy danh sách sản phẩm
    @GetMapping
    public List<?> getProducts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("❌ Unauthorized"); // hoặc trả 401
        }

        boolean isAdmin = userDetails.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN")); // dùng trực tiếp

        if (isAdmin) {
            return productRepository.findAll(); // admin xem full product
        } else {
            return productRepository.findAll()
                    .stream()
                    .map(p -> new ProductDTO(p.getName(), p.getPrice()))
                    .toList(); // user chỉ xem name + price
        }
    }

    // Thêm sản phẩm (chỉ admin)
    @PostMapping
    public Product createProduct(@AuthenticationPrincipal CustomUserDetails userDetails,
                                 @RequestBody Product product) {
        if (!isAdmin(userDetails)) {
            throw new RuntimeException("❌ Forbidden"); // hoặc trả 403
        }
        return productRepository.save(product);
    }

    // Cập nhật sản phẩm (chỉ admin)
    @PutMapping("/{id}")
    public Product updateProduct(@AuthenticationPrincipal CustomUserDetails userDetails,
                                 @PathVariable String id,
                                 @RequestBody Product updatedProduct) {
        if (!isAdmin(userDetails)) {
            throw new RuntimeException("❌ Forbidden");
        }
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Không tìm thấy sản phẩm"));
        p.setName(updatedProduct.getName());
        p.setPrice(updatedProduct.getPrice());
        return productRepository.save(p);
    }

    // Xoá sản phẩm (chỉ admin)
    @DeleteMapping("/{id}")
    public void deleteProduct(@AuthenticationPrincipal CustomUserDetails userDetails,
                              @PathVariable String id) {
        if (!isAdmin(userDetails)) {
            throw new RuntimeException("❌ Forbidden");
        }
        productRepository.deleteById(id);
    }

    // Hàm tiện ích kiểm tra admin
    private boolean isAdmin(CustomUserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
    }
}