package com.sondv.phone.service;

import com.sondv.phone.dto.*;
import com.sondv.phone.model.*;
import com.sondv.phone.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dxopjponu/image/upload";
    private static final String CLOUDINARY_UPLOAD_PRESET = "Phone_Store";

    public Page<ProductDTO> getAllProducts(String searchKeyword, Pageable pageable) {
        Page<Product> productPage;
        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCase(searchKeyword, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }
        return productPage.map(this::mapToDTOWithDiscountCheck);
    }

    // Lấy sản phẩm nổi bật
    public List<ProductDTO> getFeaturedProducts() {
        List<Product> products = productRepository.findByIsFeaturedTrue();
        return products.stream().map(this::mapToDTOWithDiscountCheck).collect(Collectors.toList());
    }

    // Lấy sản phẩm mới nhất
    public List<ProductDTO> getNewestProducts(int limit) {
        List<Product> products = productRepository.findAllByOrderByIdDesc().stream()
                .limit(limit)
                .collect(Collectors.toList());
        return products.stream().map(this::mapToDTOWithDiscountCheck).collect(Collectors.toList());
    }

    // Lấy sản phẩm bán chạy
    public List<ProductDTO> getBestSellingProducts(int limit) {
        List<Product> products = productRepository.findTop5ByOrderBySoldQuantityDesc().stream()
                .limit(limit)
                .collect(Collectors.toList());
        return products.stream().map(this::mapToDTOWithDiscountCheck).collect(Collectors.toList());
    }

    // Lấy sản phẩm theo ID
    public Optional<ProductDTO> getProductById(Long id) {
        return productRepository.findById(id).map(this::mapToDTOWithDiscountCheck);
    }

    // Lấy sản phẩm phân trang với bộ lọc
    public Page<ProductDTO> getFilteredProducts(String searchKeyword, BigDecimal minPrice, BigDecimal maxPrice, String sortBy, Pageable pageable) {
        List<Product> products = productRepository.findAllWithCategoryAndSupplier();
        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getName().toLowerCase().contains(searchKeyword.toLowerCase()))
                    .collect(Collectors.toList());
        }
        LocalDateTime now = LocalDateTime.now();
        if (minPrice != null) {
            products = products.stream()
                    .filter(p -> getCurrentPrice(p, now).compareTo(minPrice) >= 0)
                    .collect(Collectors.toList());
        }
        if (maxPrice != null) {
            products = products.stream()
                    .filter(p -> getCurrentPrice(p, now).compareTo(maxPrice) <= 0)
                    .collect(Collectors.toList());
        }

        switch (sortBy != null ? sortBy.toLowerCase() : "") {
            case "newest":
                products.sort((a, b) -> b.getId().compareTo(a.getId()));
                break;
            case "bestselling":
                products.sort((a, b) -> b.getSoldQuantity().compareTo(a.getSoldQuantity()));
                break;
            case "priceasc":
                products.sort((a, b) -> getCurrentPrice(a, now).compareTo(getCurrentPrice(b, now)));
                break;
            case "pricedesc":
                products.sort((a, b) -> getCurrentPrice(b, now).compareTo(getCurrentPrice(a, now)));
                break;
        }

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), products.size());
        List<ProductDTO> productDTOs = products.subList(start, end).stream()
                .map(this::mapToDTOWithDiscountCheck)
                .collect(Collectors.toList());
        return new PageImpl<>(productDTOs, pageable, products.size());
    }

    // Tạo sản phẩm
    public ProductDTO createProduct(Product product) {
        logger.info("Creating product: {}", product.getName());
        validateCategoryAndSupplier(product);
        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setQuantity(product.getStock() != null ? product.getStock() : 0);
        inventoryRepository.save(inventory);

        saveProductImages(savedProduct, product.getImages());
        return mapToDTOWithDiscountCheck(savedProduct);
    }

    public ProductDTO updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(product -> {
            product.setName(updatedProduct.getName());
            product.setDescription(updatedProduct.getDescription());
            product.setCostPrice(updatedProduct.getCostPrice());
            product.setSellingPrice(updatedProduct.getSellingPrice());
            product.setDiscountedPrice(updatedProduct.getDiscountedPrice());
            product.setDiscountStartDate(updatedProduct.getDiscountStartDate());
            product.setDiscountEndDate(updatedProduct.getDiscountEndDate());
            product.setFeatured(updatedProduct.isFeatured());
            if (updatedProduct.getStock() != null) {
                product.setStock(updatedProduct.getStock());
            }
            validateCategoryAndSupplier(updatedProduct);
            product.setCategory(updatedProduct.getCategory());

            Product savedProduct = productRepository.save(product);

            Inventory inventory = inventoryRepository.findByProductId(id)
                    .orElseGet(() -> {
                        Inventory newInventory = new Inventory();
                        newInventory.setProduct(savedProduct);
                        return newInventory;
                    });
            inventory.setQuantity(savedProduct.getStock() != null ? savedProduct.getStock() : 0);
            inventoryRepository.save(inventory);

            return mapToDTOWithDiscountCheck(savedProduct);
        }).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Áp dụng giảm giá cho tất cả sản phẩm
    public void applyDiscountToAll(BigDecimal percentage, BigDecimal fixedAmount, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        logger.info("Áp dụng giảm giá cho tất cả sản phẩm: percentage={}, fixedAmount={}, startDateTime={}, endDateTime={}",
                percentage, fixedAmount, startDateTime, endDateTime);
        List<Product> products = productRepository.findAll();
        if (products == null || products.isEmpty()) {
            logger.warn("Không tìm thấy sản phẩm để áp dụng giảm giá");
            return;
        }
        for (Product product : products) {
            if (product.getSellingPrice() == null) {
                logger.error("Selling price is null for product: {}", product.getId());
                continue; // Bỏ qua sản phẩm lỗi
            }
            BigDecimal newPrice = calculateDiscount(product.getSellingPrice(), percentage, fixedAmount);
            product.setDiscountedPrice(newPrice);
            product.setDiscountStartDate(startDateTime);
            product.setDiscountEndDate(endDateTime);
        }
        try {
            productRepository.saveAll(products);
            logger.info("Đã áp dụng giảm giá cho {} sản phẩm", products.size());
        } catch (Exception e) {
            logger.error("Lỗi khi lưu sản phẩm: {}", e.getMessage(), e);
            throw e; // Ném lại để controller xử lý
        }
    }

    // Áp dụng giảm giá cho sản phẩm được chọn
    public void applyDiscountToSelected(List<Long> productIds, BigDecimal percentage, BigDecimal fixedAmount, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        List<Product> products = productRepository.findAllById(productIds);
        for (Product product : products) {
            BigDecimal newPrice = calculateDiscount(product.getSellingPrice(), percentage, fixedAmount);
            product.setDiscountedPrice(newPrice);
            product.setDiscountStartDate(startDateTime);
            product.setDiscountEndDate(endDateTime);
        }
        productRepository.saveAll(products);
    }

    // Tự động xóa giảm giá khi hết hạn (chạy mỗi phút)
    @Scheduled(cron = "0 * * * * *") // Chạy mỗi phút
    public void clearExpiredDiscounts() {
        LocalDateTime now = LocalDateTime.now();
        List<Product> expiredProducts = productRepository.findByDiscountEndDateBefore(now);
        if (!expiredProducts.isEmpty()) {
            for (Product product : expiredProducts) {
                product.setDiscountedPrice(null);
                product.setDiscountStartDate(null);
                product.setDiscountEndDate(null);
            }
            productRepository.saveAll(expiredProducts);
            logger.info("Đã xóa giảm giá cho {} sản phẩm hết hạn", expiredProducts.size());
        }
    }

    private BigDecimal calculateDiscount(BigDecimal originalPrice, BigDecimal percentage, BigDecimal fixedAmount) {
        if (originalPrice == null) {
            logger.warn("Original price is null, returning zero");
            return BigDecimal.ZERO;
        }
        if (percentage != null && percentage.compareTo(BigDecimal.ZERO) > 0) {
            return originalPrice.multiply(BigDecimal.ONE.subtract(percentage.divide(BigDecimal.valueOf(100))));
        } else if (fixedAmount != null && fixedAmount.compareTo(BigDecimal.ZERO) > 0) {
            return originalPrice.subtract(fixedAmount).max(BigDecimal.ZERO);
        }
        return originalPrice;
    }

    private void validateCategoryAndSupplier(Product product) {
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            throw new RuntimeException("Danh mục là bắt buộc!");
        }
        if (!categoryRepository.existsById(product.getCategory().getId())) {
            throw new RuntimeException("ID danh mục " + product.getCategory().getId() + " không tồn tại!");
        }
        if (product.getSupplier() == null || product.getSupplier().getId() == null) {
            throw new RuntimeException("Nhà cung cấp là bắt buộc!");
        }
        if (!supplierRepository.existsById(product.getSupplier().getId())) {
            throw new RuntimeException("ID nhà cung cấp " + product.getSupplier().getId() + " không tồn tại!");
        }
    }

    private void saveProductImages(Product product, List<ProductImage> images) {
        if (images != null && !images.isEmpty()) {
            for (ProductImage image : images) {
                image.setProduct(product);
                productImageRepository.save(image);
            }
        }
    }

    public String uploadImageToCloudinary(MultipartFile file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()));
            body.add("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(CLOUDINARY_UPLOAD_URL, requestEntity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("url")) {
                return (String) response.getBody().get("url");
            }
        } catch (IOException e) {
            logger.error("Không thể upload ảnh", e);
        }
        return null;
    }

    public ProductImageDTO addProductImage(Long productId, MultipartFile file) {
        String imageUrl = uploadImageToCloudinary(file);
        if (imageUrl != null) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            ProductImage productImage = new ProductImage();
            productImage.setImageUrl(imageUrl);
            productImage.setProduct(product);
            return mapProductImageToDTO(productImageRepository.save(productImage));
        }
        throw new RuntimeException("Không thể upload ảnh");
    }

    public void deleteProductImage(Long imageId) {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Ảnh sản phẩm không tồn tại"));
        productImageRepository.delete(productImage);
    }

    private ProductDTO mapToDTOWithDiscountCheck(Product product) {
        LocalDateTime now = LocalDateTime.now();
        BigDecimal currentPrice = getCurrentPrice(product, now);

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .discountedPrice(currentPrice.compareTo(product.getSellingPrice()) < 0 ? currentPrice : null)
                .discountStartDate(product.getDiscountStartDate())
                .discountEndDate(product.getDiscountEndDate())
                .isFeatured(product.isFeatured())
                .stock(product.getStock())
                .soldQuantity(product.getSoldQuantity())
                .category(mapCategoryToDTO(product.getCategory()))
                .supplier(mapSupplierToDTO(product.getSupplier()))
                .images(product.getImages().stream().map(this::mapProductImageToDTO).collect(Collectors.toList()))
                .inventory(product.getInventory())
                .inventoryLogs(product.getInventoryLogs())
                .build();
    }

    private BigDecimal getCurrentPrice(Product product, LocalDateTime now) {
        if (product.getDiscountedPrice() != null &&
                product.getDiscountStartDate() != null &&
                product.getDiscountEndDate() != null &&
                !now.isBefore(product.getDiscountStartDate()) &&
                !now.isAfter(product.getDiscountEndDate())) {
            return product.getDiscountedPrice();
        }
        return product.getSellingPrice();
    }

    private CategoryDTO mapCategoryToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    private SupplierDTO mapSupplierToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .build();
    }

    private ProductImageDTO mapProductImageToDTO(ProductImage image) {
        return ProductImageDTO.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .build();
    }
}