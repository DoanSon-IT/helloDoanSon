package com.sondv.phone.service;

import com.sondv.phone.model.Message;
import com.sondv.phone.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;

    public Message saveMessage(Long senderId, Long receiverId, String content) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setRead(false);
        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(Long customerId) {
        // Lấy lịch sử chat giữa customer và admin/staff (0 đại diện cho SYSTEM hoặc nhóm)
        List<Message> history = messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderId(customerId, 0L, 0L, customerId);
        // Đánh dấu tin nhắn từ khách hàng là đã đọc khi ADMIN/STAFF xem lịch sử
        history.forEach(msg -> {
            if (msg.getSenderId().equals(customerId) && !msg.isRead()) {
                msg.setRead(true);
                messageRepository.save(msg);
            }
        });
        return history;
    }

    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Tin nhắn không tồn tại với ID: " + messageId));
        if (!message.isRead()) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }
}