package com.sondv.phone.controller;

import com.sondv.phone.model.Product;
import com.sondv.phone.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/revenue")
    public ResponseEntity<BigDecimal> getRevenue(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.getRevenue(startDate, endDate));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingProducts(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(reportService.getTopSellingProducts(startDate, endDate, limit));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/orders-by-status")
    public ResponseEntity<Map<String, Long>> getOrderCountByStatus() {
        return ResponseEntity.ok(reportService.getOrderCountByStatus());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(
            @RequestParam(defaultValue = "5") int threshold) {
        return ResponseEntity.ok(reportService.getLowStockProducts(threshold));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportRevenueReport(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=Revenue_Report.xlsx")
                    .body(reportService.exportRevenueReport(startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
}