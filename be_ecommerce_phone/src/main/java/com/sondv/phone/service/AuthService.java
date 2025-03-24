package com.sondv.phone.service;

import com.sondv.phone.dto.AuthRequest;
import com.sondv.phone.dto.AuthResponse;
import com.sondv.phone.exception.ApiException;
import com.sondv.phone.model.Customer;
import com.sondv.phone.model.Role;
import com.sondv.phone.model.RoleName;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.CustomerRepository;
import com.sondv.phone.repository.RoleRepository;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomerRepository customerRepository;

    @Transactional
    public String register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(400, "Email đã tồn tại!");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new ApiException(400, "Số điện thoại đã được sử dụng!");
        }

        Role userRole = roleRepository.findByRoleName(RoleName.CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleName.CUSTOMER)));

        Set<RoleName> roles = new HashSet<>();
        roles.add(userRole.getRoleName());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.getRoles().add(RoleName.CUSTOMER);
        user.setVerified(false);

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationExpiry(LocalDateTime.now().plusHours(24));

        user = userRepository.save(user);

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setLoyaltyPoints(0);
        customerRepository.save(customer);

        sendVerificationEmail(user);

        return "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.";
    }

    @Transactional
    public String login(AuthRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            throw new ApiException(401, "Email hoặc mật khẩu không đúng!");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tài khoản!"));

        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return "Đăng nhập thành công!"; // Chỉ trả về message
    }

    @Transactional
    public String verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ApiException(400, "Token không hợp lệ hoặc đã hết hạn!"));

        if (user.getVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new ApiException(400, "Token xác thực đã hết hạn! Vui lòng đăng ký lại.");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationExpiry(null);
        userRepository.save(user);

        return "Tài khoản đã được xác thực thành công!";
    }

    @Transactional
    public String sendResetPasswordEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tài khoản!"));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userRepository.save(user);

        String resetLink = "http://localhost:8080/api/auth/reset-password?token=" + resetToken;
        String subject = "Khôi phục mật khẩu";
        String message = "Nhấn vào liên kết sau để đặt lại mật khẩu của bạn: " + resetLink;

        emailService.sendEmail(user.getEmail(), subject, message);
        return "Email đặt lại mật khẩu đã được gửi!";
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new ApiException(400, "Token không hợp lệ!"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);

        return "Mật khẩu đã được đặt lại thành công!";
    }

    @Transactional
    public String logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tài khoản!"));
        user.setRefreshToken(null);
        userRepository.save(user);
        SecurityContextHolder.clearContext();
        return "Đăng xuất thành công!";
    }

    private void sendVerificationEmail(User user) {
        String verificationLink = "http://localhost:8080/api/auth/verify?token=" + user.getVerificationToken();
        String subject = "Xác thực tài khoản của bạn";
        String message = "Chào " + user.getFullName() + ",\n\n"
                + "Vui lòng nhấn vào liên kết sau để xác thực tài khoản của bạn: " + verificationLink + "\n\n"
                + "Cảm ơn bạn đã đăng ký!";
        emailService.sendEmail(user.getEmail(), subject, message);
    }
}