import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiPayment from "../../api/apiPayment";
import apiUser from "../../api/apiUser";
import apiOrder from "../../api/apiOrder";
import AppContext from "../../context/AppContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Checkout = () => {
    const { auth, cartItems, removeFromCart } = useContext(AppContext);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [paymentMethod, setPaymentMethod] = useState("VNPAY");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        address: "",
        phoneNumber: "",
        carrier: "GHN",
    });

    const isLoggedIn = !!auth; // Chỉ kiểm tra auth có tồn tại không

    useEffect(() => {
        if (!isLoggedIn) {
            setShowModal(true); // Hiển thị modal nếu chưa đăng nhập
        } else {
            const fetchUserInfo = async () => {
                try {
                    const userData = await apiUser.getCurrentUser();
                    setShippingInfo({
                        address: userData.address || "",
                        phoneNumber: userData.phone || "",
                        carrier: "GHN",
                    });
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                    toast.error(error.message);
                }
            };
            fetchUserInfo();
        }
    }, [isLoggedIn]);

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handlePayment = async () => {
        if (selectedProducts.length === 0) {
            toast.warn("Không có sản phẩm nào để thanh toán!");
            return;
        }

        if (!shippingInfo.address || !shippingInfo.phoneNumber) {
            toast.warn("Vui lòng nhập đầy đủ địa chỉ và số điện thoại!");
            return;
        }

        setIsLoading(true);
        try {
            const orderRequest = {
                productIds: selectedProducts.map((item) => item.id),
                quantities: selectedProducts.map((item) => item.quantity),
                address: shippingInfo.address,
                phoneNumber: shippingInfo.phoneNumber,
                carrier: shippingInfo.carrier,
                shippingFee: "30000",

            };
            console.log("Order Request gửi đi:", orderRequest);

            const orderResponse = await apiOrder.createOrder(orderRequest);
            console.log("Order Response nhận được:", orderResponse);
            const orderId = orderResponse.id;

            const paymentRequest = {
                orderId: orderId,
                paymentMethod: paymentMethod,
                amount: orderResponse.totalPrice,
            };
            console.log("Payment Request gửi đi:", paymentRequest);

            const paymentResponse = await apiPayment.createPayment(orderId, paymentMethod);
            console.log("Payment Response:", paymentResponse);
            const paymentUrl = paymentResponse.paymentUrl;

            selectedProducts.forEach((item) => removeFromCart(item.id));

            if (paymentMethod === "VNPAY") {
                navigate("/vnpay-return", {
                    state: { vnp_ResponseCode: "00", vnp_TxnRef: orderId },
                });
            } else if (paymentMethod === "COD") {
                navigate("/order-confirmation", {
                    state: {
                        orderDetails: {
                            orderId: orderId,
                            totalPrice: orderResponse.totalPrice,
                            paymentMethod: paymentMethod,
                            products: selectedProducts,
                        },
                    },
                });
            } else {
                window.location.href = paymentUrl;
            }
        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error);
            toast.error(error.message || "Lỗi khi xử lý thanh toán, vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedProducts = state?.selectedProducts || [];

    if (!isLoggedIn) {
        return (
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-lg font-semibold mb-4">
                                Vui lòng đăng nhập để tiếp tục thanh toán!
                            </h3>
                            <p className="mb-4">
                                Bạn cần có tài khoản để mua hàng. Đăng nhập hoặc đăng ký ngay bây giờ.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate("/auth/login")}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate("/auth/register")}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto p-9 pt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Thanh toán</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Vui lòng kiểm tra lại đơn hàng và điền thông tin giao hàng.
            </p>

            <div className="mt-4">
                <h3 className="text-lg font-medium">Sản phẩm trong đơn hàng:</h3>
                <ul className="mt-2 space-y-2">
                    {selectedProducts.map((item) => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>{(item.price * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-2 text-right font-semibold">
                    Tổng cộng: {selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium">Thông tin giao hàng:</h3>
                <div className="mt-2 space-y-4">
                    <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        placeholder="Địa chỉ giao hàng"
                        className="p-2 border rounded w-full"
                        required
                    />
                    <input
                        type="text"
                        name="phoneNumber"
                        value={shippingInfo.phoneNumber}
                        onChange={handleShippingChange}
                        placeholder="Số điện thoại"
                        className="p-2 border rounded w-full"
                        required
                    />
                    <select
                        name="carrier"
                        value={shippingInfo.carrier}
                        onChange={handleShippingChange}
                        className="p-2 border rounded w-full"
                    >
                        <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                        <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                        <option value="VNPOST">Viettel Post</option>
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium">Phương thức thanh toán:</h3>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-2 p-2 border rounded w-full max-w-xs"
                >
                    <option value="COD">Thanh toán khi nhận hàng</option>
                    <option value="VNPAY">Thanh toán VNPay</option>
                    <option value="MOMO">Thanh toán MOMO</option>
                </select>
            </div>

            <button
                onClick={handlePayment}
                disabled={isLoading}
                className={`mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {isLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </button>
            <ToastContainer />
        </div>
    );
};

export default Checkout;