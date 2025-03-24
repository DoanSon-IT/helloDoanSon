import axiosInstance from "./axiosConfig";

const API_URL = "http://localhost:8080/api/chat";

const apiChat = {
    getChatHistory: async (customerId) =>
        axiosInstance.get("/history", { params: { customerId } }).then((res) => res.data).catch(() => []),
    getMyChatHistory: async () => axiosInstance.get("/my-history").then((res) => res.data).catch(() => []),
    markAsRead: async (messageId) =>
        axiosInstance.post("/mark-as-read", null, { params: { messageId } })
            .then(() => console.log(`✅ Tin nhắn ${messageId} đã được đánh dấu là đã đọc.`))
            .catch((error) => console.error("❌ Lỗi khi đánh dấu tin nhắn:", error)),
};

export default apiChat;