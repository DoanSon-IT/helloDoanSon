import React, { useState } from "react";
import Select from "react-select";

const ProductSorting = ({ setSortCriteria }) => {
    const [sortValue, setSortValue] = useState("");

    const options = [
        { value: "", label: "Mặc định" },
        { value: "newest", label: "Mới nhất" },
        { value: "bestselling", label: "Bán chạy" },
        { value: "priceAsc", label: "Giá tăng dần" },
        { value: "priceDesc", label: "Giá giảm dần" },
    ];

    const handleSort = (selectedOption) => {
        const newSortCriteria = selectedOption ? selectedOption.value : "";
        setSortValue(newSortCriteria);
        setSortCriteria(newSortCriteria);
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
        <div className="flex gap-2.5 items-center">
            <label className="flex items-center gap-2 text-gray-300">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.87 3.8a2.5 2.5 0 0 1-4.74 0H1.25a.75.75 0 1 1 0-1.5H7.1a2.5 2.5 0 0 1 4.8 0h2.85a.75.75 0 0 1 0 1.5h-2.88ZM10.5 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM.5 9.05c0-.41.34-.75.75-.75H4.1a2.5 2.5 0 0 1 4.8 0h5.85a.75.75 0 0 1 0 1.5H8.87a2.5 2.5 0 0 1-4.74 0H1.25a.75.75 0 0 1-.75-.75Zm6 .95a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        fill="currentColor"
                    />
                </svg>
                Sắp xếp theo:
            </label>
            <Select
                options={options}
                value={options.find((option) => option.value === sortValue) || options[0]}
                onChange={handleSort}
                className="sortByDropDown w-36 sm:w-48"
                styles={customStyles}
                isClearable={false}
                placeholder="Chọn cách sắp xếp"
            />
        </div>
    );
};

export default ProductSorting;