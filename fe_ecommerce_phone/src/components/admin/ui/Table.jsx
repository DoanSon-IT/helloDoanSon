import React from "react";

export function Table({ children }) {
    return <table className="min-w-full bg-white border border-gray-200 shadow-sm">{children}</table>;
}

export function TableHeader({ children }) {
    return <thead className="bg-gray-100">{children}</thead>;
}

export function TableRow({ children }) {
    return <tr className="border-b">{children}</tr>;
}

export function TableHead({ children }) {
    return <th className="py-2 px-4 text-left font-semibold border-b">{children}</th>;
}

export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function TableCell({ children }) {
    return <td className="py-2 px-4 border-b">{children}</td>;
}

