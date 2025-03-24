package com.sondv.phone.controller;

import com.sondv.phone.model.Review;
import com.sondv.phone.model.RoleName; // Thêm import này
import com.sondv.phone.model.User;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final UserRepository userRepository;

    // ✅ 1. Thêm đánh giá
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> addReview(@RequestParam Long productId, @RequestParam int rating, @RequestParam String comment, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        return ResponseEntity.ok(reviewService.addReview(productId, user.getId(), rating, comment));
    }

    // ✅ 2. Lấy danh sách đánh giá của một sản phẩm
    @GetMapping("/{productId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    // ✅ 3. Xóa đánh giá (Admin hoặc chính chủ)
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.equals(RoleName.ADMIN)); // Sửa ở đây
        reviewService.deleteReview(reviewId, user.getId(), isAdmin);
        return ResponseEntity.ok("Xóa đánh giá thành công!");
    }
}