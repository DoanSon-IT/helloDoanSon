import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import AppContext from "../../context/AppContext";
import apiUser from "../../api/apiUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await apiUser.getCurrentUser();
                setProfile(data);
                setFormData({
                    fullName: data.fullName || "",
                    phone: data.phone || "",
                    address: data.address || "",
                });
            } catch (err) {
                setError(err.message || "Không thể tải thông tin cá nhân!");
                toast.error(err.message || "Không thể tải thông tin cá nhân!");
                console.error("🚨 Lỗi khi lấy thông tin cá nhân:", err);
                navigate("/auth/login"); // Chuyển hướng nếu lỗi (ví dụ: 401)
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]); // Loại 'auth' khỏi dependency vì không cần kiểm tra token ở đây

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedProfile = await apiUser.updateCurrentUser(formData);
            setProfile(updatedProfile);
            setIsEditing(false);
            toast.success("Cập nhật thông tin thành công!");
        } catch (err) {
            setError(err.message || "Không thể cập nhật thông tin!");
            toast.error(err.message || "Không thể cập nhật thông tin!");
            console.error("🚨 Lỗi khi cập nhật thông tin:", err);
        }
    };

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <p className="text-gray-700 text-xl">Đang tải thông tin...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <p className="text-red-600 text-xl">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full h-full p-6 relative overflow-hidden bg-white">
            <Particles
                id="tsparticles-profile"
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
                className="w-full max-w-lg bg-white shadow-[0_0_30px_rgba(0,0,0,0.1)] border border-gray-200 rounded-3xl p-8 relative z-10"
            >
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-3xl font-extrabold text-gray-900 mb-6"
                >
                    Thông tin cá nhân
                </motion.h1>

                {profile && (
                    <>
                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-6 text-gray-700">
                                <div>
                                    <label className="font-semibold text-gray-900">Họ và tên:</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-900">Số điện thoại:</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-900">Địa chỉ:</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-gray-300 text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-400 transition-all duration-300"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6 text-gray-700">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Họ và tên:</span>
                                    <span>{profile.fullName}</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Email:</span>
                                    <span>{profile.email}</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Số điện thoại:</span>
                                    <span>{profile.phone || "Chưa cập nhật"}</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Địa chỉ:</span>
                                    <span>{profile.address || "Chưa cập nhật"}</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Ngày tạo:</span>
                                    <span>{new Date(profile.createdAt).toLocaleDateString("vi-VN")}</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Vai trò:</span>
                                    <span>{profile.roles.join(", ")}</span>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="flex items-center gap-4">
                                    <span className="font-semibold text-gray-900">Xác thực:</span>
                                    <span className={profile.verified ? "text-green-600" : "text-red-600"}>
                                        {profile.verified ? "Đã xác thực" : "Chưa xác thực"}
                                    </span>
                                </motion.div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300"
                                >
                                    Chỉnh sửa
                                </button>
                            </div>
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.6 }}
                            className="mt-8"
                        >
                            <button
                                onClick={() => navigate("/")}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:scale-105"
                            >
                                Quay lại trang chủ
                            </button>
                        </motion.div>
                    </>
                )}
            </motion.div>
            <ToastContainer />
        </div>
    );
};

export default Profile;