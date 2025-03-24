import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import apiOrder from "../../api/apiOrder";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Orders = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await apiOrder.getOrders();
            console.log("Dữ liệu đơn hàng từ API:", data); // Log để kiểm tra
            setOrders(data);
        } catch (error) {
            setError(error.message || "Không thể tải danh sách đơn hàng!");
            toast.error(error.message || "Không thể tải danh sách đơn hàng!");
            console.error("🚨 Lỗi khi lấy đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Đơn hàng của tôi
                    </h2>
                    <p className="mt-2 text-gray-600 text-lg">
                        Theo dõi và quản lý tất cả đơn hàng của bạn tại đây
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                        <p className="text-gray-600 text-lg">
                            Bạn chưa có đơn hàng nào. Bắt đầu mua sắm ngay!
                        </p>
                        <a
                            href="/products"
                            className="mt-4 inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300"
                        >
                            Mua sắm ngay
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] transition-all duration-300 p-6 border border-gray-200"
                            >
                                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Mã đơn hàng: #{order.id}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "COMPLETED"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "PENDING"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {order.status === "PENDING"
                                            ? "Đang xử lý"
                                            : order.status === "COMPLETED"
                                                ? "Đã giao"
                                                : order.status}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                                        Sản phẩm
                                    </h4>
                                    <div className="space-y-3">
                                        {order.orderDetails.map((detail) => (
                                            <div
                                                key={detail.id}
                                                className="flex justify-between items-center py-2 border-b border-gray-100"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-gray-700">
                                                        {detail.productName}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">
                                                        x{detail.quantity}
                                                    </span>
                                                </div>
                                                <span className="text-gray-900 font-medium">
                                                    {(detail.price * detail.quantity).toLocaleString()} VND
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-lg font-medium text-gray-900">
                                        Tổng tiền:
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {(order.totalPrice || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Orders;