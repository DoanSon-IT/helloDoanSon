import React, { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logoutUser, loginUser } from "../api/apiAuth";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // ✅ Thêm biến loading auth riêng
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem("cartItems");
        return storedCart ? JSON.parse(storedCart) : [];
    });
    const [loading, setLoading] = useState(false); // loading cho login/logout
    const navigate = useNavigate();
    const location = useLocation();

    const publicRoutes = ["/", "/products", "/about", "/contact", "/category/:id", "/products/:id", "/cart", "/search", "/auth/login", "/auth/register", "/auth/forgot-password"];
    const protectedRoutes = ["/profile", "/orders", "/checkout", "/order-confirmation", "/vnpay-return"];
    const adminRoutes = ["/admin/dashboard", "/admin/products", "/admin/orders", "/admin/customers", "/admin/categories", "/admin/suppliers", "/admin/employees", "/admin/report", "/admin/inventory", "/admin/chat"];

    useEffect(() => {
        const checkAuth = async () => {
            const currentPath = location.pathname;
            if (publicRoutes.some(route => currentPath === route || currentPath.startsWith(route.replace(":id", "")))) {
                setAuthLoading(false); // ✅ Không cần kiểm tra, vẫn phải tắt loading
                return;
            }

            setAuthLoading(true); // ✅ Bắt đầu loading auth
            try {
                const user = await getCurrentUser();
                console.log("checkAuth - user:", user);
                setAuth(user);
            } catch (error) {
                console.error("checkAuth - lỗi:", error.response?.status, error.response?.data);
                setAuth(null);
                if (error.response?.status === 401) {
                    navigate("/auth/login", { replace: true, state: { from: location } });
                }
            } finally {
                setAuthLoading(false); // ✅ Kết thúc loading auth
            }
        };
        checkAuth();
    }, [location.pathname]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            await loginUser(credentials); // Gửi yêu cầu đăng nhập để set cookie
            const user = await getCurrentUser(); // Lấy thông tin user dựa trên cookie
            setAuth(user);
            console.log("Logged in, auth set to:", user);
            return user;
        } catch (error) {
            console.error("Login error:", error);
            setAuth(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutUser();
            setAuth(null);
            setCartItems([]);
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCartItems((prev) => {
            const existingItem = prev.find((i) => i.id === item.id);
            if (existingItem) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const updateCartItemQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCartItems((prev) =>
                prev.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        }
    };

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    return (
        <AppContext.Provider
            value={{
                auth,
                setAuth,
                authLoading, // ✅ Xuất authLoading ra context
                login,
                logout,
                cartItems,
                addToCart,
                removeFromCart,
                updateCartItemQuantity,
                loading,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
