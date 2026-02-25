package com.trannam.example05.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.trannam.example05.payloads.CartDTO;
import com.trannam.example05.service.CartService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class CartController {
    
    @Autowired 
    private CartService cartService;

    // ========================================================================
    // PUBLIC ENDPOINTS (Cho người dùng thường)
    // ========================================================================

    @GetMapping("/public/users/{emailId}/carts")
    public ResponseEntity<CartDTO> getCartByEmail(@PathVariable String emailId) {
        CartDTO cartDTO = cartService.getCartByEmail(emailId); 
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    @GetMapping("/public/users/{emailId}/carts/{cartId}")
    public ResponseEntity<CartDTO> getCartById(@PathVariable String emailId, @PathVariable Long cartId) {
        CartDTO cartDTO = cartService.getCart(emailId, cartId);
        // Sửa FOUND -> OK (Chuẩn Restful API)
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    @PostMapping("/public/carts/{cartId}/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDTO> addProductToCart(@PathVariable Long cartId, @PathVariable Long productId, @PathVariable Integer quantity) {
        CartDTO cartDTO = cartService.addProductToCart(cartId, productId, quantity);
        return new ResponseEntity<>(cartDTO, HttpStatus.CREATED);
    }

    @PutMapping("/public/carts/{cartId}/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long cartId, @PathVariable Long productId, @PathVariable Integer quantity) {
        CartDTO cartDTO = cartService.updateProductQuantityInCart(cartId, productId, quantity);
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    @DeleteMapping("/public/carts/{cartId}/product/{productId}")
    public ResponseEntity<String> deleteProductFromCart(@PathVariable Long cartId, @PathVariable Long productId) {
        String status = cartService.deleteProductFromCart(cartId, productId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    // Xóa nhiều sản phẩm cùng lúc (Dùng cho tính năng chọn nhiều rồi xóa)
@DeleteMapping("/public/carts/{cartId}/products")
public ResponseEntity<String> deleteMultipleProductsFromCart(
        @PathVariable Long cartId, 
        @RequestBody List<Long> productIds) {
    String status = cartService.deleteProductsFromCart(cartId, productIds);
    return new ResponseEntity<>(status, HttpStatus.OK);
}

    // ========================================================================
    // ADMIN ENDPOINTS (Cho trang quản trị React Admin)
    // ========================================================================

    // 1. Lấy danh sách tất cả giỏ hàng
    @GetMapping("/admin/carts")
    public ResponseEntity<List<CartDTO>> getCarts() {
        List<CartDTO> cartDTOs = cartService.getAllCarts();
        // Sửa FOUND -> OK
        return new ResponseEntity<>(cartDTOs, HttpStatus.OK);
    }

    // 2. [MỚI] Lấy chi tiết 1 giỏ hàng theo ID (React Admin cần endpoint này để Edit/Show)
    @GetMapping("/admin/carts/{cartId}")
    public ResponseEntity<CartDTO> getCartByIdAdmin(@PathVariable Long cartId) {
        // Lưu ý: Bạn cần đảm bảo CartService có hàm getCartById(Long id)
        // Hàm này tìm giỏ hàng chỉ bằng ID (bỏ qua check email vì đây là Admin)
        CartDTO cartDTO = cartService.getCartById(cartId); 
        return new ResponseEntity<>(cartDTO, HttpStatus.OK);
    }

    // 3. [MỚI THÊM] Xóa hoàn toàn giỏ hàng (React Admin: delete)
    @DeleteMapping("/admin/carts/{cartId}")
    public ResponseEntity<String> deleteCart(@PathVariable Long cartId) {
        cartService.deleteCart(cartId);
return new ResponseEntity<>("Cart deleted successfully", HttpStatus.OK);    }

}