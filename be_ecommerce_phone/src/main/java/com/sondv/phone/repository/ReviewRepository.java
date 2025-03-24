package com.sondv.phone.repository;

import com.sondv.phone.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    Optional<Review> findByIdAndCustomerId(Long id, Long customerId);
}
