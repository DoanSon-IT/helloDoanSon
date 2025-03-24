package com.sondv.phone.security;

import com.sondv.phone.model.User;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.util.CookieUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        logger.info("🔍 Xử lý request: {}", request.getRequestURI());

        Optional<String> tokenOpt = CookieUtil.getCookieValue(request, "auth_token");
        if (tokenOpt.isEmpty()) {
            logger.info("🚫 Không có auth token trong request");
            chain.doFilter(request, response);
            return;
        }

        String token = tokenOpt.get();
        logger.info("🔑 Nhận token từ cookie: {}", token.substring(0, 10) + "...");

        try {
            if (!jwtUtil.isTokenValid(token)) {
                logger.warn("⛔ Token không hợp lệ hoặc đã hết hạn!");
                chain.doFilter(request, response);
                return;
            }

            String email = jwtUtil.extractUsername(token);
            logger.info("📧 Trích xuất email từ token: {}", email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> {
                            logger.error("⚠ User không tồn tại trong DB: {}", email);
                            return new JwtException("User không tồn tại!");
                        });

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("✅ Đã xác thực user: {}", email);
            }
        } catch (ExpiredJwtException e) {
            logger.warn("🔄 Token đã hết hạn: {}", e.getMessage());
        } catch (JwtException e) {
            logger.warn("⛔ Lỗi xác thực token: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            return;
        }

        chain.doFilter(request, response);
    }
}
