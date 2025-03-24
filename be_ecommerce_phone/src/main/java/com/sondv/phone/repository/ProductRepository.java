package com.sondv.phone.repository;

import com.sondv.phone.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findAll(Pageable pageable);
    List<Product> findTop5ByOrderBySoldQuantityDesc();

    List<Product> findByStockLessThan(int threshold);

    @EntityGraph(attributePaths = {"images", "category", "supplier"})
    @Query("SELECT p FROM Product p")
    List<Product> findAllWithCategoryAndSupplier();

    List<Product> findByIsFeaturedTrue();
    List<Product> findAllByOrderByIdDesc();
    List<Product> findByDiscountEndDateBefore(LocalDateTime dateTime);

    List<Product> findBySoldQuantityGreaterThan(int quantity);

    @Query("SELECT p FROM Product p ORDER BY p.soldQuantity DESC LIMIT ?1")
    List<Product> findTopNByOrderBySoldQuantityDesc(int limit);
}