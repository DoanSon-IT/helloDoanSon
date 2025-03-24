import React from "react";
import { motion } from "framer-motion";
import "tailwindcss/tailwind.css";

function AnnouncementBar({ announcements = [] }) {
    // Nếu không có announcements, dùng mặc định
    const defaultAnnouncements = announcements.length === 0
        ? [
            "🎉 Ưu đãi đặc biệt hôm nay - Giảm giá 30% tất cả sản phẩm!",
            "🚀 Nhanh tay sở hữu công nghệ đỉnh cao với giá sốc!",
            "💥 Deal hot - Miễn phí vận chuyển toàn quốc!",
        ]
        : announcements;

    return (
        <motion.div
            className="h-12 flex items-center justify-start bg-white border-b border-gray-200 shadow-md relative overflow-hidden"
            initial={{ opacity: 0 }} // Chỉ giữ opacity, bỏ y: -50
            animate={{
                opacity: 1,
                transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                },
            }}
        >
            {/* Chứa nhiều đoạn chữ chạy liên tục */}
            <motion.div
                className="whitespace-nowrap flex items-center text-blue-600 text-lg md:text-xl font-bold tracking-wide px-4 drop-shadow-lg"
                animate={{ x: ["100%", "-100%"] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: defaultAnnouncements.length * 10, // Tốc độ dựa trên số đoạn
                        ease: "linear",
                    },
                }}
            >
                {defaultAnnouncements.map((text, index) => (
                    <span
                        key={index}
                        className="mx-8 animate-bounce"
                        style={{
                            background: "linear-gradient(to right, #93c5fd, #a5b4fc)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        🎉 {text} 🎉
                    </span>
                ))}
            </motion.div>

            {/* Nút đóng (tùy chọn) */}
            <button
                onClick={() => alert("Đoàn Sơn đẹp trai thì không đóng được nha!")}
                className="absolute right-4 text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
                ✕
            </button>
        </motion.div>
    );
}

export default AnnouncementBar;