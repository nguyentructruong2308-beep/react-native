package com.trannam.example05.payloads;
import java.util.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class CartDTO {
    private Long cartId;
    private String userEmail; 
    private Double totalPrice = 0.0;
    private Integer totalItems;
    private List<ProductDTO> products = new ArrayList<>();
}