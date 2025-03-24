import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import {
    FaTachometerAlt,
    FaBox,
    FaList,
    FaShoppingCart,
    FaUsers,
    FaTruck,
    FaUserTie,
    FaChartPie,
    FaCog,
    FaBars,
    FaSignOutAlt,
    FaComments,
    FaWarehouse,
} from "react-icons/fa";

const SideBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true");
    const navigate = useNavigate();
    const { auth, logout } = useContext(AppContext); // Sửa từ user thành auth

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const newDarkMode = !prev;
            localStorage.setItem("darkMode", newDarkMode);
            document.documentElement.classList.toggle("dark", newDarkMode);
            return newDarkMode;
        });
    };

    const handleLogout = () => {
        // Xóa toàn bộ dữ liệu trong localStorage và sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Gọi hàm logout từ AppContext để reset auth và cartItems
        logout();

        // Làm mới trang để đảm bảo dữ liệu bị xóa hoàn toàn
        window.location.reload();
    };

    return (
        <aside
            className={`bg-white text-gray-900 w-64 min-h-screen p-4 shadow-lg transition-transform transform ${isOpen ? "translate-x-0" : "-translate-x-64"
                } md:translate-x-0 fixed md:relative z-50 ${isDarkMode ? "dark:bg-gray-800 dark:text-gray-200" : ""}`}
        >
            <button
                className="md:hidden absolute top-4 right-[-45px] bg-gray-900 text-white p-2 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaBars size={24} />
            </button>

            <h1 className="text-2xl font-bold mb-6 flex items-center">🛠️ Phone Store</h1>

            <nav className="space-y-2">
                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaTachometerAlt /> Dashboard
                </NavLink>
                <NavLink
                    to="/admin/products"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaBox /> Quản lý sản phẩm
                </NavLink>
                <NavLink
                    to="/admin/categories"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaList /> Quản lý danh mục
                </NavLink>
                <NavLink
                    to="/admin/orders"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaShoppingCart /> Quản lý đơn hàng
                </NavLink>
                <NavLink
                    to="/admin/customers"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaUsers /> Quản lý khách hàng
                </NavLink>
                <NavLink
                    to="/admin/suppliers"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaTruck /> Quản lý nhà cung cấp
                </NavLink>
                <NavLink
                    to="/admin/employees"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaUserTie /> Quản lý nhân viên
                </NavLink>
                <NavLink
                    to="/admin/inventory"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaWarehouse /> Quản lý tồn kho
                </NavLink>
                <NavLink
                    to="/admin/chat"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaComments /> Quản lý chat
                </NavLink>
                <NavLink
                    to="/admin/report"
                    className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }
                >
                    <FaChartPie /> Thống kê
                </NavLink>

                <div className="mt-6 border-t pt-3">
                    <NavLink to="/admin/settings" className={({ isActive }) =>
                        `flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-violet-400 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""
                        }`
                    }>
                        <FaCog /> Cài đặt
                    </NavLink>
                    <button
                        className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-200 w-full"
                        onClick={toggleDarkMode}
                    >
                        {isDarkMode ? "☀️ Chế độ sáng" : "🌙 Chế độ tối"}
                    </button>
                    <button
                        className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-red-200 text-red-600 w-full mt-2"
                        onClick={handleLogout}
                        disabled={!auth?.accessToken} // Sửa điều kiện disabled
                    >
                        <FaSignOutAlt /> Đăng xuất
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default SideBar;