package com.sondv.phone.repository;

import com.sondv.phone.model.InventoryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {
    List<InventoryLog> findByProductId(Long productId);

    @Query("SELECT log FROM InventoryLog log " +
            "WHERE log.product.id = :productId " +
            "AND (:startDate IS NULL OR log.timestamp >= :startDate) " +
            "AND (:endDate IS NULL OR log.timestamp <= :endDate)")
    Page<InventoryLog> findByProductIdAndTimestampBetween(
            @Param("productId") Long productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT log FROM InventoryLog log " +
            "WHERE (:startDate IS NULL OR log.timestamp >= :startDate) " +
            "AND (:endDate IS NULL OR log.timestamp <= :endDate)")
    Page<InventoryLog> findByTimestampBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

}