package com.sondv.phone.controller;

import com.sondv.phone.model.Category;
import com.sondv.phone.model.Product;
import com.sondv.phone.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;


    // ✅ API lấy danh sách danh mục (Public)
    @GetMapping("/api/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        if (categories == null || categories.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList()); // ✅ Trả về JSON rỗng thay vì null
        }
        return ResponseEntity.ok(categories);
    }

    // API lấy sản phẩm theo danh mục (Public)
    @GetMapping("/api/categories/{id}/products")
    public ResponseEntity<List<Product>> getProductsByCategoryId(@PathVariable("id") Long categoryId) {
        List<Product> products = categoryService.getProductsByCategoryId(categoryId);
        return ResponseEntity.ok(products); // Không cần kiểm tra null vì service đã xử lý
    }

    // ✅ API thêm danh mục (Chỉ dành cho ADMIN)
    @PostMapping("/api/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createCategory(@RequestParam String name) {
        String result = categoryService.createCategory(name);
        if (result.startsWith("Danh mục đã tồn tại")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // ✅ API cập nhật danh mục (Chỉ dành cho ADMIN, STAFF)
    @PutMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<String> updateCategory(@PathVariable Long id, @RequestParam String name) {
        String result = categoryService.updateCategory(id, name);
        return ResponseEntity.ok(result);
    }

    // ✅ API xóa danh mục (Chỉ dành cho ADMIN)
    @DeleteMapping("/api/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        String result = categoryService.deleteCategory(id);
        if (result.startsWith("Không thể xóa danh mục")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
