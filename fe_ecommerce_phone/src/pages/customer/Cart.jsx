import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TotalPrice from "../../components/cart/TotalPrice";
import CartTable from "../../components/cart/CartTable";
import CheckOutButton from "../../components/cart/CheckOutButton";
import TitleMessage from "../../components/cart/TitleMessage";
import AppContext from "../../context/AppContext";

function Cart() {
    const { cartItems, removeFromCart, updateCartItemQuantity } = useContext(AppContext);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(cartItems.map((item) => item.id));
            setSelectedItems(allIds);
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id) => {
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(id)) {
            newSelectedItems.delete(id);
        } else {
            newSelectedItems.add(id);
        }
        setSelectedItems(newSelectedItems);
    };

    const handleDeleteAll = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?")) {
            cartItems.forEach((item) => removeFromCart(item.id));
            setSelectedItems(new Set());
        }
    };

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
            return;
        }

        const selectedProducts = cartItems.filter((item) => selectedItems.has(item.id));
        navigate("/checkout", { state: { selectedProducts } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex flex-col w-full">
            <div className="w-full flex-grow mx-auto">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50 animate-pulse pointer-events-none"></div>

                <div className="relative z-10 mb-8 text-center">
                    <TitleMessage className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 animate-pulse shadow-lg" />
                </div>

                {cartItems.length > 0 ? (
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="backdrop-blur-md bg-gray-900/80 border border-gray-700 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 w-full">
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={handleDeleteAll}
                                    className="px-3 py-1 sm:px-4 sm:py-2 md:px-5 md:py-3 text-sm md:text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-800 rounded-full hover:from-red-700 hover:to-red-900 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-red-500/50"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            <CartTable
                                cartItems={cartItems}
                                setCartItems={(items) => items.forEach((item) => updateCartItemQuantity(item.id, item.quantity))} // Cập nhật qua AppContext
                                selectedItems={selectedItems}
                                handleSelectItem={handleSelectItem}
                                handleSelectAll={handleSelectAll}
                                className="text-gray-100 w-full"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 w-full">
                            <TotalPrice
                                cartItems={cartItems}
                                selectedItems={selectedItems}
                                className="text-xl sm:text-2xl md:text-3xl font-semibold text-cyan-200 bg-gray-900/90 p-3 sm:p-4 md:p-5 rounded-lg shadow-lg w-full sm:w-auto text-center sm:text-left"
                            />
                            <CheckOutButton
                                onCheckout={handleCheckout}
                                isLoading={isLoading}
                                className="relative inline-flex items-center justify-center px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 w-full sm:w-auto"
                            />
                        </div>
                    </div>
                ) : (
                    <p className="relative z-10 text-center text-gray-300 text-lg sm:text-xl md:text-2xl mt-12 mb-24 animate-fade-in">
                        Giỏ hàng trống. Hãy thêm sản phẩm để trải nghiệm!
                    </p>
                )}
            </div>
        </div>
    );
}

export default Cart;