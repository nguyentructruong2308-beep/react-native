package com.trannam.example05.service;

import java.util.List;
import com.trannam.example05.payloads.ReviewDTO;

public interface ReviewService {

    // Lấy reviews của một sản phẩm
    List<ReviewDTO> getProductReviews(Long productId);

    // Lấy tất cả reviews của user
    List<ReviewDTO> getUserReviews(String email);

    // Thêm review mới
    ReviewDTO addReview(String email, Long productId, ReviewDTO reviewDTO);

    // Cập nhật review
    ReviewDTO updateReview(String email, Long reviewId, ReviewDTO reviewDTO);

    // Xóa review
    String deleteReview(String email, Long reviewId);

    // Kiểm tra user đã review sản phẩm từ order này chưa
    boolean hasUserReviewed(String email, Long productId, Long orderId);
}
