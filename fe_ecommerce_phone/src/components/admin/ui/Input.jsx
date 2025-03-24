import React from "react";

export const Input = ({ id, name, type = "text", value, onChange, placeholder, required = false }) => {
    return (
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    );
};
