package com.sondv.phone.service;

import com.sondv.phone.model.Discount;
import com.sondv.phone.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiscountService {
    private final DiscountRepository discountRepository;

    // ✅ 1. Tạo mã giảm giá mới
    public Discount createDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    // ✅ 2. Lấy danh sách mã giảm giá
    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }

    // ✅ 3. Tìm mã giảm giá theo code
    public Optional<Discount> getDiscountByCode(String code) {
        return discountRepository.findByCode(code);
    }

    // ✅ 4. Xóa mã giảm giá
    public void deleteDiscount(Long id) {
        discountRepository.deleteById(id);
    }
}
