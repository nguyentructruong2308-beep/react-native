package com.trannam.example05.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.trannam.example05.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Lấy tất cả review của một sản phẩm
    List<Review> findByProductProductIdOrderByReviewDateDesc(Long productId);

    // Lấy tất cả review của một user
    List<Review> findByUserEmailOrderByReviewDateDesc(String email);

    // Kiểm tra user đã review sản phẩm trong order này chưa
    boolean existsByUserEmailAndProductProductIdAndOrderOrderId(String email, Long productId, Long orderId);

    // Lấy review của user cho một sản phẩm cụ thể trong order
    Review findByUserEmailAndProductProductIdAndOrderOrderId(String email, Long productId, Long orderId);
}
