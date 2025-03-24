import React, { useState, useEffect, useContext } from "react";
import apiUser from "../../api/apiUser"; // Sửa import để dùng object
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserCustomerManagement = () => {
    const { auth } = useContext(AppContext); // Sửa từ không có context thành dùng auth
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        console.log("Auth state:", auth); // Debug auth
        if (!auth?.accessToken) {
            console.log("No access token, redirecting to login");
            navigate("/login");
        } else if (activeTab === "users") {
            fetchUsers();
        } else {
            fetchCustomers();
        }
    }, [activeTab, auth, navigate]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiUser.getAllUsers();
            console.log("Users from API:", data);
            console.log("Verified values:", data.map(user => user.verified));
            setUsers(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await apiUser.getAllCustomers();
            setCustomers(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
            try {
                await apiUser.deleteUser(userId);
                setUsers(users.filter((user) => user.id !== userId));
                toast.success("Xóa tài khoản thành công!");
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            }
        }
    };

    const handleUpdateLoyaltyPoints = async (customerId, points) => {
        try {
            const response = await apiUser.updateLoyaltyPoints(customerId, points);
            setCustomers(customers.map((customer) => (customer.id === customerId ? response : customer)));
            toast.success("Cập nhật điểm tích lũy thành công!");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
            try {
                await apiUser.deleteCustomer(customerId);
                setCustomers(customers.filter((customer) => customer.id !== customerId));
                toast.success("Xóa khách hàng thành công!");
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            }
        }
    };

    const formatRoles = (roles) => {
        if (!roles || roles.length === 0) return "Không có vai trò";
        return Array.from(roles)
            .map((role) => {
                switch (role) {
                    case "ROLE_CUSTOMER": return "Khách hàng";
                    case "ROLE_STAFF": return "Nhân viên";
                    case "ROLE_ADMIN": return "Quản trị viên";
                    default: return role;
                }
            })
            .join(", ");
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Quản lý tài khoản và khách hàng</h2>

            <div className="mb-4">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 mr-2 rounded ${activeTab === "users" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Quản lý tài khoản
                </button>
                <button
                    onClick={() => setActiveTab("customers")}
                    className={`px-4 py-2 rounded ${activeTab === "customers" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Quản lý khách hàng
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {activeTab === "users" ? (
                        <table className="min-w-full bg-white border rounded-lg shadow-md">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">Tên</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Số điện thoại</th>
                                    <th className="p-3 text-left">Địa chỉ</th>
                                    <th className="p-3 text-left">Ngày tạo</th>
                                    <th className="p-3 text-left">Vai trò</th>
                                    <th className="p-3 text-left">Xác thực</th>
                                    <th className="p-3 text-left">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{user.id}</td>
                                        <td className="p-3">{user.fullName || "N/A"}</td>
                                        <td className="p-3">{user.email || "N/A"}</td>
                                        <td className="p-3">{user.phone || "Chưa có"}</td>
                                        <td className="p-3">{user.address || "Chưa có"}</td>
                                        <td className="p-3">{new Date(user.createdAt).toLocaleString()}</td>
                                        <td className="p-3">{formatRoles(user.roles)}</td>
                                        <td className="p-3">{user.verified ? "Đã xác thực" : "Chưa xác thực"}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full bg-white border rounded-lg shadow-md">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">Tên</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-left">Điểm tích lũy</th>
                                    <th className="p-3 text-left">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{customer.id}</td>
                                        <td className="p-3">{customer.user?.fullName || "N/A"}</td>
                                        <td className="p-3">{customer.user?.email || "N/A"}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={customer.loyaltyPoints || 0}
                                                onChange={(e) => handleUpdateLoyaltyPoints(customer.id, parseInt(e.target.value))}
                                                className="p-1 border rounded w-20"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default UserCustomerManagement;