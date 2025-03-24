import axiosInstance from "./axiosConfig";

export const fetchDashboardStats = async (days = 7) => {
    try {
        const response = await axiosInstance.get("/admin/stats", { params: { days } });
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Dashboard Stats:", error);
        return {
            totalRevenue: BigInt(0),
            totalOrders: 0,
            topSellingProductsCount: 0,
            newUsersCount: 0,
            revenueByTime: {},
            ordersByTime: {},
        };
    }
};

export const fetchRecentOrders = async (limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/recent-orders", { params: { limit } });
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Recent Orders:", error);
        return [];
    }
};

export const fetchTopSellingProducts = async (limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/top-products", { params: { limit } });
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Top Products:", error);
        return [];
    }
};

export const fetchRecentUsers = async (limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/recent-users", { params: { limit } });
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Recent Users:", error);
        return [];
    }
};