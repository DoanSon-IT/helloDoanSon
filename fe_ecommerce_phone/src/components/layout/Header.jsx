import { useState, useEffect, useContext, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search } from "lucide-react";
import { motion } from "framer-motion";
import AppContext from "../../context/AppContext";
import apiCategory from "../../api/apiCategory";
import apiProduct from "../../api/apiProduct";
import debounce from "lodash/debounce";

const Header = () => {
    const navigate = useNavigate();
    const { auth, logout, cartItems } = useContext(AppContext);
    const [categories, setCategories] = useState([]);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isAuthenticated = !!auth; // Kiểm tra auth có tồn tại không

    // Theo dõi scroll để làm header sticky
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lấy danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiCategory.getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // Theo dõi thay đổi trạng thái auth để debug
    useEffect(() => {
        console.log("Header render, isAuthenticated:", isAuthenticated, "auth:", auth);
    }, [auth]); // Chỉ re-run khi auth thay đổi

    const fetchSuggestionsDebounced = useCallback(
        debounce(async (query) => {
            if (query.trim()) {
                try {
                    const response = await apiProduct.getFilteredProducts(query, null, null, "", 0, 5);
                    const productNames = Array.isArray(response.content)
                        ? response.content.map((product) => product.name)
                        : Array.isArray(response)
                            ? response.map((product) => product.name)
                            : [];
                    setSuggestions(productNames);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Lỗi khi lấy gợi ý:", error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        fetchSuggestionsDebounced(searchQuery);
    }, [searchQuery, fetchSuggestionsDebounced]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate("/login");
    };

    return (
        <header
            className={`bg-white/95 backdrop-blur-xl border-b z-[1000] border-gray-300 shadow-[0_0_20px_rgba(0,0,0,0.1)] ${isSticky ? "fixed top-0 left-0 w-full z-[1000] transition-all duration-300" : "relative"}`}
        >
            <div className="max-w-screen-2xl flex items-center justify-between mx-auto p-4">
                {/* Logo */}
                <NavLink to="/" className="relative group">
                    <motion.img
                        src="/Logo.png"
                        alt="Logo"
                        className="w-40 h-auto"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 500 }}
                    />
                </NavLink>

                {/* Menu desktop */}
                <nav className="flex items-center space-x-8 text-base font-semibold">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `py-4 px-3 text-gray-700 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : ""}`
                        }
                    >
                        Trang chủ
                    </NavLink>
                    <div
                        className="relative group"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                    >
                        <NavLink
                            to="/products"
                            className={({ isActive }) =>
                                `py-4 px-3 text-gray-700 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : ""}`
                            }
                        >
                            Sản phẩm
                        </NavLink>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-0 top-[calc(100%-5px)] bg-white/95 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.1)] rounded-xl w-64 py-2 border border-gray-300"
                            >
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <NavLink
                                            key={category.id}
                                            to={`/category/${category.id}`}
                                            className={({ isActive }) =>
                                                `block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,00,0.1)] transition-all duration-300 transform hover:scale-105 ${isActive ? "bg-gray-100 text-black" : ""}`
                                            }
                                        >
                                            {category.name}
                                        </NavLink>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-gray-400">Không có danh mục</div>
                                )}
                            </motion.div>
                        )}
                    </div>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `py-4 px-3 text-gray-700 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : ""}`
                        }
                    >
                        Giới thiệu
                    </NavLink>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                            `py-4 px-3 text-gray-700 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : ""}`
                        }
                    >
                        Liên hệ
                    </NavLink>
                </nav>

                {/* Tìm kiếm và biểu tượng */}
                <div className="flex items-center space-x-6">
                    <form onSubmit={handleSearch} className="relative w-64">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 top-[calc(100%+5px)] bg-white/95 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.1)] rounded-xl w-full py-2 border border-gray-300 z-50"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black cursor-pointer transition-all duration-300 opacity-70 hover:opacity-100"
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </form>
                    <NavLink to="/cart" className="relative group">
                        <motion.div
                            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-500"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-black" />
                            {cartItemCount > 0 && (
                                <motion.span
                                    key={cartItemCount}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </motion.div>
                    </NavLink>
                    <div className="relative group" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                        <motion.button className="p-2 rounded-full hover:bg-gray-100 transition-all duration-500" whileHover={{ scale: 1.2, rotate: 10 }}>
                            <User className="w-6 h-6 text-gray-700 hover:text-black" />
                        </motion.button>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-[calc(100%-5px)] bg-white/95 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.1)] rounded-xl w-64 py-2 border border-gray-300"
                            >
                                {isAuthenticated ? (
                                    <>
                                        <NavLink
                                            to="/profile"
                                            className={({ isActive }) =>
                                                `block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:scale-105 ${isActive ? "bg-gray-100 text-black" : ""}`
                                            }
                                        >
                                            Thông tin cá nhân
                                        </NavLink>
                                        <NavLink
                                            to="/orders"
                                            className={({ isActive }) =>
                                                `block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:scale-105 ${isActive ? "bg-gray-100 text-black" : ""}`
                                            }
                                        >
                                            Đơn hàng
                                        </NavLink>
                                        <hr className="my-2 border-gray-300" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-100 hover:text-red-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-300 transform hover:scale-105"
                                        >
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            to="/auth/login"
                                            className={({ isActive }) =>
                                                `block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:scale-105 ${isActive ? "bg-gray-100 text-black" : ""}`
                                            }
                                        >
                                            Đăng nhập
                                        </NavLink>
                                        <NavLink
                                            to="/auth/register"
                                            className={({ isActive }) =>
                                                `block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:scale-105 ${isActive ? "bg-gray-100 text-black" : ""}`
                                            }
                                        >
                                            Đăng ký
                                        </NavLink>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;