package com.sondv.phone.dto;

import lombok.Data;

import jakarta.validation.constraints.*;

@Data
public class UpdateUserRequestDTO {
    @NotBlank(message = "Tên đầy đủ không được để trống!")
    @Size(max = 50, message = "Tên đầy đủ không được vượt quá 50 ký tự!")
    private String fullName;

    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại phải có đúng 10 chữ số!")
    private String phone;

    private String address;
}