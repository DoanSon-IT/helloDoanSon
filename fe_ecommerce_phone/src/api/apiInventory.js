import axiosInstance from "./axiosConfig";

const apiInventory = {
    getInventoryByProduct: async (productId) => {
        try {
            const response = await axiosInstance.get(`/inventory/${productId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || "Lỗi khi lấy thông tin tồn kho");
        }
    },

    getInventorySummary: async () => {
        try {
            const response = await axiosInstance.get("/inventory/summary");
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || "Lỗi khi lấy thống kê tồn kho");
        }
    },

    adjustInventory: async (productId, quantityChange, reason) => {
        try {
            const response = await axiosInstance.post(`/inventory/adjust/${productId}`, null, {
                params: { quantityChange, reason }
            });
            return response.data;
        } catch (error) {
            const serverError = error.response?.data?.error || "Lỗi không xác định từ server";
            throw new Error(`Lỗi khi điều chỉnh tồn kho: ${serverError}`);
        }
    },

    getInventoryLogs: async (productId = null, startDate = null, endDate = null, page = 0, size = 10) => {
        try {
            console.log("🔍 Gọi API lấy lịch sử tồn kho với params:", { productId, startDate, endDate, page, size });

            const response = await axiosInstance.get(`/inventory/logs`, {
                params: { productId, startDate, endDate, page, size }
            });

            console.log("✅ API trả về dữ liệu:", response.data);

            return response.data;
        } catch (error) {
            console.error("❌ Lỗi API getInventoryLogs:", error.response?.data || error.message);
            throw new Error(error.response?.data?.error || "Lỗi khi lấy lịch sử tồn kho");
        }
    },

    getInventoryReport: async (searchKeyword = "", status = null, page = 0, size = 10) => {
        try {
            const response = await axiosInstance.get("/inventory/report", {
                params: { searchKeyword, status, page, size }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || "Lỗi khi lấy báo cáo tồn kho");
        }
    },
};

export default apiInventory;