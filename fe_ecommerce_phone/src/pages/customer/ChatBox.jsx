import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiChat from "../../api/apiChat";
import AppContext from "../../context/AppContext";

function ChatBox() {
    const { user } = useContext(AppContext);
    const isAuthenticated = !!user;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchHistory = async () => {
            try {
                const chatHistory = await apiChat.getMyChatHistory();
                if (chatHistory.length > 0) {
                    console.log("✅ Lịch sử chat đã load:", chatHistory);
                    setMessages(chatHistory.map(msg => ({
                        id: msg.id,
                        content: msg.content,
                        from: msg.senderId === user.id ? "Bạn" : "Admin",
                    })));
                } else {
                    console.log("⚠ Không có lịch sử chat.");
                }
            } catch (error) {
                console.error("❌ Lỗi khi tải lịch sử chat:", error);
            }
        };

        fetchHistory();
    }, [isAuthenticated, user]);

    const initializeWebSocket = () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("❌ Không có accessToken để kết nối WebSocket!");
            navigate("/auth/login");
            return null;
        }

        const ws = new WebSocket(`ws://localhost:8080/ws/chat?token=${encodeURIComponent(accessToken)}`);

        ws.onopen = () => {
            console.log("✅ WebSocket Customer connected!");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "message") {
                setMessages((prev) => [
                    ...prev,
                    { id: data.id, content: data.content, from: data.from === user.email ? "Bạn" : "Admin" }
                ]);
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
                refreshAccessToken().then(() => setTimeout(initializeWebSocket, 2000));
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
            navigate("/auth/login");
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
            } else {
                console.error("❌ Không thể làm mới token, đăng xuất...");
                navigate("/auth/login");
                return false;
            }
        } catch (error) {
            console.error("❌ Lỗi khi làm mới token:", error);
            navigate("/auth/login");
            return false;
        }
    };

    const sendMessage = () => {
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

        try {
            socket.send(input);
            setMessages((prev) => [
                ...prev,
                { content: input, from: "Bạn" } // Đảm bảo tin nhắn từ khách hàng là "Bạn"
            ]);
            setInput("");
        } catch (error) {
            console.error("❌ Lỗi khi gửi tin nhắn qua WebSocket:", error);
        }
    };

    const handleLoginRedirect = () => navigate("/auth/login");

    return (
        <>
            {!isAuthenticated ? (
                <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Chat với chúng tôi</h3>
                    <p className="text-red-500 text-center">
                        Vui lòng{" "}
                        <span onClick={handleLoginRedirect} className="underline cursor-pointer hover:text-red-700">
                            đăng nhập
                        </span>{" "}
                        để nhắn tin!
                    </p>
                </div>
            ) : (
                <div className="relative bg-gray-100 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">Chat với chúng tôi</h3>
                    <div className="h-64 overflow-y-auto mb-2 p-2 bg-white rounded">
                        {messages.map((msg, idx) => (
                            <p key={idx} className={`mb-1 ${msg.error ? "text-red-500" : msg.from === "Bạn" ? "text-blue-500" : "text-gray-800"}`}>
                                <strong>{msg.from}:</strong> {msg.content}
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
                        onClick={sendMessage}
                        className="w-full p-2 rounded text-white bg-blue-500 hover:bg-blue-600"
                    >
                        Gửi
                    </button>
                </div>
            )}
        </>
    );
}

export default ChatBox;