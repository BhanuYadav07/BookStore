package com.bookstore.bookstore_backend.repository;

import com.bookstore.bookstore_backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
}