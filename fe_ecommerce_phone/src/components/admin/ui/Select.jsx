import React from "react";

// Component Select chính
export const Select = ({ value, onValueChange, children }) => {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </select>
    );
};

// Component SelectTrigger (hiển thị giá trị đã chọn hoặc placeholder)
export const SelectTrigger = ({ children }) => {
    return <>{children}</>; // Trigger đơn giản là bọc nội dung, không thêm logic vì Select đã xử lý
};

// Component SelectValue (placeholder hoặc giá trị mặc định)
export const SelectValue = ({ placeholder }) => {
    return <option value="">{placeholder}</option>;
};

// Component SelectContent (danh sách các option)
export const SelectContent = ({ children }) => {
    return <>{children}</>;
};

// Component SelectItem (mỗi option trong danh sách)
export const SelectItem = ({ value, children }) => {
    return <option value={value}>{children}</option>;
};