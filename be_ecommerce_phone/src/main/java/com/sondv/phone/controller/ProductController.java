package com.sondv.phone.controller;

import com.sondv.phone.dto.ProductDTO;
import com.sondv.phone.dto.ProductImageDTO;
import com.sondv.phone.model.*;
import com.sondv.phone.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam(required = false, defaultValue = "") String searchKeyword,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(searchKeyword, pageable));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/newest")
    public ResponseEntity<List<ProductDTO>> getNewestProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(productService.getNewestProducts(limit));
    }

    @GetMapping("/bestselling")
    public ResponseEntity<List<ProductDTO>> getBestSellingProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(productService.getBestSellingProducts(limit));
    }

    @GetMapping("/filtered")
    public ResponseEntity<Page<ProductDTO>> getFilteredProducts(
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sortBy,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getFilteredProducts(searchKeyword, minPrice, maxPrice, sortBy, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        Optional<ProductDTO> productDTO = productService.getProductById(id);
        return productDTO.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDTO productDTO) {
        try {
            Product product = mapToEntity(productDTO);
            ProductDTO savedProduct = productService.createProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDTO productDTO) {
        try {
            Product product = mapToEntity(productDTO);
            ProductDTO updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi server: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/discount/all")
    public ResponseEntity<String> applyDiscountToAll(
            @RequestParam BigDecimal percentage,
            @RequestParam(required = false) BigDecimal fixedAmount,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {
        try {
            productService.applyDiscountToAll(percentage, fixedAmount, startDateTime, endDateTime);
            return ResponseEntity.ok("Đã áp dụng giảm giá cho tất cả sản phẩm!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi áp dụng giảm giá: " + e.getMessage());
        }
    }

    @PostMapping("/discount/selected")
    public ResponseEntity<String> applyDiscountToSelected(
            @RequestBody List<Long> productIds,
            @RequestParam BigDecimal percentage,
            @RequestParam(required = false) BigDecimal fixedAmount,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {
        productService.applyDiscountToSelected(productIds, percentage, fixedAmount, startDateTime, endDateTime);
        return ResponseEntity.ok("Đã áp dụng giảm giá cho các sản phẩm được chọn!");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{productId}/images")
    public ResponseEntity<ProductImageDTO> addProductImage(@PathVariable Long productId, @RequestParam("file") MultipartFile file) {
        ProductImageDTO productImageDTO = productService.addProductImage(productId, file);
        return ResponseEntity.ok(productImageDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Long imageId) {
        productService.deleteProductImage(imageId);
        return ResponseEntity.noContent().build();
    }

    private Product mapToEntity(ProductDTO productDTO) {
        Product product = new Product();
        product.setId(productDTO.getId());
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setCostPrice(productDTO.getCostPrice());
        product.setSellingPrice(productDTO.getSellingPrice());
        product.setDiscountedPrice(productDTO.getDiscountedPrice());
        product.setDiscountStartDate(productDTO.getDiscountStartDate());
        product.setDiscountEndDate(productDTO.getDiscountEndDate());
        product.setFeatured(productDTO.isFeatured());
        product.setStock(productDTO.getStock());
        product.setSoldQuantity(productDTO.getSoldQuantity());

        if (productDTO.getCategory() == null || productDTO.getCategory().getId() == null) {
            throw new IllegalArgumentException("ID danh mục là bắt buộc!");
        }
        Category category = new Category();
        category.setId(productDTO.getCategory().getId());
        product.setCategory(category);

        if (productDTO.getSupplier() == null || productDTO.getSupplier().getId() == null) {
            throw new IllegalArgumentException("ID nhà cung cấp là bắt buộc!");
        }
        Supplier supplier = new Supplier();
        supplier.setId(productDTO.getSupplier().getId());
        product.setSupplier(supplier);

        if (productDTO.getImages() != null && !productDTO.getImages().isEmpty()) {
            List<ProductImage> images = productDTO.getImages().stream()
                    .map(dto -> {
                        ProductImage image = new ProductImage();
                        image.setImageUrl(dto.getImageUrl());
                        image.setProduct(product);
                        return image;
                    })
                    .collect(Collectors.toList());
            product.setImages(images);
        }

        return product;
    }
}