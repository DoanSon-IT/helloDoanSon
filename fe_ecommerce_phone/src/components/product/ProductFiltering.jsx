import React, { useState, useEffect } from "react";

const ProductFiltering = ({ products, setFilterParams }) => {
    const [priceRange, setPriceRange] = useState({ minValue: null, maxValue: null });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setFilterParams({
            priceRange,
        });
    }, [priceRange, setFilterParams]);

    const handlePriceFilter = (event) => {
        const { name, value } = event.target;
        setPriceRange((prev) => ({
            ...prev,
            [name]: value === "" ? null : Number(value),
        }));
    };

    const getMinPrice = () => {
        const prices = products.map((p) => p.discountedPrice || p.sellingPrice || 0);
        return Math.min(...prices.filter((p) => !isNaN(p))) || 0;
    };

    const getMaxPrice = () => {
        const prices = products.map((p) => p.discountedPrice || p.sellingPrice || 0);
        return Math.max(...prices.filter((p) => !isNaN(p))) || 10000000;
    };

    return (
        <div className="sticky top-36 z-10">
            <div className="flex justify-between">
                <h2 className="text-2xl lg:text-4xl font-light mb-6 text-white">Lọc sản phẩm</h2>
                <div className="block lg:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center px-3 py-2 rounded text-gray-400 hover:text-white"
                    >
                        <svg
                            className={`w-5 h-5 ${isOpen ? "hidden" : "block"}`}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 8"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
                            />
                        </svg>
                        <svg
                            className={`w-5 h-5 ${isOpen ? "block" : "hidden"}`}
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill="currentColor"
                                d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <div className={`lg:flex lg:flex-col ${isOpen ? "block" : "hidden"}`}>
                <div className="border-t border-gray-600 p-3 pt-5 pb-5">
                    <span className="text-gray-300">Giá:</span>
                    <div className="mt-4 grid gap-4 grid-cols-2">
                        <div>
                            <span className="block text-sm mb-2 text-gray-400">Từ</span>
                            <input
                                type="number"
                                name="minValue"
                                placeholder={getMinPrice()}
                                onChange={handlePriceFilter}
                                className="w-full p-2 text-sm bg-gray-700 border border-gray-600 text-white rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <span className="block text-sm mb-2 text-gray-400">Đến</span>
                            <input
                                type="number"
                                name="maxValue"
                                placeholder={getMaxPrice()}
                                onChange={handlePriceFilter}
                                className="w-full p-2 text-sm bg-gray-700 border border-gray-600 text-white rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFiltering;