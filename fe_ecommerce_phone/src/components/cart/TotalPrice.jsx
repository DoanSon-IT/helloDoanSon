import React from "react";

function TotalPrice({ cartItems, selectedItems }) {
    const subtotal = cartItems
        .filter((item) => selectedItems.has(item.id))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="mt-4">
            <p className="text-lg font-semibold text-cyan-200">
                Tổng thiệt hại:{" "}
                {subtotal.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                })}
            </p>
            <p className="text-gray-400 text-sm mt-1">
                Thuế và phí vận chuyển được tính khi thanh toán
            </p>
        </div>
    );
}

export default TotalPrice;
