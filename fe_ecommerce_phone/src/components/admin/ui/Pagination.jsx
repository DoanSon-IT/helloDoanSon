import React from "react";

function Pagination({ page, totalPages, onPageChange }) {
    return (
        <div className="flex justify-between items-center mt-4">
            <button
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
                Trước
            </button>
            <span className="text-gray-700">Trang {page + 1} / {totalPages}</span>
            <button
                disabled={page >= totalPages - 1}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
                Tiếp
            </button>
        </div>
    );
}

export default Pagination;
