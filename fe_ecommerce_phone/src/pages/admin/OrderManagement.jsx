import React, { useState, useEffect, useContext } from "react";
import apiOrder from "../../api/apiOrder"; // Sửa import để dùng object
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderManagement = () => {
    const { auth } = useContext(AppContext); // Sửa từ 'user' thành 'auth'
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        console.log("Auth state:", auth); // Debug auth
        if (!auth?.accessToken) {
            console.log("No access token, redirecting to login");
            navigate("/login");
        } else {
            fetchOrders();
        }
    }, [auth, navigate]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await apiOrder.getOrders();
            setOrders(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            const order = await apiOrder.getOrderById(orderId);
            setSelectedOrder(order);
            setIsModalOpen(true);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await apiOrder.updateOrderStatus(orderId, newStatus);

            if (newStatus === "CANCELLED") {
                response.orderDetails.forEach(async (detail) => {
                    await apiInventory.adjustInventory(detail.product.id, detail.quantity, "Hoàn hàng do hủy đơn");
                });
            }

            setOrders(orders.map((order) => (order.id === orderId ? response : order)));
            toast.success("Cập nhật trạng thái thành công!");
        } catch (err) {
            toast.error(err.message);
        }
    };


    const handleDeleteOrder = async (orderId) => {
        const orderToDelete = orders.find((order) => order.id === orderId);
        if (orderToDelete.status !== "CANCELLED") {
            toast.warn("Chỉ có thể xóa đơn hàng đã hủy!");
            return;
        }
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
            try {
                await apiOrder.deleteOrder(orderId);
                setOrders(orders.filter((order) => order.id !== orderId));
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(null);
                    setIsModalOpen(false);
                }
                toast.success("Xóa đơn hàng thành công!");
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
                console.error(err);
            }
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "PENDING": return "Đang xử lý";
            case "SHIPPED": return "Đang giao";
            case "COMPLETED": return "Đã giao";
            case "CANCELLED": return "Đã hủy";
            default: return status;
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Quản lý đơn hàng</h2>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg shadow-md">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 text-left">Mã đơn hàng</th>
                                <th className="p-3 text-left">Khách hàng</th>
                                <th className="p-3 text-left">Ngày đặt</th>
                                <th className="p-3 text-left">Tổng tiền</th>
                                <th className="p-3 text-left">Trạng thái</th>
                                <th className="p-3 text-left">Chi tiết</th>
                                <th className="p-3 text-left">Cập nhật</th>
                                <th className="p-3 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">#{order.id}</td>
                                    <td className="p-3">{order.customer?.user?.fullName || "N/A"}</td>
                                    <td className="p-3">{new Date(order.createdAt).toLocaleString()}</td>
                                    <td className="p-3">{order.totalPrice.toLocaleString()} VND</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm ${order.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : order.status === "SHIPPED"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleViewDetails(order.id)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                            className="p-1 border rounded"
                                        >
                                            <option value="PENDING">Đang xử lý</option>
                                            <option value="SHIPPED">Đang giao</option>
                                            <option value="COMPLETED">Đã giao</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDeleteOrder(order.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
                        <h3 className="text-xl font-semibold mb-4">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                        <p><strong>Khách hàng:</strong> {selectedOrder.customer?.user?.fullName || "N/A"}</p>
                        <p><strong>Email:</strong> {selectedOrder.customer?.user?.email || "N/A"}</p>
                        <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        <p><strong>Trạng thái:</strong> {getStatusText(selectedOrder.status)}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.shippingInfo?.address || "Chưa có thông tin"}</p>
                        <p><strong>Số điện thoại:</strong> {selectedOrder.shippingInfo?.phoneNumber || "Chưa có thông tin"}</p>
                        <p><strong>Đơn vị vận chuyển:</strong> {selectedOrder.shippingInfo?.carrier || "Chưa có thông tin"}</p>

                        <h4 className="mt-4 font-medium">Sản phẩm:</h4>
                        <ul className="mt-2 space-y-2">
                            {selectedOrder.orderDetails?.map((detail) => (
                                <li key={detail.id} className="flex justify-between">
                                    <span>{detail.product?.name || "N/A"} (x{detail.quantity})</span>
                                    <span>{(detail.price * detail.quantity).toLocaleString()} VND</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 font-semibold">Tổng tiền: {selectedOrder.totalPrice.toLocaleString()} VND</p>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default OrderManagement;