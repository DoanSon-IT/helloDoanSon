import React from "react";

export const Card = ({ children, className = "" }) => {
    return <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>{children}</div>;
};

export const CardHeader = ({ children }) => {
    return <div className="border-b pb-3 mb-3">{children}</div>;
};

export const CardTitle = ({ children, className = "" }) => {
    return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
};

export const CardContent = ({ children }) => {
    return <div>{children}</div>;
};
