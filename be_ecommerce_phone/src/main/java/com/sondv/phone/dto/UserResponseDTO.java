package com.sondv.phone.dto;

import com.sondv.phone.model.RoleName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
    private Set<RoleName> roles = new HashSet<>();
    private boolean isVerified; // ✅ Bổ sung isVerified

    // Constructor mặc định
    public UserResponseDTO() {}

    // Constructor đầy đủ
    public UserResponseDTO(Long id, String fullName, String email, String phone, String address, LocalDateTime createdAt, Set<RoleName> roles, boolean isVerified) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.createdAt = createdAt;
        this.roles = roles;
        this.isVerified = isVerified;
    }
}