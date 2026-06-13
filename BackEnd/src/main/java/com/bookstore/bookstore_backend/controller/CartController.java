package com.bookstore.bookstore_backend.controller;

import com.bookstore.bookstore_backend.entity.CartItem;
import com.bookstore.bookstore_backend.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
public class CartController {

    @Autowired
    private CartRepository repo;

    @PostMapping
    public CartItem addToCart(@RequestBody CartItem item) {
        return repo.save(item);
    }

    @GetMapping("/{userId}")
    public List<CartItem> getCart(@PathVariable Long userId) {
        return repo.findByUserId(userId);
    }
}