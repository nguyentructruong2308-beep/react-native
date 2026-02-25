package com.trannam.example05.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.trannam.example05.entity.*;
import com.trannam.example05.exceptions.APIException;
import com.trannam.example05.exceptions.ResourceNotFoundException;
import com.trannam.example05.payloads.ReviewDTO;
import com.trannam.example05.repository.*;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private ProductRepo productRepository;

    @Autowired
    private OrderRepo orderRepository;

    @Override
    public List<ReviewDTO> getProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductProductIdOrderByReviewDateDesc(productId);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> getUserReviews(String email) {
        List<Review> reviews = reviewRepository.findByUserEmailOrderByReviewDateDesc(email);
        return reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public ReviewDTO addReview(String email, Long productId, ReviewDTO reviewDTO) {
        // Lấy user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Lấy product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        // Lấy order (nếu có)
        Order order = null;
        if (reviewDTO.getOrderId() != null) {
            order = orderRepository.findById(reviewDTO.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", reviewDTO.getOrderId()));
        }

        // Kiểm tra đã review chưa
        if (reviewDTO.getOrderId() != null &&
                reviewRepository.existsByUserEmailAndProductProductIdAndOrderOrderId(email, productId,
                        reviewDTO.getOrderId())) {
            throw new APIException("Bạn đã đánh giá sản phẩm này từ đơn hàng này rồi!");
        }

        // Tạo review mới
        Review review = new Review();
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setReviewDate(LocalDateTime.now());
        review.setUser(user);
        review.setProduct(product);
        review.setOrder(order);

        Review savedReview = reviewRepository.save(review);

        // 🔥 AWARD LOYALTY POINTS (+50 points per review)
        if (user != null) {
            user.setLoyaltyPoints((user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0) + 50);
            userRepository.save(user);
            System.out.println(">> [DEBUG] Awarded 50 bonus points to Reviewer: " + user.getEmail());
        }

        return convertToDTO(savedReview);
    }

    @Override
    public ReviewDTO updateReview(String email, Long reviewId, ReviewDTO reviewDTO) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "reviewId", reviewId));

        // Kiểm tra quyền sở hữu
        if (!review.getUser().getEmail().equals(email)) {
            throw new APIException("Bạn không có quyền sửa đánh giá này!");
        }

        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setReviewDate(LocalDateTime.now());

        Review updatedReview = reviewRepository.save(review);
        return convertToDTO(updatedReview);
    }

    @Override
    public String deleteReview(String email, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "reviewId", reviewId));

        // Kiểm tra quyền sở hữu
        if (!review.getUser().getEmail().equals(email)) {
            throw new APIException("Bạn không có quyền xóa đánh giá này!");
        }

        reviewRepository.delete(review);
        return "Đã xóa đánh giá thành công!";
    }

    @Override
    public boolean hasUserReviewed(String email, Long productId, Long orderId) {
        return reviewRepository.existsByUserEmailAndProductProductIdAndOrderOrderId(email, productId, orderId);
    }

    // Helper method: Convert Entity to DTO
    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(review.getReviewId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewDate(review.getReviewDate() != null ? review.getReviewDate().toString() : null);

        if (review.getProduct() != null) {
            dto.setProductId(review.getProduct().getProductId());
            dto.setProductName(review.getProduct().getProductName());
            dto.setProductImage(review.getProduct().getImage());
        }

        if (review.getUser() != null) {
            dto.setUserEmail(review.getUser().getEmail());
            // An toàn hơn khi cộng chuỗi
            String firstName = review.getUser().getFirstName() != null ? review.getUser().getFirstName() : "";
            String lastName = review.getUser().getLastName() != null ? review.getUser().getLastName() : "";
            dto.setUserName((firstName + " " + lastName).trim());
        }

        if (review.getOrder() != null) {
            dto.setOrderId(review.getOrder().getOrderId());
        }

        return dto;
    }
}
