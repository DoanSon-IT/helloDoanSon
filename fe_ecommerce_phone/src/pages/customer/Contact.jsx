import React, { useContext } from "react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import ChatBox from "./ChatBox";
import AppContext from "../../context/AppContext";

const Contact = () => {
    const { user } = useContext(AppContext);
    const isAuthenticated = !!user;

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <Particles
                id="tsparticles-contact"
                init={particlesInit}
                options={{
                    particles: {
                        number: { value: 50, density: { enable: true, value_area: 800 } },
                        color: { value: ["#ffffff", "#a855f7", "#ec4899"] },
                        shape: { type: "circle" },
                        opacity: { value: 0.3, random: true },
                        size: { value: 3, random: true },
                        move: { enable: true, speed: 1, direction: "none", random: true, out_mode: "out" },
                    },
                    interactivity: {
                        events: { onhover: { enable: true, mode: "repulse" } },
                        modes: { repulse: { distance: 100 } },
                    },
                    retina_detect: true,
                }}
                className="absolute inset-0 opacity-50"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-full max-w-4xl bg-gray-900/95 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-gray-700/50 rounded-3xl p-8 relative z-10 flex flex-col md:flex-row gap-8"
            >
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="md:w-1/2 text-gray-200 space-y-4"
                >
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-500 mb-4">
                        Liên hệ với chúng tôi
                    </h1>
                    <p>
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn! Nếu bạn có bất kỳ câu hỏi nào về sản phẩm, đơn hàng hay cần tư vấn, hãy nhắn tin trực tiếp với chúng tôi.
                    </p>
                    <div className="space-y-2">
                        <p><strong>Địa chỉ:</strong> 123 Đường Công Nghệ, TP. Hồ Chí Minh, Việt Nam</p>
                        <p><strong>Email:</strong> support@shopphone.com</p>
                        <p><strong>Số điện thoại:</strong> 0123-456-789</p>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="md:w-1/2"
                >
                    <ChatBox isAuthenticated={isAuthenticated} />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Contact;