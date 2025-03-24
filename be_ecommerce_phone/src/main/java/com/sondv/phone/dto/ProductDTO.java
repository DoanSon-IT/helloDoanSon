package com.sondv.phone.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.sondv.phone.model.Inventory;
import com.sondv.phone.model.InventoryLog;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal discountedPrice;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime discountStartDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime discountEndDate;

    @JsonProperty("isFeatured")
    private boolean isFeatured = false;
    private Integer stock;
    private Integer soldQuantity;
    private CategoryDTO category;
    private SupplierDTO supplier;
    private List<ProductImageDTO> images;

    private Inventory inventory;
    private List<InventoryLog> inventoryLogs;
}