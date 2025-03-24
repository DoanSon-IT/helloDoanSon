import axiosInstance from "./axiosConfig";

const apiPayment = {
    createPayment: async (orderId, paymentMethod) => {
        try {
            const paymentData = { orderId, paymentMethod };
            return await axiosInstance.post("/payments", paymentData, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán");
        }
    },

    getPayment: async (orderId) => {
        try {
            return await axiosInstance.get(`/payments/${orderId}`, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải thông tin thanh toán");
        }
    },
};

export default apiPayment;
