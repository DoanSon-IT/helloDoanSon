import { useEffect, useState } from "react";
import apiChat from "../../api/apiChat";

function AdminChat({ isAuthenticated }) {
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);
    const [onlineCustomers, setOnlineCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null); // Thêm state để chọn khách hàng

    // Tải lịch sử chat của khách hàng được chọn
    useEffect(() => {
        if (!isAuthenticated || !selectedCustomer) return;

        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                // Giả sử bạn có cách lấy customerId từ email trong onlineCustomers
                const customerId = onlineCustomers.indexOf(selectedCustomer) + 1; // Ví dụ tạm thời
                const chatHistory = await apiChat.getChatHistory(customerId, token);
                if (chatHistory.length > 0) {
                    console.log("✅ Lịch sử chat Admin đã load:", chatHistory);
                    setMessages(chatHistory.map(msg => ({
                        id: msg.id,
                        content: msg.content,
                        from: msg.senderId === 0 ? "Admin" : msg.senderId.email || msg.from, // Hiển thị email khách hàng
                        read: msg.read
                    })));
                } else {
                    console.log("⚠ Không có lịch sử chat cho khách hàng:", selectedCustomer);
                }
            } catch (error) {
                console.error("❌ Lỗi khi tải lịch sử chat Admin:", error);
            }
        };

        fetchHistory();
    }, [isAuthenticated, selectedCustomer]);

    const initializeWebSocket = () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("❌ Không có accessToken để kết nối WebSocket!");
            return null;
        }

        const ws = new WebSocket(`ws://localhost:8080/ws/chat?token=${encodeURIComponent(accessToken)}`);

        ws.onopen = () => {
            console.log("✅ WebSocket Admin connected!");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "message") {
                setMessages((prev) => [
                    ...prev,
                    { id: data.id, content: data.content, from: data.from, read: data.read }
                ]);
                if (!onlineCustomers.includes(data.from) && data.from !== "Admin") {
                    setOnlineCustomers((prev) => [...prev, data.from]);
                }
            } else if (data.type === "notification") {
                setNotifications((prev) => [...prev, { content: data.content, messageId: data.messageId }]);
            } else if (data.type === "error") {
                setMessages((prev) => [
                    ...prev,
                    { content: data.content, from: "Hệ thống", error: true }
                ]);
            }
        };

        ws.onerror = (error) => console.error("❌ WebSocket error:", error);
        ws.onclose = (event) => {
            console.log("⚠ WebSocket closed! Code:", event.code, "Reason:", event.reason);
            setSocket(null);
            if (event.code !== 1000) {
                refreshAccessToken().then((success) => {
                    if (success) setTimeout(initializeWebSocket, 2000);
                });
            }
        };

        return ws;
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const ws = initializeWebSocket();
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(1000, "Component unmounted");
            }
        };
    }, [isAuthenticated]);

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            console.error("❌ Không có refreshToken để làm mới accessToken!");
            return false;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("accessToken", data.accessToken);
                console.log("🔄 accessToken đã được cập nhật!");
                return true;
            }
            console.error("❌ Không thể làm mới token!");
            return false;
        } catch (error) {
            console.error("❌ Lỗi khi làm mới token:", error);
            return false;
        }
    };

    const sendMessage = (targetEmail) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket chưa sẵn sàng hoặc đã đóng!");
            setMessages((prev) => [
                ...prev,
                { content: "Lỗi: Kết nối WebSocket chưa sẵn sàng!", from: "Hệ thống", error: true }
            ]);
            return;
        }

        if (input.trim() === "") {
            console.error("❌ Không thể gửi tin nhắn rỗng!");
            return;
        }

        if (!targetEmail) {
            console.error("❌ Không có khách hàng nào để gửi tin nhắn!");
            return;
        }

        try {
            const message = `to:${targetEmail}:${input}`;
            socket.send(message);
            setMessages((prev) => [
                ...prev,
                { content: input, from: "Admin", read: true }
            ]);
            setInput("");
        } catch (error) {
            console.error("❌ Lỗi khi gửi tin nhắn qua WebSocket:", error);
        }
    };

    return (
        <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Chat Admin/Staff</h3>
            <div className="mb-2 p-2 bg-green-100 border border-green-400 rounded">
                <h4 className="font-bold">Khách hàng đang online:</h4>
                {onlineCustomers.length > 0 ? (
                    onlineCustomers.map((customer, idx) => (
                        <p
                            key={idx}
                            className={`text-green-800 cursor-pointer ${selectedCustomer === customer ? "font-bold" : ""}`}
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            {customer}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-500">Không có khách hàng online</p>
                )}
            </div>
            {notifications.length > 0 && (
                <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 rounded">
                    {notifications.map((notif, idx) => (
                        <p key={idx} className="text-yellow-800">
                            {notif.content} (ID: {notif.messageId})
                        </p>
                    ))}
                </div>
            )}
            <div className="h-64 overflow-y-auto mb-2 p-2 bg-white rounded">
                {messages.map((msg, idx) => (
                    <p
                        key={idx}
                        className={`mb-1 ${msg.error ? "text-red-500" : msg.from === "Admin" ? "text-gray-800" : "text-blue-500 font-bold"}`}
                    >
                        <strong>{msg.from}:</strong> {msg.content} {msg.read || msg.from === "Admin" ? "" : "(Chưa đọc)"}
                    </p>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="Nhập tin nhắn..."
            />
            <button
                onClick={() => sendMessage(selectedCustomer || onlineCustomers[0] || "customer@example.com")}
                className="w-full p-2 rounded text-white bg-blue-500 hover:bg-blue-600"
                disabled={!selectedCustomer && onlineCustomers.length === 0}
            >
                Gửi
            </button>
        </div>
    );
}

export default AdminChat;