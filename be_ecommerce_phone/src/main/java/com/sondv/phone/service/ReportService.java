package com.sondv.phone.service;

import com.sondv.phone.model.Order;
import com.sondv.phone.model.OrderDetail;
import com.sondv.phone.model.OrderStatus;
import com.sondv.phone.model.Product;
import com.sondv.phone.repository.OrderDetailRepository;
import com.sondv.phone.repository.OrderRepository;
import com.sondv.phone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;

    // Tính tổng doanh thu theo khoảng thời gian
    public BigDecimal getRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByCreatedAtBetweenAndStatus(startDate, endDate, OrderStatus.COMPLETED)
                .stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    // Lấy danh sách sản phẩm bán chạy nhất theo khoảng thời gian
    public List<Map<String, Object>> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderCreatedAtBetweenAndOrderStatus(
                startDate, endDate, OrderStatus.COMPLETED);
        Map<Product, Integer> productSales = new HashMap<>();
        Map<Product, BigDecimal> productRevenue = new HashMap<>();

        for (OrderDetail detail : orderDetails) {
            Product product = detail.getProduct();
            int quantity = detail.getQuantity();
            BigDecimal revenue = detail.getPrice().multiply(BigDecimal.valueOf(quantity));

            productSales.put(product, productSales.getOrDefault(product, 0) + quantity);
            productRevenue.put(product, productRevenue.getOrDefault(product, BigDecimal.ZERO).add(revenue));
        }

        return productSales.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("name", entry.getKey().getName());
                    result.put("quantitySold", entry.getValue());
                    result.put("revenue", productRevenue.get(entry.getKey()));
                    return result;
                })
                .collect(Collectors.toList());
    }

    // Số lượng đơn hàng theo trạng thái
    public Map<String, Long> getOrderCountByStatus() {
        return Arrays.stream(OrderStatus.values())
                .collect(Collectors.toMap(
                        OrderStatus::name,
                        status -> orderRepository.countByStatus(status)
                ));
    }

    // Thống kê sản phẩm tồn kho thấp
    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    // Xuất báo cáo doanh thu ra Excel
    public byte[] exportRevenueReport(LocalDateTime startDate, LocalDateTime endDate) throws Exception {
        BigDecimal revenue = getRevenue(startDate, endDate);
        List<Map<String, Object>> topProducts = getTopSellingProducts(startDate, endDate, 5);

        Workbook workbook = new XSSFWorkbook();
        Sheet revenueSheet = workbook.createSheet("Revenue Report");
        Sheet productsSheet = workbook.createSheet("Top Products");

        // Revenue Sheet
        Row headerRow = revenueSheet.createRow(0);
        headerRow.createCell(0).setCellValue("Từ ngày");
        headerRow.createCell(1).setCellValue("Đến ngày");
        headerRow.createCell(2).setCellValue("Doanh thu (VNĐ)");
        Row dataRow = revenueSheet.createRow(1);
        dataRow.createCell(0).setCellValue(startDate.toString());
        dataRow.createCell(1).setCellValue(endDate.toString());
        dataRow.createCell(2).setCellValue(revenue.doubleValue());

        // Top Products Sheet
        Row productHeader = productsSheet.createRow(0);
        productHeader.createCell(0).setCellValue("Tên sản phẩm");
        productHeader.createCell(1).setCellValue("Số lượng bán");
        productHeader.createCell(2).setCellValue("Doanh thu (VNĐ)");
        int rowNum = 1;
        for (Map<String, Object> product : topProducts) {
            Row row = productsSheet.createRow(rowNum++);
            row.createCell(0).setCellValue((String) product.get("name"));
            row.createCell(1).setCellValue((Integer) product.get("quantitySold"));
            row.createCell(2).setCellValue(((BigDecimal) product.get("revenue")).doubleValue());
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }
}
