import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Card, CardContent, CardFooter } from "@/components/common/Card";
import { CheckCircle2, User, Mail, Phone, MapPin, Lock, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { registerUser } from "@/api/apiAuth";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });
    const [valids, setValids] = useState({
        fullName: false,
        email: false,
        phone: false,
        address: false,
        password: false,
        confirmPassword: false,
    });
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        const data = await response.json();
                        const address = `${data.city}, ${data.principalSubdivision}, ${data.countryName}`;
                        setFormData((prev) => ({ ...prev, address }));
                        setValids((prev) => ({ ...prev, address: true }));
                    } catch (err) {
                        setFormData((prev) => ({ ...prev, address: "" }));
                        setErrors((prev) => ({ ...prev, address: "Vui lòng nhập địa chỉ của bạn!" }));
                        setLocationError(true);
                    }
                },
                () => {
                    setErrors((prev) => ({ ...prev, address: "Vui lòng nhập địa chỉ của bạn!" }));
                    setLocationError(true);
                }
            );
        } else {
            setErrors((prev) => ({ ...prev, address: "Vui lòng nhập địa chỉ của bạn!" }));
            setLocationError(true);
        }
    }, []);

    const validateField = (name, value) => {
        if (name === "fullName") return value.length > 0 && value.length <= 100;
        if (name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (name === "phone") return /^\d{10}$/.test(value);
        if (name === "address") return value.length > 0;
        if (name === "password") return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(value);
        if (name === "confirmPassword") return value === formData.password && value.length > 0;
        return false;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (!validateField(name, value)) {
            setErrors((prev) => ({
                ...prev,
                [name]:
                    name === "fullName"
                        ? "Họ và tên không được để trống và tối đa 50 ký tự!"
                        : name === "email"
                            ? "Email không đúng định dạng!"
                            : name === "phone"
                                ? "Số điện thoại phải có đúng 10 chữ số!"
                                : name === "address"
                                    ? "Địa chỉ không được để trống!"
                                    : name === "password"
                                        ? "Mật khẩu phải có ít nhất 8 ký tự, chứa chữ và số!"
                                        : "Mật khẩu xác nhận không khớp!",
            }));
            setValids((prev) => ({ ...prev, [name]: false }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: "" }));
            setValids((prev) => ({ ...prev, [name]: true }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (Object.values(valids).some((valid) => !valid)) {
            setLoading(false);
            return;
        }

        try {
            const response = await registerUser({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password,
            });
            alert(response.message || "Đăng ký thành công!");
            setTimeout(() => navigate("/auth/login"), 1000);
        } catch (err) {
            setErrors((prev) => ({ ...prev, email: err.message || "Đăng ký thất bại!" }));
        } finally {
            setLoading(false);
        }
    };

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 flex items-center justify-center p-4 relative overflow-hidden">
            <Particles
                id="tsparticles"
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10"
            >
                <div className="w-full md:w-1/2 text-left space-y-6">
                    <motion.h1
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tight drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                    >
                        Đăng ký tài khoản
                    </motion.h1>
                    <motion.p
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="text-gray-900 text-xl font-light"
                    >
                        Khám phá dịch vụ đỉnh cao ngay bây giờ
                    </motion.p>
                </div>

                <Card className="w-full md:w-1/2 bg-white/95 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-gray-300/20 rounded-3xl overflow-hidden ring-1 ring-purple-400/30 hover:ring-purple-400/70 transition-all duration-700">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                        <CardContent className="space-y-6 p-8">
                            {locationError && (
                                <p className="text-sm text-amber-600 font-light">Không thể lấy địa chỉ tự động.</p>
                            )}
                            {[
                                { name: "email", placeholder: "Email", icon: Mail, type: "email" },
                                { name: "password", placeholder: "Mật khẩu", icon: Lock, type: "password" },
                                { name: "confirmPassword", placeholder: "Xác nhận mật khẩu", icon: KeyRound, type: "password" },
                                { name: "fullName", placeholder: "Họ và tên", icon: User, type: "text" },
                                { name: "phone", placeholder: "Số điện thoại", icon: Phone, type: "tel" },
                                { name: "address", placeholder: "Địa chỉ", icon: MapPin, type: "text" },
                            ].map(({ name, placeholder, icon: Icon, type }) => (
                                <div key={name} className="space-y-2">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 1 }}
                                        whileFocus={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                    >
                                        <div className="flex items-center gap-4 border border-gray-300 bg-gray-50 rounded-xl p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 group">
                                            <Icon size={24} className="text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
                                            <Input
                                                name={name}
                                                type={type}
                                                placeholder={placeholder}
                                                value={formData[name]}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none text-gray-900 focus:ring-2 focus:ring-purple-400 focus:outline-none text-base placeholder-gray-500 font-light"
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                    <div className="flex items-center">
                                        {errors[name] && <p className="text-sm text-red-600 font-light">{errors[name]}</p>}
                                        {valids[name] && <CheckCircle2 className="text-green-600 ml-2" size={16} />}
                                    </div>
                                </div>
                            ))}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-6 p-8 pt-0">
                            <motion.div whileHover={{ scale: 1.1, rotate: 2 }} transition={{ type: "spring", stiffness: 500 }}>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:scale-105 transition-all duration-500 disabled:opacity-60 disabled:scale-100"
                                    disabled={loading || Object.values(valids).some((valid) => !valid)}
                                >
                                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ x: 10 }} className="text-center text-sm text-gray-600 font-light">
                                <p>
                                    Đã có tài khoản?{" "}
                                    <NavLink to="/auth/login" className="text-purple-600 hover:text-pink-600 transition-colors duration-300">
                                        Đăng nhập
                                    </NavLink>
                                </p>
                                <p>
                                    <NavLink to="/auth/forgot-password" className="text-purple-600 hover:text-pink-600 transition-colors duration-300">
                                        Quên mật khẩu?
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

export default Register;