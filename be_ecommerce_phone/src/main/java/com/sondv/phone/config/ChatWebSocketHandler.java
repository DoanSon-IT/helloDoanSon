package com.sondv.phone.config;

import com.sondv.phone.model.Message;
import com.sondv.phone.model.RoleName;
import com.sondv.phone.model.User;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.service.MessageService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.LinkedBlockingQueue;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final UserRepository userRepository;
    private final MessageService messageService;

    @Value("${jwt.secret}")
    private String secretKey;

    private final Map<String, WebSocketSession> sessions = new HashMap<>();
    private final Map<String, Queue<LocalDateTime>> messageTimestamps = new HashMap<>();
    private final Map<String, Integer> duplicateMessageCount = new HashMap<>();
    private final Map<String, String> lastMessages = new HashMap<>();
    private static final int RATE_LIMIT = 5; // Số tin nhắn tối đa
    private static final int TIME_WINDOW = 10; // Giây
    private static final int DUPLICATE_THRESHOLD = 3; // Số lần lặp lại trước khi bị khóa
    private static final int BAN_DURATION = 5; // Phút

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        if (query == null || !query.contains("token=")) {
            System.out.println("❌ WebSocket đóng: Không có token");
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Missing token"));
            return;
        }

        String token = extractToken(query);
        System.out.println("🔄 Token nhận được: " + token);

        String email = validateToken(token);
        if (email == null) {
            System.out.println("❌ Token không hợp lệ hoặc hết hạn.");
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid or expired token"));
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            System.out.println("❌ Không tìm thấy user từ token.");
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("User not found"));
            return;
        }

        if (sessions.containsKey(email)) {
            sessions.get(email).close();
            System.out.println("⚠ Đóng session cũ của " + email);
        }

        sessions.put(email, session);
        session.getAttributes().put("email", email);

        System.out.println("✅ WebSocket connected for user: " + email);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String email = (String) session.getAttributes().get("email");

        if (email == null) {
            System.out.println("⚠ Lỗi: Không tìm thấy email từ session.");
            return;
        }

        try {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user!"));
            String payload = message.getPayload();

            System.out.println("📩 Nhận tin nhắn từ " + email + ": " + payload);

            if (isSpamming(user, payload)) {
                session.sendMessage(new TextMessage("{\"type\":\"error\",\"content\":\"Bạn bị khóa chat!\"}"));
                return;
            }

            if (user.getRoles().contains(RoleName.CUSTOMER)) {
                handleCustomerMessage(user, payload);
            } else if (user.getRoles().contains(RoleName.ADMIN) || user.getRoles().contains(RoleName.STAFF)) {
                handleAdminMessage(session, user, payload);
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi xử lý tin nhắn: " + e.getMessage());
            e.printStackTrace();
            try {
                session.sendMessage(new TextMessage("{\"type\":\"error\",\"content\":\"Lỗi hệ thống, vui lòng thử lại sau!\"}"));
            } catch (IOException ioException) {
                System.err.println("❌ Lỗi khi gửi thông báo lỗi: " + ioException.getMessage());
            }
        }
    }


    private boolean isSpamming(User user, String message) {
        String email = user.getEmail();

        // Kiểm tra nếu user đang bị cấm chat
        if (user.getChatBanUntil() != null && LocalDateTime.now().isBefore(user.getChatBanUntil())) {
            return true;
        }

        // Kiểm tra tần suất gửi tin nhắn
        messageTimestamps.putIfAbsent(email, new LinkedBlockingQueue<>(RATE_LIMIT));
        Queue<LocalDateTime> timestamps = messageTimestamps.get(email);
        if (timestamps.size() >= RATE_LIMIT) {
            if (Duration.between(timestamps.peek(), LocalDateTime.now()).getSeconds() < TIME_WINDOW) {
                banUser(user);
                return true;
            }
            timestamps.poll();
        }
        timestamps.offer(LocalDateTime.now());

        // Kiểm tra tin nhắn lặp lại nhiều lần
        String lastMessageKey = email + "_last";
        String lastMessage = lastMessages.getOrDefault(lastMessageKey, "");
        if (message.equals(lastMessage)) {
            duplicateMessageCount.put(email, duplicateMessageCount.getOrDefault(email, 0) + 1);
            if (duplicateMessageCount.get(email) >= DUPLICATE_THRESHOLD) {
                banUser(user);
                return true;
            }
        } else {
            duplicateMessageCount.put(email, 0);
        }
        lastMessages.put(lastMessageKey, message);

        return false;
    }

    private void banUser(User user) {
        user.setChatBanUntil(LocalDateTime.now().plusMinutes(BAN_DURATION));
        userRepository.save(user);
        duplicateMessageCount.put(user.getEmail(), 0);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String email = (String) session.getAttributes().get("email");
        if (email != null) {
            sessions.remove(email);
        }
    }

    private void handleCustomerMessage(User user, String payload) throws Exception {
        try {
            Message savedMessage = messageService.saveMessage(user.getId(), 0L, payload);
            String jsonMessage = "{\"type\":\"message\",\"id\":" + savedMessage.getId() + ",\"from\":\"" + user.getEmail() + "\",\"content\":\"" + payload + "\",\"read\":" + savedMessage.isRead() + "}";

            System.out.println("💾 Tin nhắn được lưu vào DB: " + jsonMessage);
            broadcastToAdminsOrStaff(jsonMessage);
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi lưu tin nhắn vào database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleAdminMessage(WebSocketSession session, User user, String payload) throws Exception {
        String[] parts = payload.split(":", 3);
        if (parts.length == 3 && parts[0].equals("to")) {
            String targetEmail = parts[1];
            String content = parts[2];
            User target = userRepository.findByEmail(targetEmail).orElse(null);
            if (target == null) {
                session.sendMessage(new TextMessage("{\"type\":\"error\",\"content\":\"Email không tồn tại\"}"));
                return;
            }
            Message savedMessage = messageService.saveMessage(user.getId(), target.getId(), content);
            WebSocketSession targetSession = sessions.get(targetEmail);
            if (targetSession != null && targetSession.isOpen()) {
                String jsonMessage = "{\"type\":\"message\",\"id\":" + savedMessage.getId() + ",\"from\":\"" + user.getEmail() + "\",\"content\":\"" + content + "\",\"read\":" + savedMessage.isRead() + "}";
                targetSession.sendMessage(new TextMessage(jsonMessage));
            }
        } else {
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"content\":\"Định dạng không đúng. Dùng: to:email:nội dung\"}"));
        }
    }

    private void sendWelcomeMessage(WebSocketSession session, Long userId) throws Exception {
        String welcomeMsg = "Chào bạn! Cửa hàng điện thoại sẵn sàng hỗ trợ!";
        Message savedMessage = messageService.saveMessage(0L, userId, welcomeMsg);
        session.sendMessage(new TextMessage("{\"type\":\"message\",\"id\":" + savedMessage.getId() + ",\"content\":\"" + welcomeMsg + "\",\"read\":" + savedMessage.isRead() + "}"));
    }

    private void broadcastToAdminsOrStaff(String jsonMessage) throws Exception {
        for (WebSocketSession s : sessions.values()) {
            User target = userRepository.findByEmail((String) s.getAttributes().get("email")).orElseThrow();
            if (s.isOpen() && (target.getRoles().contains(RoleName.ADMIN) || target.getRoles().contains(RoleName.STAFF))) {
                s.sendMessage(new TextMessage(jsonMessage));
            }
        }
    }

    private void broadcastNotificationToAdminsOrStaff(String notification) throws Exception {
        for (WebSocketSession s : sessions.values()) {
            User target = userRepository.findByEmail((String) s.getAttributes().get("email")).orElseThrow();
            if (s.isOpen() && (target.getRoles().contains(RoleName.ADMIN) || target.getRoles().contains(RoleName.STAFF))) {
                s.sendMessage(new TextMessage(notification));
            }
        }
    }

    private String extractToken(String query) {
        String token = query.substring(query.indexOf("token=") + 6);
        if (token.contains("&")) {
            token = token.split("&")[0];
        }
        return java.net.URLDecoder.decode(token, StandardCharsets.UTF_8);
    }

    private String validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Date expiration = claims.getExpiration();
            if (expiration.before(new Date())) {
                System.out.println("⚠ Token đã hết hạn.");
                return null;
            }

            return claims.getSubject(); // Trả về email của user
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi kiểm tra token: " + e.getMessage());
            return null;
        }
    }

}
