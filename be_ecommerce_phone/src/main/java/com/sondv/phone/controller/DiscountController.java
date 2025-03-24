package com.sondv.phone.controller;

import com.sondv.phone.model.Discount;
import com.sondv.phone.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {
    private final DiscountService discountService;

    // ✅ 1. Thêm mã giảm giá
    @PostMapping
    public ResponseEntity<Discount> createDiscount(@RequestBody Discount discount) {
        return ResponseEntity.ok(discountService.createDiscount(discount));
    }

    // ✅ 2. Lấy danh sách mã giảm giá
    @GetMapping
    public ResponseEntity<List<Discount>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    // ✅ 3. Tìm mã giảm giá theo code
    @GetMapping("/{code}")
    public ResponseEntity<Optional<Discount>> getDiscountByCode(@PathVariable String code) {
        return ResponseEntity.ok(discountService.getDiscountByCode(code));
    }

    // ✅ 4. Xóa mã giảm giá
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.ok("Xóa mã giảm giá thành công!");
    }
}
