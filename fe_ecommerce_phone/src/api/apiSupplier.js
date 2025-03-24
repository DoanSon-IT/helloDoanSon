import axiosInstance from "./axiosConfig";

const apiSupplier = {
    getSuppliers: async () => {
        try {
            return await axiosInstance.get("/suppliers").then((res) => res.data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách nhà cung cấp");
        }
    },

    getSupplierById: async (id) => {
        try {
            return await axiosInstance.get(`/suppliers/${id}`).then((res) => res.data);
        } catch (error) {
            console.error("Error fetching supplier:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi tải thông tin nhà cung cấp");
        }
    },

    searchSuppliers: async (query) => {
        try {
            return await axiosInstance.get("/suppliers/search", { params: query }).then((res) => res.data);
        } catch (error) {
            console.error("Error searching suppliers:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi tìm kiếm nhà cung cấp");
        }
    },

    createSupplier: async (supplier) => {
        try {
            return await axiosInstance.post("/suppliers", supplier).then((res) => res.data);
        } catch (error) {
            console.error("Error creating supplier:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi tạo nhà cung cấp");
        }
    },

    updateSupplier: async (id, supplier) => {
        try {
            return await axiosInstance.put(`/suppliers/${id}`, supplier).then((res) => res.data);
        } catch (error) {
            console.error("Error updating supplier:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật nhà cung cấp");
        }
    },

    deleteSupplier: async (id) => {
        try {
            await axiosInstance.delete(`/suppliers/${id}`);
            console.log("✅ Xóa nhà cung cấp thành công: supplierId=", id);
            return true;
        } catch (error) {
            console.error("Error deleting supplier:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi xóa nhà cung cấp");
        }
    },
};

export default apiSupplier;