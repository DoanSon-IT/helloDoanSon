import axiosInstance from "./axiosConfig";

const apiReport = {
    getRevenue: async (startDate, endDate) =>
        axiosInstance.get("/reports/revenue", { params: { startDate, endDate } }).then((res) => res.data),
    getTopSellingProducts: async (startDate, endDate, limit = 5) =>
        axiosInstance.get("/reports/top-products", { params: { startDate, endDate, limit } }).then((res) => res.data),
    getOrderCountByStatus: async () => axiosInstance.get("/reports/orders-by-status").then((res) => res.data),
    getLowStockProducts: async (threshold = 5) =>
        axiosInstance.get("/reports/low-stock", { params: { threshold } }).then((res) => res.data),
    exportRevenueReport: async (startDate, endDate) => {
        const response = await axiosInstance.get("/reports/export/excel", {
            params: { startDate, endDate },
            responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Revenue_Report_${startDate}_to_${endDate}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};

export default apiReport;