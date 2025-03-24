package com.sondv.phone.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter implements Filter {
    private final RedisTemplate<String, String> redisTemplate;

    public RateLimitFilter(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String key = getKey(httpRequest);
        ValueOperations<String, String> ops = redisTemplate.opsForValue(); // Đổi sang String

        String countStr = ops.get(key);
        int currentCount = (countStr == null) ? 0 : Integer.parseInt(countStr);

        if (currentCount >= getLimit(httpRequest)) {
            httpResponse.setStatus(429);
            httpResponse.setHeader("Retry-After", "60");
            httpResponse.getWriter().write("Quá nhiều request! Hãy thử lại sau.");
        } else {
            ops.increment(key, 1);
            redisTemplate.expire(key, 1, TimeUnit.MINUTES);
            chain.doFilter(request, response);
        }
    }

    private String getKey(HttpServletRequest request) {
        String userId = request.getHeader("X-User-ID");
        if (userId != null) {
            return "rate_limit:user:" + userId;
        }
        return "rate_limit:ip:" + request.getRemoteAddr();
    }

    private int getLimit(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.contains("/auth/login")) return 1000;
        if (path.contains("/checkout")) return 5000;
        return 50000;
    }
}
