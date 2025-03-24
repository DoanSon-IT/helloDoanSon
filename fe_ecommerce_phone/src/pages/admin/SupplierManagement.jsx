import React, { useState, useEffect, useContext } from "react";
import apiSupplier from "../../api/apiSupplier";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Table, Modal, Input, Form, Spin } from "antd";

const SupplierManagement = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!auth?.accessToken) {
            toast.error("Vui lòng đăng nhập để truy cập trang này!");
            navigate("/login");
            return;
        }
        const hasAdminRole = auth?.roles?.includes("ADMIN") || auth?.roles?.includes("ROLE_ADMIN");
        if (!hasAdminRole) {
            toast.error("Bạn không có quyền truy cập trang này!");
            navigate("/");
            return;
        }
        fetchSuppliers();
    }, [auth, navigate]);

    const fetchSuppliers = async () => {
        setTableLoading(true);
        try {
            const data = await apiSupplier.getSuppliers();
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.message || "Không thể tải danh sách nhà cung cấp");
        } finally {
            setTableLoading(false);
        }
    };

    const handleAddOrEdit = async (values) => {
        setIsLoading(true);
        try {
            if (editingSupplier) {
                const updated = await apiSupplier.updateSupplier(editingSupplier.id, values);
                toast.success("Cập nhật nhà cung cấp thành công!");
            } else {
                const created = await apiSupplier.createSupplier(values);
                toast.success("Thêm nhà cung cấp thành công!");
            }
            setIsModalOpen(false);
            form.resetFields();
            fetchSuppliers();
        } catch (error) {
            toast.error(error.message || "Có lỗi xảy ra khi xử lý yêu cầu");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
            setTableLoading(true);
            try {
                await apiSupplier.deleteSupplier(id);
                toast.success("Xóa nhà cung cấp thành công!");
                fetchSuppliers();
            } catch (error) {
                toast.error(error.message || "Có lỗi xảy ra khi xóa nhà cung cấp");
            } finally {
                setTableLoading(false);
            }
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Tên", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
        { title: "Địa chỉ", dataIndex: "address", key: "address" },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button onClick={() => openEditModal(record)}>✏️ Sửa</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>🗑️ Xóa</Button>
                </div>
            ),
        },
    ];

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        form.setFieldsValue(supplier);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingSupplier(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Quản lý Nhà Cung Cấp</h2>
            <Button type="primary" onClick={openAddModal} className="mb-4">
                ➕ Thêm Nhà Cung Cấp
            </Button>

            <Table
                dataSource={suppliers}
                columns={columns}
                rowKey="id"
                loading={tableLoading}
            />

            <Modal
                title={editingSupplier ? "Chỉnh sửa Nhà Cung Cấp" : "Thêm Nhà Cung Cấp"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={isLoading}
                maskClosable={false}
            >
                <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                            { pattern: /^(0|\+84)[3-9][0-9]{8}$/, message: "Số điện thoại phải bắt đầu bằng 0 hoặc +84, đầu số từ 3-9, và có 10 chữ số!" }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default SupplierManagement;