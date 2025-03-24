import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import CustomerLayout from "../layouts/CustomerLayout";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

// ✅ Lazy load các trang public
const Home = lazy(() => import("../pages/customer/Home"));
const About = lazy(() => import("../pages/customer/About"));
const ProductPage = lazy(() => import("../pages/customer/ProductPage"));
const ProductDetail = lazy(() => import("../pages/customer/ProductDetail"));
const Contact = lazy(() => import("../pages/customer/Contact"));
const CategoryProducts = lazy(() => import("../pages/customer/CategoryProducts"));
const SearchResults = lazy(() => import("../pages/customer/SearchResults"));
const Cart = lazy(() => import("../pages/customer/Cart"));

// ✅ Lazy load các trang cần đăng nhập
const Checkout = lazy(() => import("../pages/customer/Checkout"));
const Orders = lazy(() => import("../pages/customer/Orders"));
const Profile = lazy(() => import("../pages/customer/Profile"));
const OrderConfirmation = lazy(() => import("../pages/customer/OrderConfirmation"));
const ChatBox = lazy(() => import("../pages/customer/ChatBox"));
const VNPayReturn = lazy(() => import("../pages/customer/VNPayReturn"));

// ✅ Component loading
const Loading = () => (
    <div className="flex justify-center items-center h-screen text-gray-500">
        🛒 Đang tải nội dung khách hàng...
    </div>
);

const CustomerRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CustomerLayout />}>
                {/* Public Routes */}
                <Route
                    index
                    element={
                        <Suspense fallback={<Loading />}>
                            <Home />
                        </Suspense>
                    }
                />
                <Route
                    path="about"
                    element={
                        <Suspense fallback={<Loading />}>
                            <About />
                        </Suspense>
                    }
                />
                <Route
                    path="products"
                    element={
                        <Suspense fallback={<Loading />}>
                            <ProductPage />
                        </Suspense>
                    }
                />
                <Route
                    path="products/:id"
                    element={
                        <Suspense fallback={<Loading />}>
                            <ProductDetail />
                        </Suspense>
                    }
                />
                <Route
                    path="contact"
                    element={
                        <Suspense fallback={<Loading />}>
                            <Contact />
                        </Suspense>
                    }
                />
                <Route
                    path="category/:id"
                    element={
                        <Suspense fallback={<Loading />}>
                            <CategoryProducts />
                        </Suspense>
                    }
                />
                <Route
                    path="search"
                    element={
                        <Suspense fallback={<Loading />}>
                            <SearchResults />
                        </Suspense>
                    }
                />
                <Route
                    path="cart"
                    element={
                        <Suspense fallback={<Loading />}>
                            <Cart />
                        </Suspense>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="checkout"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                                <Checkout />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="orders"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                                <Orders />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="order-confirmation"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                                <OrderConfirmation />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="chat"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                                <ChatBox />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="vnpay-return"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                                <VNPayReturn />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                                <Profile />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />

                {/* Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default CustomerRoutes;
