import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import debounce from "lodash/debounce"; // Cần cài đặt lodash: npm install lodash

const ProductControls = ({ products, setFilterParams, setSortCriteria }) => {
    const [priceRange, setPriceRange] = useState({ minValue: null, maxValue: null });
    const [sortValue, setSortValue] = useState("");

    const sortOptions = [
        { value: "", label: "Mặc định" },
        { value: "newest", label: "Mới nhất" },
        { value: "bestselling", label: "Bán chạy" },
        { value: "priceAsc", label: "Giá tăng dần" },
        { value: "priceDesc", label: "Giá giảm dần" },
    ];

    // Debounce hàm cập nhật filterParams
    const debouncedSetFilterParams = useCallback(
        debounce((newPriceRange) => {
            setFilterParams({ priceRange: newPriceRange });
        }, 500),
        [setFilterParams]
    );

    useEffect(() => {
        debouncedSetFilterParams(priceRange);
    }, [priceRange, debouncedSetFilterParams]);

    const handlePriceFilter = (event) => {
        const { name, value } = event.target;
        setPriceRange((prev) => ({
            ...prev,
            [name]: value === "" ? null : Number(value),
        }));
    };

    const handleSort = (selectedOption) => {
        const newSortCriteria = selectedOption ? selectedOption.value : "";
        setSortValue(newSortCriteria);
        setSortCriteria(newSortCriteria);
    };

    const handleReset = () => {
        setPriceRange({ minValue: null, maxValue: null });
        setSortValue("");
        setSortCriteria("");
    };

    const getMinPrice = () => {
        const prices = products.map((p) => p.discountedPrice || p.sellingPrice || 0);
        return Math.min(...prices.filter((p) => !isNaN(p))) || 0;
    };

    const getMaxPrice = () => {
        const prices = products.map((p) => p.discountedPrice || p.sellingPrice || 0);
        return Math.max(...prices.filter((p) => !isNaN(p))) || 10000000;
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: "#1F2937",
            borderColor: "#4B5563",
            color: "white",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#3B82F6",
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "#1F2937",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#3B82F6" : "#1F2937",
            color: "white",
            "&:hover": {
                backgroundColor: "#374151",
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "white",
        }),
    };

    return (
        <div className="flex items-center justify-between gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700 w-full">
            {/* Price Filter */}
            <div className="flex items-center gap-2 text-gray-300 shrink-0">
                <span>Giá:</span>
                <input
                    type="number"
                    name="minValue"
                    placeholder={`Từ ${getMinPrice()}`}
                    value={priceRange.minValue || ""}
                    onChange={handlePriceFilter}
                    className="w-24 p-2 text-sm bg-gray-700 border border-gray-600 text-white rounded focus:ring-blue-500 focus:border-blue-500"
                />
                <span>-</span>
                <input
                    type="number"
                    name="maxValue"
                    placeholder={`Đến ${getMaxPrice()}`}
                    value={priceRange.maxValue || ""}
                    onChange={handlePriceFilter}
                    className="w-24 p-2 text-sm bg-gray-700 border border-gray-600 text-white rounded focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-gray-300 shrink-0">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.87 3.8a2.5 2.5 0 0 1-4.74 0H1.25a.75.75 0 1 1 0-1.5H7.1a2.5 2.5 0 0 1 4.8 0h2.85a.75.75 0 0 1 0 1.5h-2.88ZM10.5 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM.5 9.05c0-.41.34-.75.75-.75H4.1a2.5 2.5 0 0 1 4.8 0h5.85a.75.75 0 0 1 0 1.5H8.87a2.5 2.5 0 0 1-4.74 0H1.25a.75.75 0 0 1-.75-.75Zm6 .95a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        fill="currentColor"
                    />
                </svg>
                <span>Sắp xếp theo:</span>
                <Select
                    options={sortOptions}
                    value={sortOptions.find((option) => option.value === sortValue) || sortOptions[0]}
                    onChange={handleSort}
                    className="w-36 sm:w-48"
                    styles={customStyles}
                    isClearable={false}
                    placeholder="Chọn cách sắp xếp"
                />
            </div>

            {/* Reset Button */}
            <button
                onClick={handleReset}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors shrink-0"
            >
                Reset
            </button>
        </div>
    );
};

export default ProductControls;