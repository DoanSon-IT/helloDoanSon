import React, { useEffect, useState } from "react";
import apiCategory from "../../api/apiCategory";
import { Button, Input } from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("accessToken"));

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const data = await apiCategory.getAllCategories();
        setCategories(data);
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        const response = await apiCategory.createCategory(newCategory, token);
        alert(response);
        fetchCategories();
        setNewCategory("");
    };

    const handleUpdateCategory = async (id) => {
        if (!editingCategory.name.trim()) return;
        const response = await apiCategory.updateCategory(id, editingCategory.name, token);
        alert(response);
        fetchCategories();
        setEditingCategory(null);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            const response = await apiCategory.deleteCategory(id, token);
            alert(response);
            fetchCategories();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-6 bg-white shadow-md rounded-3xl border border-gray-200 max-w-4xl mx-auto mt-8"
        >
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6"
            >
                Quản lý danh mục
            </motion.h2>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-6"
            >
                <Link to="/admin" className="text-indigo-500 hover:text-pink-500 transition-colors duration-300 font-medium">
                    ⬅ Quay lại
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex gap-4 mb-6 items-center"
            >
                <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Tên danh mục mới"
                    className="w-full px-4 py-2 bg-gray-50 text-gray-900 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 placeholder-gray-400"
                />
                <motion.div whileHover={{ scale: 1.1, rotate: 2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 500 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddCategory}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300"
                    >
                        Thêm
                    </Button>
                </motion.div>
            </motion.div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-gray-900">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-left">
                            <th className="p-4 font-semibold border-b border-gray-200">ID</th>
                            <th className="p-4 font-semibold border-b border-gray-200">Tên danh mục</th>
                            <th className="p-4 font-semibold border-b border-gray-200">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <motion.tr
                                key={category.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.7)" }}
                                className="border-b border-gray-200 transition-colors duration-200"
                            >
                                <td className="p-4">{category.id}</td>
                                <td className="p-4">
                                    {editingCategory?.id === category.id ? (
                                        <Input
                                            type="text"
                                            value={editingCategory.name}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                            className="w-full px-3 py-1 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300"
                                        />
                                    ) : (
                                        <span className="text-gray-800">{category.name}</span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-2">
                                    {editingCategory?.id === category.id ? (
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 500 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleUpdateCategory(category.id)}
                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-1 px-4 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-300"
                                            >
                                                Lưu
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 500 }}>
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                onClick={() => setEditingCategory(category)}
                                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-1 px-4 rounded-lg shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-300"
                                            >
                                                Sửa
                                            </Button>
                                        </motion.div>
                                    )}
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 500 }}>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-1 px-4 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-300"
                                        >
                                            Xóa
                                        </Button>
                                    </motion.div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default CategoryManagement;