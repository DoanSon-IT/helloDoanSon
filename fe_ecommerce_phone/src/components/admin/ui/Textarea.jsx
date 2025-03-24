import React from "react";

export const Textarea = ({ id, name, value, onChange, placeholder, required = false, className = "" }) => {
    return (
        <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
    );
};
