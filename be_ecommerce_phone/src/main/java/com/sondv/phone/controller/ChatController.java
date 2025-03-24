package com.sondv.phone.controller;

import com.sondv.phone.model.Message;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.security.JwtUtil;
import com.sondv.phone.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final MessageService messageService;

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public List<Message> getChatHistoryForAdmin(@RequestParam Long customerId) {
        return messageService.getChatHistory(customerId);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public List<Message> getChatHistoryForUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.err.println("❌ API Error: Missing or invalid Authorization header!");
            throw new IllegalArgumentException("Invalid Token!");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        if (email == null) {
            System.err.println("❌ API Error: Cannot extract email from token!");
            throw new IllegalArgumentException("Invalid Token!");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        System.out.println("✅ Fetching chat history for user: " + email);
        return messageService.getChatHistory(user.getId());
    }

    @PostMapping("/mark-as-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public void markAsRead(@RequestParam Long messageId) {
        messageService.markAsRead(messageId);
    }

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil; // Thêm dependency này

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token); // Dùng JwtUtil để lấy email từ token
    }
}