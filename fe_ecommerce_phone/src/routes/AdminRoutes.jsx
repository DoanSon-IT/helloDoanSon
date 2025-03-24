import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import NotFoundPage from "../pages/NotFoundPage";

// ✅ Lazy load các trang admin
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ProductManagement = lazy(() => import("../pages/admin/ProductManagement"));
const OrderManagement = lazy(() => import("../pages/admin/OrderManagement"));
const UserCustomerManagement = lazy(() => import("../pages/admin/UserCustomerManagement"));
const CategoryManagement = lazy(() => import("../pages/admin/CategoryManagement"));
const SupplierManagement = lazy(() => import("../pages/admin/SupplierManagement"));
const EmployeeManagement = lazy(() => import("../pages/admin/EmployeeManagement"));
const ReportManagement = lazy(() => import("../pages/admin/ReportManagement"));
const InventoryManagement = lazy(() => import("../pages/admin/InventoryManagement"));
const AdminChat = lazy(() => import("../pages/admin/AdminChat"));

// ✅ Component loading khi chờ lazy load
const Loading = () => (
    <div className="flex justify-center items-center h-screen text-gray-600">
        ⏳ Đang tải trang quản trị...
    </div>
);

const AdminRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute roles={["ADMIN"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route
                    index
                    element={<Navigate to="dashboard" replace />}
                />

                {/* ✅ Các route được lazy load */}
                <Route
                    path="dashboard"
                    element={
                        <Suspense fallback={<Loading />}>
                            <Dashboard />
                        </Suspense>
                    }
                />
                <Route
                    path="products"
                    element={
                        <Suspense fallback={<Loading />}>
                            <ProductManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="orders"
                    element={
                        <Suspense fallback={<Loading />}>
                            <OrderManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="customers"
                    element={
                        <Suspense fallback={<Loading />}>
                            <UserCustomerManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="categories"
                    element={
                        <Suspense fallback={<Loading />}>
                            <CategoryManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="suppliers"
                    element={
                        <Suspense fallback={<Loading />}>
                            <SupplierManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="employees"
                    element={
                        <Suspense fallback={<Loading />}>
                            <EmployeeManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="report"
                    element={
                        <Suspense fallback={<Loading />}>
                            <ReportManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="inventory"
                    element={
                        <Suspense fallback={<Loading />}>
                            <InventoryManagement />
                        </Suspense>
                    }
                />
                <Route
                    path="chat"
                    element={
                        <Suspense fallback={<Loading />}>
                            <AdminChat />
                        </Suspense>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
