import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VNPayReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        if (vnpResponseCode === "00") { // Thanh toán thành công
            // Xóa giỏ hàng
            const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
            const selectedIds = JSON.parse(localStorage.getItem("selectedIds") || "[]"); // Giả sử lưu tạm trong Checkout
            const updatedCart = existingCart.filter(
                (cartItem) => !selectedIds.includes(cartItem.id)
            );
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            localStorage.removeItem("selectedIds"); // Xóa tạm

            navigate("/order-confirmation", {
                state: { orderDetails: { orderId: searchParams.get("vnp_TxnRef"), paymentMethod: "VNPAY" } },
            });
        } else {
            alert("Thanh toán thất bại: " + searchParams.get("vnp_ResponseCode"));
            navigate("/cart");
        }
    }, [navigate, searchParams]);

    return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default VNPayReturn;