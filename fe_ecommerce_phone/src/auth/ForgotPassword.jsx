import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Card, CardContent, CardFooter } from "@/components/common/Card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { forgotPassword } from "@/api/apiAuth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [valid, setValid] = useState(false);
    const [message, setMessage] = useState("");

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (!validateEmail(value)) {
            setError("Email không đúng định dạng!");
            setValid(false);
        } else {
            setError("");
            setValid(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!valid) return;

        try {
            const response = await forgotPassword(email);
            setMessage(response.message || "Hướng dẫn đặt lại mật khẩu đã được gửi!");
        } catch (error) {
            console.error("Lỗi gửi yêu cầu khôi phục mật khẩu:", error);
            setError(error.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 flex items-center justify-center p-4 relative overflow-hidden">
            <Particles
                id="tsparticles-forgot"
                init={particlesInit}
                options={{
                    particles: {
                        number: { value: 50, density: { enable: true, value_area: 800 } },
                        color: { value: ["#a855f7", "#ec4899", "#000000"] },
                        shape: { type: "circle" },
                        opacity: { value: 0.3, random: true },
                        size: { value: 3, random: true },
                        move: { enable: true, speed: 1, direction: "none", random: true, out_mode: "out" },
                    },
                    interactivity: {
                        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
                        modes: { repulse: { distance: 100 }, push: { particles_nb: 4 } },
                    },
                }}
                className="absolute inset-0"
            />
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-full max-w-lg text-left space-y-6 relative z-10"
            >
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tight drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                    Khôi phục mật khẩu
                </h1>
                <p className="text-gray-900 text-lg font-light">
                    Nhập email để nhận hướng dẫn đặt lại mật khẩu
                </p>
                <Card className="bg-white/95 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-gray-300/20 rounded-3xl overflow-hidden ring-1 ring-purple-400/30 hover:ring-purple-400/70 transition-all duration-700">
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-8 p-10">
                            <div className="space-y-2">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 1 }}
                                    whileFocus={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-gray-500 font-light"
                                        required
                                    />
                                </motion.div>
                                <div className="flex items-center">
                                    {error && <p className="text-sm text-red-600 font-light">{error}</p>}
                                    {valid && <CheckCircle2 className="text-green-600 ml-2" size={16} />}
                                </div>
                            </div>
                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-sm text-purple-600 font-light"
                                >
                                    {message}
                                </motion.p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-6 p-10 pt-0">
                            <motion.div whileHover={{ scale: 1.1, rotate: 2 }} transition={{ type: "spring", stiffness: 500 }}>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:scale-105 transition-all duration-500 disabled:opacity-60 disabled:scale-100"
                                    disabled={!valid}
                                >
                                    Gửi yêu cầu
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ x: 10 }} className="text-center text-sm text-gray-600 font-light">
                                <p>
                                    Quay lại{" "}
                                    <NavLink to="/auth/login" className="text-purple-600 hover:text-pink-600 transition-colors duration-300">
                                        Đăng nhập
                                    </NavLink>
                                </p>
                            </motion.div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;