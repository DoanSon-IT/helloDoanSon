package com.sondv.phone.controller;

import com.sondv.phone.dto.AuthRequest;
import com.sondv.phone.dto.AuthResponse;
import com.sondv.phone.exception.ApiException;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.security.JwtUtil;
import com.sondv.phone.util.CookieUtil;
import com.sondv.phone.service.AuthService;
import com.sondv.phone.validation.ValidationGroup;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Validated(ValidationGroup.Register.class) @RequestBody AuthRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(new AuthResponse(message));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        String message = authService.login(request); // Gọi service và nhận message

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tài khoản!"));
        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        CookieUtil.addCookie(response, "auth_token", accessToken, 15 * 60);
        CookieUtil.addCookie(response, "refresh_token", refreshToken, 7 * 24 * 60 * 60);

        return ResponseEntity.ok(new AuthResponse(message)); // Chỉ trả message
    }

    @GetMapping("/verify")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestParam String token) {
        String message = authService.verifyEmail(token);
        return ResponseEntity.ok(new AuthResponse(message));
    }

    @GetMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestParam String email) {
        String message = authService.sendResetPasswordEmail(email);
        return ResponseEntity.ok(new AuthResponse(message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        String message = authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(new AuthResponse(message));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(value = "refresh_token", defaultValue = "") String refreshToken,
            HttpServletResponse response) {
        if (refreshToken.isEmpty()) {
            return ResponseEntity.status(401).body(new AuthResponse("Không tìm thấy refresh token!"));
        }
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ApiException(401, "Refresh Token không hợp lệ!"));

        if (!jwtUtil.validateRefreshToken(refreshToken, user.getEmail())) {
            throw new ApiException(401, "Refresh Token không hợp lệ hoặc đã hết hạn!");
        }

        String newAccessToken = jwtUtil.generateToken(user);
        CookieUtil.addCookie(response, "auth_token", newAccessToken, 15 * 60);
        return ResponseEntity.ok(new AuthResponse("Làm mới Access Token thành công!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        Optional<String> refreshTokenOpt = CookieUtil.getCookieValue(request, "refresh_token");
        if (refreshTokenOpt.isPresent()) {
            User user = userRepository.findByRefreshToken(refreshTokenOpt.get()).orElse(null);
            if (user != null) {
                user.setRefreshToken(null);
                userRepository.save(user);
            }
        }
        CookieUtil.clearCookie(response, "auth_token");
        CookieUtil.clearCookie(response, "refresh_token");
        return ResponseEntity.ok(new AuthResponse("Đã đăng xuất!"));
    }

    @GetMapping("/check-cookie")
    public ResponseEntity<AuthResponse> checkCookie(HttpServletRequest request) {
        Optional<String> tokenOpt = CookieUtil.getCookieValue(request, "auth_token");
        if (tokenOpt.isPresent()) {
            return ResponseEntity.ok(new AuthResponse("Cookie tồn tại"));
        } else {
            return ResponseEntity.ok(new AuthResponse("Không tìm thấy cookie auth_token"));
        }
    }
}