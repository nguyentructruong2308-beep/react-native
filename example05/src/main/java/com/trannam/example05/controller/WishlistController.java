package com.trannam.example05.controller;

import com.trannam.example05.entity.WishlistItem;
import com.trannam.example05.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/public/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/{email}")
    public ResponseEntity<List<WishlistItem>> getWishlist(@PathVariable String email) {
        return ResponseEntity.ok(wishlistService.getWishlist(email));
    }

    @PostMapping("/{email}/toggle/{productId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable String email, @PathVariable Long productId) {
        boolean added = wishlistService.toggleWishlist(email, productId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", added ? "added" : "removed");
        response.put("productId", productId);
        return ResponseEntity.ok(response);
    }
}
