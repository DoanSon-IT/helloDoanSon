import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import apiProduct from "../../api/apiProduct";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check } from "lucide-react";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const SearchResults = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchQuery = new URLSearchParams(location.search).get("query") || "";

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await apiProduct.getFilteredProducts(searchQuery);
                setProducts(Array.isArray(response.content) ? response.content : response);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
                toast.error("Không thể tải kết quả tìm kiếm!", { autoClose: 2000 });
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
    };

    const handleAddToCart = (product) => {
        toast(
            <div className="flex items-center w-full p-2 bg-gray-900 border-2 border-[#00ffcc] rounded-lg shadow-[0_0_10px_#00ffcc]">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <ShoppingCart className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-white">
                    {`${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`}
                </span>
            </div>,
            {
                autoClose: 1500,
                position: "top-center",
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                className: "toast-custom",
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
    };

    const renderProductCard = (product) => {
        const imageUrl = product.images?.[0]?.imageUrl || "https://via.placeholder.com/200";
        const isDiscounted = product.discountedPrice && product.discountedPrice < product.sellingPrice;
        const discountPercentage = isDiscounted
            ? (((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100).toFixed(0)
            : 0;

        return (
            <li
                key={product.id}
                className="product-item relative bg-gray-800 rounded-lg shadow-md min-h-[450px] w-full border border-gray-700 overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 animate__animated animate__fadeIn"
            >
                {isDiscounted && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discountPercentage}%
                    </span>
                )}
                <a href={`/products/${product.id}`}>
                    <LazyLoadImage
                        effect="blur"
                        src={imageUrl}
                        alt={product.name || "Hình ảnh sản phẩm"}
                        className="w-full h-60 object-cover aspect-square rounded-t-lg bg-gray-700"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                    />
                </a>
                <div className="p-4 flex flex-col justify-between flex-grow">
                    <div className="flex flex-col flex-grow">
                        <a
                            href={`/products/${product.id}`}
                            className="text-base font-semibold text-white hover:text-blue-300 truncate"
                        >
                            {product.name || "Tên sản phẩm không có"}
                        </a>
                        <div className="text-sm text-gray-300 line-clamp-2">
                            {product.description || "Mô tả không có"}
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between">
                            {isDiscounted ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-emerald-300">
                                        {formatPrice(product.discountedPrice)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.sellingPrice)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-base font-bold text-emerald-300">
                                    {formatPrice(product.sellingPrice || 0)}
                                </span>
                            )}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4 inline-block mr-1" />
                                Giỏ hàng
                            </button>
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        );
    };

    if (loading) return <div className="text-white text-center">Đang tải...</div>;

    return (
        <div className="p-4 sm:p-6 bg-black text-white font-lato min-h-screen">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Kết quả tìm kiếm cho: "{searchQuery}"
            </h1>
            {products.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {products.map((product) => renderProductCard(product))}
                </ul>
            ) : (
                <p className="text-center text-gray-400">Không tìm thấy sản phẩm nào.</p>
            )}
            <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="dark"
                className="toast-container-custom"
            />
        </div>
    );
};

export default SearchResults;