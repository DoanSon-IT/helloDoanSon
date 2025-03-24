package com.sondv.phone.repository;

import com.sondv.phone.dto.InventoryReportDTO;
import com.sondv.phone.model.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    // Tìm tồn kho theo productId
    Optional<Inventory> findByProductId(Long productId);

    // Tìm tồn kho theo tên sản phẩm (hỗ trợ báo cáo với tìm kiếm)
    @Query("SELECT i FROM Inventory i WHERE i.product.name LIKE %:name%")
    Page<Inventory> findByProductNameContaining(@Param("name") String name, Pageable pageable);

    @Query("SELECT new com.sondv.phone.dto.InventoryReportDTO(i.product.id, i.product.name, i.quantity, i.lastUpdated, " +
            "CASE WHEN i.quantity = 0 THEN 'OUT_OF_STOCK' " +
            "WHEN i.quantity < i.minQuantity THEN 'LOW' ELSE 'NORMAL' END) " +
            "FROM Inventory i WHERE (:name IS NULL OR i.product.name LIKE %:name%) " +
            "AND (:status IS NULL OR " +
            "(CASE WHEN i.quantity = 0 THEN 'OUT_OF_STOCK' " +
            "WHEN i.quantity < i.minQuantity THEN 'LOW' ELSE 'NORMAL' END) = :status)")
    Page<InventoryReportDTO> findInventoryReport(
            @Param("name") String name,
            @Param("status") String status,
            Pageable pageable);
}