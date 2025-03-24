package com.sondv.phone.controller;

import com.sondv.phone.dto.InventoryReportDTO;
import com.sondv.phone.model.Inventory;
import com.sondv.phone.model.InventoryLog;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.InventoryLogRepository;
import com.sondv.phone.repository.InventoryRepository;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.service.InventoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService inventoryService;
    private final UserRepository userRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final InventoryRepository inventoryRepository;

    // Xem tồn kho
    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable Long productId) {
        Optional<Inventory> inventory = inventoryService.getInventoryByProduct(productId);
        return inventory.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getAllInventoryLogs(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {

        try {
            Page<InventoryLog> logs;
            if (productId != null) {
                logs = inventoryLogRepository.findByProductIdAndTimestampBetween(productId, startDate, endDate, pageable);
            } else {
                logs = inventoryLogRepository.findByTimestampBetween(startDate, endDate, pageable);
            }

            // Chuyển đổi dữ liệu để trả về cả thông tin sản phẩm
            Page<Map<String, Object>> response = logs.map(log -> {
                Map<String, Object> logWithProduct = new HashMap<>();
                logWithProduct.put("id", log.getId());
                logWithProduct.put("oldQuantity", log.getOldQuantity());
                logWithProduct.put("newQuantity", log.getNewQuantity());
                logWithProduct.put("reason", log.getReason());
                logWithProduct.put("userId", log.getUserId());
                logWithProduct.put("timestamp", log.getTimestamp());

                // Thêm thông tin sản phẩm nếu có
                if (log.getProduct() != null) {
                    logWithProduct.put("productId", log.getProduct().getId());
                    logWithProduct.put("productName", log.getProduct().getName());
                } else {
                    logWithProduct.put("productId", "Không có ID");
                    logWithProduct.put("productName", "Không xác định");
                }

                return logWithProduct;
            });

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Lỗi khi lấy lịch sử tồn kho: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi lấy lịch sử tồn kho");
        }
    }

    @GetMapping("/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<InventoryReportDTO>> getInventoryReport(
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<InventoryReportDTO> report = inventoryRepository.findInventoryReport(searchKeyword, status, pageable);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getInventorySummary() {
        List<Inventory> inventories = inventoryRepository.findAll();

        long totalProducts = inventories.size();
        long outOfStock = inventories.stream().filter(i -> i.getQuantity() == 0).count();
        long lowStock = inventories.stream().filter(i -> i.getQuantity() > 0 && i.getQuantity() < i.getMinQuantity()).count();
        long inStock = totalProducts - outOfStock - lowStock;

        Map<String, Long> summary = new HashMap<>();
        summary.put("totalProducts", totalProducts);
        summary.put("inStock", inStock);
        summary.put("lowStock", lowStock);
        summary.put("outOfStock", outOfStock);

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/adjust/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Transactional
    public ResponseEntity<?> adjustInventory(
            @PathVariable Long productId,
            @RequestParam int quantityChange,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        System.out.println("Adjusting inventory: productId=" + productId + ", quantityChange=" + quantityChange + ", reason=" + reason + ", user=" + authentication.getName());
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        try {
            Inventory inventory = inventoryService.adjustInventory(productId, quantityChange, reason, user.getId());
            return ResponseEntity.ok(inventory);
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Lỗi nội bộ: " + e.getMessage()));
        }
    }

    // Định nghĩa ErrorResponse như record
    record ErrorResponse(String error) {}
}