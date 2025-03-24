package com.sondv.phone.repository;

import com.sondv.phone.model.RoleName; // Thay Role bằng RoleName
import com.sondv.phone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);

    Optional<User> findByResetToken(String resetToken);
    List<User> findByRoles(RoleName roleName); // Sửa từ Role thành RoleName
    Optional<User> findByRefreshToken(String refreshToken);
    Optional<User> findByVerificationToken(String verificationToken);
    List<User> findTop10ByOrderByCreatedAtDesc();

    List<User> findByCreatedAtAfter(LocalDateTime startDate);

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC LIMIT ?1")
    List<User> findTopNByOrderByCreatedAtDesc(int limit);
}