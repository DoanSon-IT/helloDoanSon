import axiosInstance from "./axiosConfig";
import apiInventory from "./apiInventory";

const apiProduct = {
    getAllProducts: async (searchKeyword = "", page = 0, size = 10) => {
        try {
            return await axiosInstance.get("/products", {
                params: { searchKeyword, page, size }
            }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách sản phẩm");
        }
    },

    getNewestProducts: async () =>
        axiosInstance.get("/products/newest").then((res) => res.data),

    getBestSellingProducts: async () =>
        axiosInstance.get("/products/bestselling").then((res) => res.data),

    getProductById: async (id) =>
        axiosInstance.get(`/products/${id}`).then((res) => res.data),

    getFilteredProducts: async (params) =>
        axiosInstance.get("/products/filtered", { params }).then((res) => res.data),

    createProduct: async (productData) => {
        try {
            const response = await axiosInstance.post("/products", productData).then((res) => res.data);
            if (productData.stock !== undefined) {
                await apiInventory.updateInventory(response.id, productData.stock, "Khởi tạo sản phẩm");
            }
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo sản phẩm");
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await axiosInstance.put(`/products/${id}`, productData).then((res) => res.data);
            if (productData.stock !== undefined) {
                await apiInventory.updateInventory(id, productData.stock, "Cập nhật sản phẩm");
            }
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
        }
    },

    deleteProduct: async (id) => {
        try {
            return await axiosInstance.delete(`/products/${id}`).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
        }
    },
};

export default apiProduct;
