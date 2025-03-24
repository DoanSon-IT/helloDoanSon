import React from "react";

function CheckOutButton({ onCheckout, isLoading }) {
    return (
        <button
            onClick={onCheckout}
            disabled={isLoading}
            className={`mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
                }`}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8 8v-8H4z"
                        />
                    </svg>
                    Đang xử lý...
                </span>
            ) : (
                "Thanh toán"
            )}
        </button>
    );
}

export default CheckOutButton;