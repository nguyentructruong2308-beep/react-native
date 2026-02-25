package com.trannam.example05.service;

import com.trannam.example05.entity.Product;
import com.trannam.example05.entity.User;
import com.trannam.example05.entity.WishlistItem;
import com.trannam.example05.exceptions.ResourceNotFoundException;
import com.trannam.example05.repository.ProductRepo;
import com.trannam.example05.repository.UserRepo;
import com.trannam.example05.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProductRepo productRepo;

    public List<WishlistItem> getWishlist(String email) {
        return wishlistRepository.findByUserEmail(email);
    }

    public boolean toggleWishlist(String email, Long productId) {
        Optional<WishlistItem> existing = wishlistRepository.findByUserEmailAndProductProductId(email, productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return false; // Removed
        } else {
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

            WishlistItem item = new WishlistItem();
            item.setUser(user);
            item.setProduct(product);
            item.setAddedDate(LocalDateTime.now());
            wishlistRepository.save(item);
            return true; // Added
        }
    }
}
