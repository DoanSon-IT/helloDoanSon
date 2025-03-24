import axiosInstance from "./axiosConfig";

const apiUser = {
    getAllUsers: async () => {
        try {
            return await axiosInstance.get("/users").then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách người dùng");
        }
    },

    getAllCustomers: async () => {
        try {
            return await axiosInstance.get("/users/customers").then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách khách hàng");
        }
    },

    deleteUser: async (userId) => {
        try {
            await axiosInstance.delete(`/users/${userId}`);
            console.log("✅ Xóa người dùng thành công: userId=", userId);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa người dùng");
        }
    },

    updateLoyaltyPoints: async (customerId, points) => {
        try {
            return await axiosInstance.put(`/users/customers/${customerId}/loyalty-points`, points).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật điểm tích lũy");
        }
    },

    deleteCustomer: async (customerId) => {
        try {
            await axiosInstance.delete(`/users/customers/${customerId}`);
            console.log("✅ Xóa khách hàng thành công: customerId=", customerId);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa khách hàng");
        }
    },

    getCurrentUser: async () => {
        try {
            console.log("Gửi request /users/me");
            const res = await axiosInstance.get("/users/me");
            console.log("Phản hồi /users/me:", res.data);
            return res.data;
        } catch (error) {
            console.error("Lỗi /users/me:", error.response?.status, error.response?.data);
            if (error.response?.status === 401) return null;
            throw new Error(error.response?.data?.message || "Không thể lấy thông tin người dùng");
        }
    },

    updateCurrentUser: async (userData) => {
        try {
            return await axiosInstance.put("/users/me", userData).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Không thể cập nhật thông tin người dùng");
        }
    },
};

export default apiUser;