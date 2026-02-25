package com.trannam.example05.payloads;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long reviewId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 500, message = "Comment must be less than 500 characters")
    private String comment;

    private Long orderId;

    private String reviewDate;

    // Thông tin sản phẩm (để hiển thị)
    private Long productId;
    private String productName;
    private String productImage;

    // Thông tin user
    private String userEmail;
    private String userName;
}
