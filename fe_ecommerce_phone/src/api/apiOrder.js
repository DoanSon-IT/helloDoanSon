import axiosInstance from "./axiosConfig";

const apiOrder = {
    getOrders: async () => {
        try {
            console.log("Gửi request tới /orders");
            const res = await axiosInstance.get("/orders", { withCredentials: true });
            console.log("Phản hồi từ /orders:", res.data);
            return res.data;
        } catch (error) {
            console.error("Lỗi từ /orders:", error.response?.status, error.response?.data);
            if (error.response?.status === 401) {
                try {
                    await refreshToken();
                    const retryRes = await axiosInstance.get("/orders", { withCredentials: true });
                    return retryRes.data;
                } catch (refreshError) {
                    throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                }
            }
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách đơn hàng");
        }
    },

    createOrder: async (orderRequest) => {
        try {
            return await axiosInstance.post("/orders", orderRequest, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
        }
    },

    getOrderById: async (orderId) => {
        try {
            return await axiosInstance.get(`/orders/${orderId}`, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải chi tiết đơn hàng");
        }
    },

    updateOrderStatus: async (orderId, newStatus) => {
        try {
            return await axiosInstance.put(`/orders/${orderId}/status`, newStatus, {
                headers: { "Content-Type": "text/plain" },
                withCredentials: true
            }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng");
        }
    },

    deleteOrder: async (orderId) => {
        try {
            await axiosInstance.delete(`/orders/${orderId}`, { withCredentials: true });
            console.log("✅ Xóa đơn hàng thành công: orderId=", orderId);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa đơn hàng");
        }
    },
};

export default apiOrder;
