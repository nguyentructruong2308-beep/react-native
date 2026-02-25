package com.trannam.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trannam.example05.entity.*;
import com.trannam.example05.exceptions.*;
import com.trannam.example05.payloads.*;
import com.trannam.example05.repository.*;
import com.trannam.example05.service.CartService;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepo cartRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private CartItemRepo cartItemRepo;
    @Autowired
    private ModelMapper modelMapper;

    /**
     * Helper method để chuyển đổi từ Cart Entity sang CartDTO
     * FIX: Map đúng Email + Quantity + TotalItems + Image
     */
    private CartDTO mapCartToDTO(Cart cart) {

        CartDTO cartDTO = new CartDTO();

        cartDTO.setCartId(cart.getCartId());
        cartDTO.setTotalPrice(cart.getTotalPrice());

        // ===== FIX EMAIL =====
        if (cart.getUser() != null) {
            cartDTO.setUserEmail(cart.getUser().getEmail());
        } else {
            cartDTO.setUserEmail("N/A");
        }

        // ===== MAP PRODUCTS + FIX IMAGE =====
        List<ProductDTO> products = cart.getCartItems()
                .stream()
                .map(item -> {
                    Product product = item.getProduct();
                    ProductDTO dto = new ProductDTO();

                    dto.setProductId(product.getProductId());
                    dto.setProductName(product.getProductName());
                    dto.setDescription(product.getDescription());

                    // 🔥 FIX LỖI KHÔNG HIỆN ẢNH
                    dto.setImage(product.getImage());

                    dto.setPrice(product.getPrice());
                    dto.setDiscount(product.getDiscount());
                    dto.setSpecialPrice(product.getSpecialPrice());
                    dto.setQuantity(item.getQuantity());
                    dto.setStockQuantity(item.getProduct().getQuantity());

                    return dto;
                })
                .collect(Collectors.toList());

        cartDTO.setProducts(products);

        // ===== FIX TOTAL ITEMS =====
        int totalItems = cart.getCartItems()
                .stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        cartDTO.setTotalItems(totalItems);

        return cartDTO;
    }

    @Override
    public CartDTO getCartById(Long cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));
        return mapCartToDTO(cart);
    }

    @Override
    public CartDTO addProductToCart(Long cartId, Long productId, Integer quantity) {

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem != null)
            throw new APIException("Product " + product.getProductName() + " already exists in the cart");

        if (product.getQuantity() == 0)
            throw new APIException(product.getProductName() + " is not available");

        if (product.getQuantity() < quantity)
            throw new APIException("Please, make an order of the " + product.getProductName() +
                    " less than or equal to the quantity " + product.getQuantity() + ".");

        CartItem newCartItem = new CartItem();
        newCartItem.setProduct(product);
        newCartItem.setCart(cart);
        newCartItem.setQuantity(quantity);
        newCartItem.setDiscount(product.getDiscount());
        newCartItem.setProductPrice(product.getSpecialPrice());

        cartItemRepo.save(newCartItem);

        product.setQuantity(product.getQuantity() - quantity);
        cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));

        return mapCartToDTO(cart);
    }

    @Override
    public List<CartDTO> getAllCarts() {

        List<Cart> carts = cartRepo.findAll();

        if (carts.isEmpty())
            throw new APIException("No cart exists");

        return carts.stream()
                .map(this::mapCartToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CartDTO getCart(String emailId, Long cartId) {
        Cart cart = cartRepo.findCartByEmailAndCartId(emailId, cartId);
        if (cart == null)
            throw new ResourceNotFoundException("Cart", "cartId", cartId);
        return mapCartToDTO(cart);
    }

    @Override
    public CartDTO getCartByEmail(String emailId) {
        Cart cart = cartRepo.findCartByEmail(emailId);
        if (cart == null)
            throw new ResourceNotFoundException("Cart", "email", emailId);
        return mapCartToDTO(cart);
    }

    @Override
    public void updateProductInCarts(Long cartId, Long productId) {

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null)
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");

        double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());

        cartItem.setProductPrice(product.getSpecialPrice());
        cart.setTotalPrice(cartPrice + (cartItem.getProductPrice() * cartItem.getQuantity()));

        cartItemRepo.save(cartItem);
    }

    @Override
    public CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity) {

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null)
            throw new APIException("Product not available in the cart!!!");

        if (product.getQuantity() + cartItem.getQuantity() < quantity)
            throw new APIException("Quantity error.");

        double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());

        product.setQuantity(product.getQuantity() + cartItem.getQuantity() - quantity);

        cartItem.setProductPrice(product.getSpecialPrice());
        cartItem.setQuantity(quantity);
        cartItem.setDiscount(product.getDiscount());

        cart.setTotalPrice(cartPrice + (cartItem.getProductPrice() * quantity));

        cartItemRepo.save(cartItem);

        return mapCartToDTO(cart);
    }

    @Override
    public String deleteProductFromCart(Long cartId, Long productId) {

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

        // FIX TẠI ĐÂY: Không ném Exception nếu không tìm thấy item
        if (cartItem == null) {
            return "Product with ID " + productId + " is already not in the cart.";
        }

        // Cập nhật lại tổng tiền giỏ hàng
        cart.setTotalPrice(cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity()));

        // Hoàn trả số lượng sản phẩm về kho (Stock)
        Product product = cartItem.getProduct();
        if (product != null) {
            product.setQuantity(product.getQuantity() + cartItem.getQuantity());
            productRepo.save(product); // Đảm bảo lưu lại số lượng kho
        }

        // Thực hiện xóa item
        cartItemRepo.deleteCartItemByProductIdAndCartId(cartId, productId);

        // Đảm bảo lưu lại giỏ hàng sau khi cập nhật Total Price
        cartRepo.save(cart);

        return "Product removed from the cart !!!";
    }

    @Override
    public void deleteCart(Long cartId) {

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        cartItemRepo.deleteAll(cart.getCartItems());
        cartRepo.delete(cart);
    }

    @Override
    @Transactional
    public String deleteProductsFromCart(Long cartId, List<Long> productIds) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        for (Long productId : productIds) {
            CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
            if (cartItem != null) {
                // 1. Hoàn số lượng về kho
                Product product = cartItem.getProduct();
                product.setQuantity(product.getQuantity() + cartItem.getQuantity());
                productRepo.save(product);

                // 2. Trừ tiền giỏ hàng
                cart.setTotalPrice(cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity()));

                // 3. Xóa item
                cartItemRepo.deleteCartItemByProductIdAndCartId(cartId, productId);
            }
        }
        cartRepo.save(cart);
        return "Đã xóa các sản phẩm được chọn!";
    }
}
