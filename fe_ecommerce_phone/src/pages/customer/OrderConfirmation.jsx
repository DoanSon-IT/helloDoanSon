import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { state } = useLocation(); // Nhận dữ liệu từ Checkout nếu có

    // Giả sử state chứa thông tin đơn hàng (nếu backend trả về qua paymentUrl)
    const orderDetails = state?.orderDetails || {
        orderId: "Chưa có ID", // Thay bằng dữ liệu thực tế nếu có
        totalPrice: 0,
        paymentMethod: "COD", // Mặc định, sẽ thay đổi tùy Checkout
        products: [],
    };

    return (
        <div className="max-w-screen-2xl mx-auto p-9 pt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Xác nhận đơn hàng</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn.
            </p>

            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium">Thông tin đơn hàng</h3>
                <div className="mt-4 space-y-2">
                    <p><strong>Mã đơn hàng:</strong> {orderDetails.orderId}</p>
                    <p><strong>Phương thức thanh toán:</strong> {orderDetails.paymentMethod}</p>
                    <p><strong>Tổng tiền:</strong> {orderDetails.totalPrice.toLocaleString()} VND</p>
                </div>

                <h3 className="mt-6 text-lg font-medium">Sản phẩm đã đặt</h3>
                <ul className="mt-2 space-y-2">
                    {orderDetails.products.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>{(item.sellingPrice * item.quantity).toLocaleString()} VND</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Xem đơn hàng của tôi
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmation;