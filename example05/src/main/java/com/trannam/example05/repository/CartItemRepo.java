package com.trannam.example05.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.transaction.annotation.Transactional;
import com.trannam.example05.entity.CartItem;
import com.trannam.example05.entity.Product;

public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci.product FROM CartItem ci WHERE ci.product.id = ?1")
    Product findProductById(Long productId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = ?1 AND ci.product.id = ?2")
    CartItem findCartItemByProductIdAndCartId(Long cartId, Long productId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = ?1 AND ci.product.id = ?2")
    void deleteCartItemByProductIdAndCartId(Long cartId, Long productId);

    // 🔥 THÊM HÀM NÀY ĐỂ XÓA SẠCH GIỎ HÀNG TRONG 1 NỐT NHẠC 🔥
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = ?1")
    void deleteByCartId(Long cartId);

    // 🔥 XÓA CHỈ CÁC SẢN PHẨM ĐƯỢC CHỌN (THEO PRODUCT IDs)
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = ?1 AND ci.product.productId IN ?2")
    void deleteByCartIdAndProductIds(Long cartId, java.util.List<Long> productIds);
}