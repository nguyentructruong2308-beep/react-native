package com.trannam.example05.repository;

import com.trannam.example05.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserEmail(String email);

    Optional<WishlistItem> findByUserEmailAndProductProductId(String email, Long productId);

    void deleteByUserEmailAndProductProductId(String email, Long productId);
}
