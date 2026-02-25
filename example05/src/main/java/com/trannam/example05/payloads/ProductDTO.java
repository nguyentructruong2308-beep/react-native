package com.trannam.example05.payloads;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long productId;
    private String productName;
    private String image;
    private String description;
    private Integer quantity;
    private double price;
    private double discount;
    private double specialPrice;
    private Integer stockQuantity;


    // --- BỔ SUNG DÒNG NÀY ---
    // React Admin cần biến này để hiện tên danh mục (category.categoryName)
    private CategoryDTO category; 
}