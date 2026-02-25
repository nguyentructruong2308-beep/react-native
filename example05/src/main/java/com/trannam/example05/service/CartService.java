package com.trannam.example05.service;

import java.util.List;
import com.trannam.example05.payloads.CartDTO;

public interface CartService {

    // ========================================================================
    // PHƯƠNG THỨC CHO NGƯỜI DÙNG (PUBLIC)
    // ========================================================================

    /**
     * Thêm sản phẩm vào giỏ hàng.
     */
    CartDTO addProductToCart(Long cartId, Long productId, Integer quantity);

    /**
     * Lấy giỏ hàng dựa trên Email và CartID (Xác thực 2 lớp).
     */
    CartDTO getCart(String emailId, Long cartId);

    /**
     * Lấy giỏ hàng duy nhất của User dựa trên Email.
     */
    CartDTO getCartByEmail(String emailId);

    /**
     * Cập nhật số lượng của một sản phẩm cụ thể trong giỏ hàng.
     */
    CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity);

    /**
     * Xóa một sản phẩm khỏi giỏ hàng.
     */
    String deleteProductFromCart(Long cartId, Long productId);

    // Thêm dòng này vào cuối phần PHƯƠNG THỨC CHO NGƯỜI DÙNG
    String deleteProductsFromCart(Long cartId, List<Long> productIds);

    // ========================================================================
    // PHƯƠNG THỨC CHO QUẢN TRỊ VIÊN (ADMIN)
    // ========================================================================

    /**
     * Lấy danh sách tất cả các giỏ hàng trong hệ thống (Dùng cho trang CartList
     * Admin).
     */
    List<CartDTO> getAllCarts();

    /**
     * Lấy chi tiết một giỏ hàng bất kỳ bằng ID (Dùng cho trang CartEdit Admin).
     */
    CartDTO getCartById(Long cartId);

    /**
     * Cập nhật thông tin giá/giảm giá của sản phẩm trong tất cả các giỏ hàng hiện
     * có
     * (Dùng khi sản phẩm thay đổi giá bán).
     */
    void updateProductInCarts(Long cartId, Long productId);

    /**
     * Xóa toàn bộ giỏ hàng theo ID (Admin)
     */
    void deleteCart(Long cartId);

}
