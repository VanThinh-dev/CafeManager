package com.example.backend.dto;

public class ProductDTO {
    private String name;
    private double price;

    public ProductDTO(String name, double price) {
        this.name = name;
        this.price = price;
    }

    // getter & setter
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
