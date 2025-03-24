import axiosInstance from "./axiosConfig";

const apiCategory = {
    getAllCategories: async () => axiosInstance.get("/categories", { withCredentials: true }).then((res) => res.data),
    getProductsByCategoryId: async (id) => axiosInstance.get(`/categories/${id}/products`, { withCredentials: true }).then((res) => res.data),
    createCategory: async (name) => axiosInstance.post("/admin/categories", null, {
        params: { name },
        withCredentials: true
    }).then((res) => res.data),
    updateCategory: async (id, name) => axiosInstance.put(`/admin/categories/${id}`, null, {
        params: { name },
        withCredentials: true
    }).then((res) => res.data),
    deleteCategory: async (id) => axiosInstance.delete(`/admin/categories/${id}`, { withCredentials: true }).then((res) => res.data),
};

export default apiCategory;
