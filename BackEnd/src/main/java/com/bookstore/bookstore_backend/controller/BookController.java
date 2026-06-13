package com.bookstore.bookstore_backend.controller;

import com.bookstore.bookstore_backend.entity.Book;
import com.bookstore.bookstore_backend.service.BookService;
import com.bookstore.bookstore_backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/books")
@CrossOrigin
public class BookController {

    @Autowired
    private BookService service;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public List<Book> getBooks() {
        return service.getAllBooks();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("price") double price,
            @RequestParam("cover") MultipartFile cover,
            @RequestParam("back") MultipartFile back
    ) throws Exception {

        if (cover == null || cover.isEmpty()) {
            return ResponseEntity.badRequest().body("Cover image is required");
        }

        if (back == null || back.isEmpty()) {
            return ResponseEntity.badRequest().body("Back image is required");
        }

        if (!Objects.requireNonNull(cover.getContentType()).startsWith("image/") ||
                !Objects.requireNonNull(back.getContentType()).startsWith("image/")) {
            return ResponseEntity.badRequest().body("Only image files are allowed");
        }

        String coverUrl = cloudinaryService.upload(cover.getBytes());
        String backUrl = cloudinaryService.upload(back.getBytes());

        // Save book
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setPrice(price);
        book.setCoverImage(coverUrl);
        book.setBackImage(backUrl);

        return ResponseEntity.ok(service.addBook(book));
    }

    @DeleteMapping("/{id}")
    public void deleteBook(@PathVariable Long id) {
        service.deleteBook(id);
    }
}