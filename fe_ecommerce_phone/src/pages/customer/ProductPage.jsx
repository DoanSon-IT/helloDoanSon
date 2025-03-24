import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import StarRatings from "../../components/product/StarRatings";
import { ShoppingCart, Check, CreditCard } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "animate.css/animate.min.css";
import "react-toastify/dist/ReactToastify.css";
import apiProduct from "../../api/apiProduct";
import AppContext from "../../context/AppContext";
import "../../assets/toast-custom.css";

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
};

function ProductPage() {
    const { setCartCounter } = useContext(AppContext);
    const [product, setProduct] = useState(null);
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProductData();
    }, [id]);

    const fetchProductData = async () => {
        setIsLoading(true);
        try {
            const response = await apiProduct.getProductById(id);
            setProduct(response);
        } catch (error) {
            console.error("Lỗi khi tải thông tin sản phẩm:", error);
            setProduct(null);
            toast.error("Không thể tải sản phẩm, vui lòng thử lại!", { autoClose: 2000 });
        }
        setIsLoading(false);
    };

    const handleAddToCart = () => {
        toast(
            <div className="flex items-center w-full p-4 bg-gray-900 border-2 border-[#00ffcc] rounded-lg shadow-[0_0_15px_#00ffcc]">
                <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                    <span className="text-white font-medium">
                        {`${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`}
                    </span>
                </div>
            </div>,
            {
                autoClose: 2000,
                position: "top-center",
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                className: "toast-custom",
                bodyClassName: "toast-body-custom",
            }
        );

        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = existingCart.find((item) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            existingCart.push({
                id: product.id,
                quantity: 1,
                name: product.name || "Sản phẩm không tên",
                price: product.sellingPrice || 0,
            });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        const totalItems = existingCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCounter(totalItems);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    if (isLoading) {
        return <p className="text-center mt-10 text-gray-400 animate__animated animate__flash">Đang tải sản phẩm...</p>;
    }

    if (!product) {
        return <p className="text-center mt-10 text-red-400">Không tìm thấy sản phẩm!</p>;
    }

    const isDiscounted = product.discountedPrice && product.discountedPrice < product.sellingPrice;
    const discountPercentage = isDiscounted
        ? (((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100).toFixed(0)
        : 0;

    return (
        <div className="max-w-screen-2xl mx-auto p-6 bg-white text-gray-800 font-lato animate__animated animate__fadeIn">
            <div className="flex flex-col lg:flex-row w-full gap-x-24 justify-center">
                <div className="flex justify-center mb-6 lg:mb-0 relative">
                    <LazyLoadImage
                        effect="blur"
                        src={product.images?.[0]?.imageUrl || "https://via.placeholder.com/400"}
                        alt={product.name || "Hình ảnh sản phẩm"}
                        className="object-cover rounded-xl shadow-lg"
                        width={400}
                        height={400}
                    />
                    {isDiscounted && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Giảm {discountPercentage}%
                        </span>
                    )}
                </div>
                <div className="flex flex-col w-full lg:max-w-lg">
                    <h1 className="text-3xl mb-2 font-bold text-gray-800 animate__animated animate__bounceIn">
                        {product.name || "Tên sản phẩm không có"}
                    </h1>
                    <div className="flex items-center mb-3">
                        <StarRatings rating={product.rating || 0} className="flex mr-2" />
                        <span className="text-sm text-gray-600">({product.ratingCount || 0} đánh giá)</span>
                    </div>
                    <div className="pt-3 pb-3 border-b border-gray-100 mb-4">
                        {isDiscounted ? (
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-blue-600">{formatPrice(product.discountedPrice)}</span>
                                <span className="text-sm text-gray-500 line-through">{formatPrice(product.sellingPrice)}</span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-blue-600">{formatPrice(product.sellingPrice)}</span>
                        )}
                    </div>
                    <p className="text-base text-gray-600 mb-6">{product.description || "Mô tả không có"}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center bg-white border border-blue-600 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" /> Giỏ hàng
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 flex items-center justify-center bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <CreditCard className="w-4 h-4 mr-2" /> Mua ngay
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="light"
                className="toast-container-custom"
            />
        </div>
    );
}

export default ProductPage;