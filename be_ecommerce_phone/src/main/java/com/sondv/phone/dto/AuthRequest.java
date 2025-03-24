package com.sondv.phone.dto;

import com.sondv.phone.validation.ValidationGroup;
import lombok.Data;
import jakarta.validation.constraints.*;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthRequest {

    @NotBlank(message = "Email không được để trống!")
    @Email(message = "Email không đúng định dạng!")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống!")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự!")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{6,}$",
            message = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!")
    private String password;

    // Chỉ yêu cầu khi đăng ký
    @NotBlank(message = "Tên đầy đủ không được để trống!", groups = ValidationGroup.Register.class)
    @Size(max = 50, message = "Tên đầy đủ không được vượt quá 50 ký tự!")
    private String fullName;

    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số!")
    private String phone;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự!")
    private String address;
}
