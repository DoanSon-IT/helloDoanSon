import React, { useState, useEffect, useCallback } from "react";
import apiInventory from "../../api/apiInventory";
import apiProduct from "../../api/apiProduct";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/admin/ui/select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash/debounce";

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [quantityChange, setQuantityChange] = useState("");
    const [reason, setReason] = useState("");
    const [inventoryData, setInventoryData] = useState([]);
    const [logs, setLogs] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [viewReport, setViewReport] = useState(false);
    const [inventorySummary, setInventorySummary] = useState(null);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        setStartDate(sevenDaysAgo);
        setEndDate(today);
        fetchProducts();
        fetchInventoryReport();
        fetchInventorySummary();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await apiProduct.getAllProducts("", 0, 200);
            setProducts(data.content || []);
        } catch (error) {
            toast.error("Lỗi khi lấy danh sách sản phẩm!");
        }
    };

    const fetchInventoryReport = async () => {
        try {
            const data = await apiInventory.getInventoryReport(searchKeyword, null, 0, 20);
            setInventoryData(data.content || []);
        } catch (error) {
            toast.error("Lỗi khi lấy báo cáo tồn kho!");
        }
    };

    const formatToISODateTime = (dateStr, endOfDay = false) => {
        if (!dateStr) return null;
        return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
    };

    const fetchInventoryLogs = async (productId = null) => {
        if (!startDate || !endDate) {
            toast.error("Vui lòng chọn ngày hợp lệ!");
            return;
        }

        const formattedStartDate = formatToISODateTime(startDate);
        const formattedEndDate = formatToISODateTime(endDate, true); // Lấy hết ngày

        try {
            const data = await apiInventory.getInventoryLogs(productId, formattedStartDate, formattedEndDate, 0, 10);
            setLogs(data.content || []);
        } catch (error) {
            console.error("API Error:", error);
            toast.error(error.message || "Lỗi khi lấy lịch sử tồn kho!");
        }
    };

    const fetchInventorySummary = async () => {
        try {
            const summary = await apiInventory.getInventorySummary();
            setInventorySummary(summary);
        } catch (error) {
            toast.error("Lỗi khi lấy thống kê tồn kho!");
        }
    };

    const handleSearchChange = useCallback(
        debounce((keyword) => {
            setSearchKeyword(keyword);
            if (keyword) {
                setFilteredProducts(
                    products.filter((p) => p.name.toLowerCase().includes(keyword.toLowerCase()))
                );
            } else {
                setFilteredProducts([]);
            }
        }, 300),
        [products]
    );

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearchKeyword(product.name); // ✅ Chỉ gán giá trị một lần
        setFilteredProducts([]); // ✅ Xóa danh sách gợi ý ngay lập tức
        fetchInventoryLogs(product.id);
    };

    const handleAdjustInventory = async () => {
        if (!selectedProduct || !quantityChange || !reason) {
            toast.error("Vui lòng chọn sản phẩm, nhập số lượng và lý do!");
            return;
        }

        const quantityChangeInt = parseInt(quantityChange);
        if (isNaN(quantityChangeInt)) {
            toast.error("Số lượng thay đổi phải là số nguyên!");
            return;
        }

        try {
            const oldQuantity = inventoryData.find((item) => item.productId === selectedProduct.id)?.quantity || 0;
            const newQuantity = oldQuantity + quantityChangeInt;

            await apiInventory.adjustInventory(selectedProduct.id, quantityChangeInt, reason);

            toast.success(`Cập nhật thành công! ${oldQuantity} ➝ ${newQuantity}`);

            let counter = oldQuantity;
            const step = quantityChangeInt > 0 ? 1 : -1;
            const interval = setInterval(() => {
                counter += step;
                setInventoryData((prevData) =>
                    prevData.map((item) =>
                        item.productId === selectedProduct.id ? { ...item, quantity: counter } : item
                    )
                );
                if ((step > 0 && counter >= newQuantity) || (step < 0 && counter <= newQuantity)) {
                    clearInterval(interval);
                }
            }, 50); // Hiệu ứng thay đổi số lượng

            setQuantityChange("");
            setReason("");
            setSearchKeyword("");
            setSelectedProduct(null);
            setFilteredProducts([]);
            fetchInventoryReport();
            fetchInventoryLogs(selectedProduct.id);
        } catch (error) {
            toast.error(error.message || "Lỗi khi điều chỉnh tồn kho!");
        }
    };

    const handleFilterReport = () => {
        fetchInventoryLogs(selectedProduct ? selectedProduct.id : null);
    };

    const resetFilters = () => {
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        setStartDate(sevenDaysAgo);
        setEndDate(today);
        if (selectedProduct) fetchInventoryLogs(selectedProduct.id);
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg">
            <h1 className="text-3xl font-bold mb-6">Quản lý Tồn kho</h1>

            {inventorySummary && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-100 p-4 rounded">
                        <p className="text-lg font-semibold">Tổng sản phẩm</p>
                        <p className="text-2xl">{inventorySummary.totalProducts}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded">
                        <p className="text-lg font-semibold">Còn hàng</p>
                        <p className="text-2xl">{inventorySummary.inStock}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded">
                        <p className="text-lg font-semibold">Sắp hết hàng</p>
                        <p className="text-2xl">{inventorySummary.lowStock}</p>
                    </div>
                    <div className="bg-red-100 p-4 rounded">
                        <p className="text-lg font-semibold">Hết hàng</p>
                        <p className="text-2xl">{inventorySummary.outOfStock}</p>
                    </div>
                </div>
            )}

            <Button className="mb-4" onClick={() => setViewReport(!viewReport)}>
                {viewReport ? "Quay lại cập nhật tồn kho" : "Xem báo cáo tồn kho"}
            </Button>

            {!viewReport ? (
                <>
                    <h2 className="text-2xl font-semibold mt-6 mb-4">Cập nhật tồn kho</h2>
                    <div className="mb-4 relative">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchKeyword}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        {searchKeyword && (
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() => {
                                    setSearchKeyword("");
                                    setSelectedProduct(null);
                                    setFilteredProducts([]);
                                }}
                            >
                                ✕
                            </button>
                        )}
                        {filteredProducts.length > 0 && (
                            <ul className="absolute bg-white border rounded mt-1 max-h-40 w-full overflow-y-auto z-10">
                                {filteredProducts.map((product) => (
                                    <li
                                        key={product.id}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        {product.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {selectedProduct && (
                            <div className="mt-2 inline-flex items-center bg-gray-100 px-2 py-1 rounded">
                                {selectedProduct.name}
                                <button
                                    className="ml-2 text-red-500"
                                    onClick={() => setSelectedProduct(null)}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="mb-4 flex flex-col md:flex-row gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setQuantityChange((prev) => Math.max(parseInt(prev || 0) - 1, -999))}
                            >
                                -
                            </Button>
                            <Input
                                type="number"
                                placeholder="Nhập số lượng (+ để nhập, - để giảm)"
                                value={quantityChange}
                                onChange={(e) => setQuantityChange(e.target.value)}
                                className="w-32"
                            />
                            <Button
                                variant="outline"
                                onClick={() => setQuantityChange((prev) => Math.min(parseInt(prev || 0) + 1, 999))}
                            >
                                +
                            </Button>
                        </div>
                        <Select onValueChange={setReason} value={reason}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Chọn lý do" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Nhập hàng">Nhập hàng</SelectItem>
                                <SelectItem value="Bán hàng">Bán hàng</SelectItem>
                                <SelectItem value="Trả hàng khách">Trả hàng khách</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAdjustInventory}>Điều chỉnh tồn kho</Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">ID</th>
                                    <th className="p-2 text-left">Tên sản phẩm</th>
                                    <th className="p-2 text-left">Số lượng</th>
                                    <th className="p-2 text-left">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.map((item) => (
                                    <tr key={item.productId} className="border-b">
                                        <td className="p-2">{item.productId}</td>
                                        <td className="p-2">{item.productName || "Không xác định"}</td>
                                        <td
                                            className={`p-2 ${item.quantity === 0
                                                ? "text-red-500 font-bold"
                                                : item.quantity < item.minQuantity
                                                    ? "text-yellow-500 font-bold"
                                                    : "text-green-500"
                                                }`}
                                        >
                                            {item.quantity}
                                        </td>
                                        <td className="p-2">
                                            {item.quantity === 0
                                                ? "Hết hàng"
                                                : item.quantity < item.minQuantity
                                                    ? "Sắp hết"
                                                    : "Còn hàng"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-semibold mt-6 mb-4">Báo cáo tồn kho</h2>
                    <div className="mb-4 relative">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm để xem báo cáo..."
                            value={searchKeyword}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        {searchKeyword && (
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() => {
                                    setSearchKeyword("");
                                    setSelectedProduct(null);
                                    setFilteredProducts([]);
                                }}
                            >
                                ✕
                            </button>
                        )}
                        {filteredProducts.length > 0 && (
                            <ul className="absolute bg-white border rounded mt-1 max-h-40 w-full overflow-y-auto z-10">
                                {filteredProducts.map((product) => (
                                    <li
                                        key={product.id}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        {product.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mb-4 flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-500 mb-1">Từ ngày (yyyy-mm-dd)</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-500 mb-1">Đến ngày (yyyy-mm-dd)</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={new Date().toISOString().slice(0, 10)}
                            />
                        </div>
                        <Button onClick={handleFilterReport}>Lọc báo cáo</Button>
                        <Button variant="outline" onClick={resetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">ID</th>
                                    <th className="p-2 text-left">Tên sản phẩm</th>
                                    <th className="p-2 text-left">Số lượng cũ</th>
                                    <th className="p-2 text-left">Số lượng thay đổi</th>
                                    <th className="p-2 text-left">Số lượng mới</th>
                                    <th className="p-2 text-left">Lý do</th>
                                    <th className="p-2 text-left">Thời gian cập nhật</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map((log) => {
                                        const productId = log.product?.id || log.productId || "Không có ID";
                                        const productName = log.product?.name || log.productName || "Không xác định";
                                        const quantityChange = log.newQuantity - log.oldQuantity;

                                        return (
                                            <tr key={log.id} className="border-b">
                                                <td className="p-2">{productId}</td>
                                                <td className="p-2">{productName}</td>
                                                <td className="p-2">{log.oldQuantity}</td>
                                                <td className={`p-2 ${quantityChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                    {quantityChange > 0 ? `+${quantityChange}` : quantityChange}
                                                </td>
                                                <td className="p-2">{log.newQuantity}</td>
                                                <td className="p-2">{log.reason}</td>
                                                <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr key="no-data">
                                        <td colSpan={7} className="p-2 text-center">
                                            Không có dữ liệu lịch sử tồn kho.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default InventoryManagement;