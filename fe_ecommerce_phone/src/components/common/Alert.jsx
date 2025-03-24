import React from "react";
import PropTypes from "prop-types";

const Alert = ({ variant = "default", children }) => {
    const variantClasses = {
        default: "bg-gray-100 border-gray-300 text-gray-900",
        success: "bg-green-100 border-green-400 text-green-900",
        warning: "bg-yellow-100 border-yellow-400 text-yellow-900",
        destructive: "bg-red-100 border-red-400 text-red-900",
    };

    return (
        <div className={`p-4 border rounded-lg ${variantClasses[variant]}`}>
            {children}
        </div>
    );
};

Alert.propTypes = {
    variant: PropTypes.oneOf(["default", "success", "warning", "destructive"]),
    children: PropTypes.node.isRequired,
};

export default Alert;

export const AlertDescription = ({ children }) => {
    return <p className="text-sm font-medium">{children}</p>;
};

AlertDescription.propTypes = {
    children: PropTypes.node.isRequired,
};
