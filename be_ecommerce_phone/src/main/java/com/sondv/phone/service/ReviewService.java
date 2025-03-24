package com.sondv.phone.service;

import com.sondv.phone.model.*;
import com.sondv.phone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    // ✅ 1. Thêm đánh giá mới
    public Review addReview(Long productId, Long customerId, int rating, String comment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

        Review review = new Review();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    // ✅ 2. Lấy danh sách đánh giá của một sản phẩm
    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    // ✅ 3. Cập nhật đánh giá (Chỉ khách hàng được chỉnh sửa đánh giá của họ)
    public Review updateReview(Long reviewId, Long customerId, int rating, String comment) {
        Review review = reviewRepository.findByIdAndCustomerId(reviewId, customerId)
                .orElseThrow(() -> new RuntimeException("Bạn không có quyền chỉnh sửa đánh giá này!"));

        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    // ✅ 4. Xóa đánh giá (Khách hàng hoặc Admin có thể xóa)
    public void deleteReview(Long reviewId, Long customerId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại!"));

        if (!isAdmin && !review.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này!");
        }

        reviewRepository.delete(review);
    }
}
