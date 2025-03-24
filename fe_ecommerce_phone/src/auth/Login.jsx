import React, { useState, useContext } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { loginUser, getCurrentUser } from "@/api/apiAuth";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Card, CardContent, CardFooter } from "@/components/common/Card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import AppContext from "../context/AppContext";

const Login = () => {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [valids, setValids] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "Email không đúng định dạng!" }));
        setValids((prev) => ({ ...prev, email: false }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
        setValids((prev) => ({ ...prev, email: true }));
      }
    }
    if (name === "password") {
      if (!validatePassword(value)) {
        setErrors((prev) => ({ ...prev, password: "Mật khẩu phải có ít nhất 8 ký tự!" }));
        setValids((prev) => ({ ...prev, password: false }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
        setValids((prev) => ({ ...prev, password: true }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valids.email || !valids.password) return;

    setLoading(true);
    try {
      const user = await login(formData); // Truyền formData vào login
      const from = location.state?.from?.pathname || "/";
      if (user?.roles?.includes("ADMIN")) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message || "Đăng nhập thất bại" }));
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full max-w-lg text-left space-y-6 relative z-10"
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tight drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
          Đăng nhập
        </h1>
        <p className="text-gray-900 text-lg font-light">Truy cập ngay để trải nghiệm tuyệt vời</p>
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
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-gray-500 font-light"
                    required
                  />
                </motion.div>
                <div className="flex items-center">
                  {errors.email && <p className="text-sm text-red-600 font-light">{errors.email}</p>}
                  {valids.email && <CheckCircle2 className="text-green-600 ml-2" size={16} />}
                </div>
              </div>
              <div className="space-y-2">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileFocus={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-gray-500 font-light"
                    required
                  />
                </motion.div>
                <div className="flex items-center">
                  {errors.password && <p className="text-sm text-red-600 font-light">{errors.password}</p>}
                  {valids.password && <CheckCircle2 className="text-green-600 ml-2" size={16} />}
                </div>
              </div>
              <motion.div whileHover={{ x: 10 }} className="text-right">
                <NavLink to="/auth/forgot-password" className="text-sm text-purple-600 hover:text-pink-600 transition-colors duration-300 font-light">
                  Quên mật khẩu?
                </NavLink>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 p-10 pt-0">
              {errors.general && <p className="text-sm text-red-600 font-light">{errors.general}</p>}
              <motion.div whileHover={{ scale: 1.1, rotate: 2 }} transition={{ type: "spring", stiffness: 500 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] hover:scale-105 transition-all duration-500 disabled:opacity-60 disabled:scale-100"
                  disabled={loading || !valids.email || !valids.password}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 10 }} className="text-center text-sm text-gray-600 font-light">
                <p>
                  Chưa có tài khoản?{" "}
                  <NavLink to="/auth/register" className="text-purple-600 hover:text-pink-600 transition-colors duration-300">
                    Đăng ký
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

export default Login;