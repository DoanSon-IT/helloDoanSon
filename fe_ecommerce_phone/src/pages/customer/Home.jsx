import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";
import Slider from "../../components/layout/Slider";
import apiCategory from "../../api/apiCategory";
import useWindowSize from "../../hooks/useWindowSize";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const windowSize = useWindowSize();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cachedCategories = localStorage.getItem("categories");
                if (cachedCategories) {
                    setCategories(JSON.parse(cachedCategories));
                } else {
                    const data = await apiCategory.getAllCategories();
                    const categoriesData = Array.isArray(data) ? data : data?.content || [];
                    setCategories(categoriesData);
                    localStorage.setItem("categories", JSON.stringify(categoriesData));
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const sidebarWidth = () => {
        const baseWidth = windowSize.width / windowSize.pixelRatio;
        if (baseWidth < 640) return "w-20";
        if (baseWidth < 768) return "w-40";
        return "w-48";
    };

    const mainPadding = () => (windowSize.width >= 1024 ? "lg:pl-0" : "");

    return (
        <div className="min-h-screen bg-white text-gray-800 font-mono overflow-x-hidden">
            <div className="flex w-full">
                <aside
                    className={`bg-white border-r border-gray-200 z-[101] flex-shrink-0 ${sidebarWidth()} 
                        ${isSidebarOpen ? "fixed inset-y-[180px] left-0 transform translate-x-0" : "lg:block hidden"}`}
                >
                    <div className="flex justify-between items-center p-4 lg:p-0 lg:mt-4 lg:mb-8 lg:justify-center">
                        <span className="text-2xl md:text-4xl text-gray-800">⚡</span>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-800 text-2xl absolute top-4 right-4"
                        >
                            ×
                        </button>
                    </div>
                    <ul className="space-y-4 text-center p-4 lg:p-0 h-auto">
                        {categories.length > 0 ? (
                            categories.map((category, index) => (
                                <li
                                    key={category.id}
                                    onMouseEnter={() => setHoverIndex(index)}
                                    onMouseLeave={() => setHoverIndex(null)}
                                    className="w-full"
                                >
                                    <Link
                                        to={`/category/${category.id}`}
                                        className={`block p-2 md:p-3 text-sm md:text-base text-gray-800 hover:bg-gray-100 hover:text-blue-600 transition-all duration-300 rounded-md`}
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-xs md:text-sm text-gray-400">Loading...</p>
                        )}
                    </ul>
                    <div className="mt-8 text-gray-500 text-xs text-center">© 2025 Bình Dương Tech</div>
                </aside>

                <div className={`flex-1 w-full ${mainPadding()}`}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden fixed top-[180px] left-4 z-[102] bg-gray-200 text-gray-800 p-2 rounded-full shadow-lg"
                    >
                        ☰
                    </button>

                    <header className="w-full mb-4 relative z-20 pt-4">
                        <Slider />
                        <p className="text-center text-sm md:text-base mt-2 text-gray-600 italic">
                            "Anh Đoàn Sơn có đẳng cấp không? Đẳng cấp!"
                        </p>
                    </header>

                    <section className="w-full mt-4 relative z-10">
                        <div className="relative bg-white shadow-[0_0_20px_#e5e7eb] border border-gray-200 overflow-hidden">
                            <div className="flex items-center justify-center py-12">
                                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-800 z-10">
                                    ⚡ Săn Deal Siêu Chất ⚡
                                </h2>
                            </div>
                            <p className="text-center text-sm md:text-base text-gray-600 z-10 relative mb-4">
                                Giá sốc - Đỉnh cao công nghệ!
                            </p>
                            <div className="text-center pb-4">
                                <Link
                                    to="/promotions"
                                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300"
                                >
                                    Chốt ngay
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="w-full mt-4 z-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mt-4 mb-4 text-center">
                            Sản phẩm đỉnh nhất
                        </h2>
                        <div className="w-full max-w-screen-2xl mx-auto">
                            <ProductGrid category="featured" theme="light" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Home;