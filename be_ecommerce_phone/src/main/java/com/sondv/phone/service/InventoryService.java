package com.sondv.phone.service;

import com.sondv.phone.model.Inventory;
import com.sondv.phone.model.InventoryLog;
import com.sondv.phone.model.Product;
import com.sondv.phone.repository.InventoryLogRepository;
import com.sondv.phone.repository.InventoryRepository;
import com.sondv.phone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final InventoryLogRepository inventoryLogRepository;

    public Optional<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    @Transactional
    public Inventory adjustInventory(Long productId, int quantityChange, String reason, Long userId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm chưa có thông tin tồn kho"));
        Product product = inventory.getProduct();

        int oldQuantity = inventory.getQuantity();
        int newQuantity = oldQuantity + quantityChange;

        if (newQuantity < 0) {
            throw new IllegalArgumentException("Số lượng không được âm");
        }
        if (newQuantity > inventory.getMaxQuantity()) {
            throw new IllegalArgumentException("Số lượng vượt quá ngưỡng tối đa");
        }

        inventory.setQuantity(newQuantity);
        inventory.setLastUpdated(LocalDateTime.now(ZoneOffset.of("+07:00")));
        product.setStock(newQuantity);
        inventoryRepository.save(inventory);
        productRepository.save(product);

        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setOldQuantity(oldQuantity);
        log.setNewQuantity(newQuantity);
        log.setReason(reason != null ? reason : (quantityChange > 0 ? "Nhập kho" : "Giảm kho"));
        log.setUserId(userId);
        log.setTimestamp(LocalDateTime.now(ZoneOffset.of("+07:00")));
        inventoryLogRepository.save(log);

        return inventory;
    }
}