package com.trannam.example05.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.trannam.example05.payloads.ReviewDTO;
import com.trannam.example05.service.ReviewService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Lấy tất cả reviews của một sản phẩm
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getProductReviews(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // Lấy tất cả reviews của user
    @GetMapping("/users/{email}/reviews")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(@PathVariable String email) {
        List<ReviewDTO> reviews = reviewService.getUserReviews(email);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // Thêm review mới
    @PostMapping("/users/{email}/products/{productId}/reviews")
    public ResponseEntity<ReviewDTO> addReview(
            @PathVariable String email,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewDTO reviewDTO) {
        ReviewDTO savedReview = reviewService.addReview(email, productId, reviewDTO);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    // Cập nhật review
    @PutMapping("/users/{email}/reviews/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable String email,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewDTO reviewDTO) {
        ReviewDTO updatedReview = reviewService.updateReview(email, reviewId, reviewDTO);
        return new ResponseEntity<>(updatedReview, HttpStatus.OK);
    }

    // Xóa review
    @DeleteMapping("/users/{email}/reviews/{reviewId}")
    public ResponseEntity<String> deleteReview(
            @PathVariable String email,
            @PathVariable Long reviewId) {
        String message = reviewService.deleteReview(email, reviewId);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    // Kiểm tra user đã review chưa
    @GetMapping("/users/{email}/products/{productId}/orders/{orderId}/has-reviewed")
    public ResponseEntity<Boolean> hasUserReviewed(
            @PathVariable String email,
            @PathVariable Long productId,
            @PathVariable Long orderId) {
        boolean hasReviewed = reviewService.hasUserReviewed(email, productId, orderId);
        return new ResponseEntity<>(hasReviewed, HttpStatus.OK);
    }
}
