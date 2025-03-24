import React, { useState, useEffect, useContext, useCallback } from "react";
import apiProduct from "../../api/apiProduct";
import apiCategory from "../../api/apiCategory";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/admin/ui/select";
import { Button } from "@/components/admin/ui/button";
import AppContext from "../../context/AppContext";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

function ProductManagement() {
    const { auth, authLoading } = useContext(AppContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        searchKeyword: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDiscountAllForm, setShowDiscountAllForm] = useState(false);
    const [showDiscountSelectedForm, setShowDiscountSelectedForm] = useState(false);
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
        discountedPrice: "",
        discountStartDate: null,
        discountEndDate: null,
        stock: "",
        soldQuantity: 0,
        isFeatured: false,
        categoryId: "",
        supplierId: "",
        images: [],
    });
    const [discountAllData, setDiscountAllData] = useState({
        percentage: "",
        startDateTime: null,
        endDateTime: null,
    });
    const [discountSelectedData, setDiscountSelectedData] = useState({
        selectedProductIds: [],
        percentage: "",
        startDateTime: null,
        endDateTime: null,
    });
    const [imagePreviews, setImagePreviews] = useState([]);

    if (authLoading) {
        return <div className="text-center mt-10 text-gray-500">🔐 Đang xác thực quyền truy cập...</div>;
    }

    // ✅ Nếu không có quyền, hiển thị thông báo
    if (!auth?.roles?.includes("ADMIN")) {
        return (
            <div className="text-center mt-10 text-red-500 font-semibold">
                🚫 Bạn không có quyền truy cập trang này.
            </div>
        );
    }

    useEffect(() => {
        if (!auth?.accessToken) {
            navigate("/login");
        } else if (!auth?.roles?.includes("ADMIN")) {
            toast.error("Bạn không có quyền truy cập trang này!");
            navigate("/");
        } else {
            fetchCategories();
            fetchSuppliers();
            debouncedFetchProducts();
        }
    }, [auth, page, navigate]);

    const debouncedFetchProducts = useCallback(
        debounce(() => fetchProducts(), 500),
        [filters, page]
    );

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await apiProduct.getFilteredProducts(
                filters.searchKeyword,
                filters.minPrice === "" ? null : Number(filters.minPrice),
                filters.maxPrice === "" ? null : Number(filters.maxPrice),
                filters.sortBy,
                page,
                ITEMS_PER_PAGE
            );
            console.log("Response:", response);
            setProducts(response.content || []);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            toast.error(error.message || "Không thể tải danh sách sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiCategory.getAllCategories();
            setCategories(response || []);
        } catch (error) {
            toast.error(error.message || "Không thể tải danh mục sản phẩm");
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await apiProduct.getAllSuppliers();
            setSuppliers(response || []);
        } catch (error) {
            toast.error(error.message || "Không thể tải danh sách nhà cung cấp");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        try {
            await apiProduct.deleteProduct(id);
            toast.success("Sản phẩm đã được xóa!");
            fetchProducts();
        } catch (error) {
            toast.error(error.message || "Lỗi khi xóa sản phẩm!");
        }
    };

    const handleEditProduct = (product) => {
        console.log("Product data:", product); // Debug
        setEditingProduct(product.id);
        setProductData({
            name: product.name || "",
            description: product.description || "",
            costPrice: product.costPrice !== null ? String(product.costPrice) : "",
            sellingPrice: product.sellingPrice !== null ? String(product.sellingPrice) : "",
            discountedPrice: product.discountedPrice !== null ? String(product.discountedPrice) : "",
            discountStartDate: product.discountStartDate ? new Date(product.discountStartDate) : null,
            discountEndDate: product.discountEndDate ? new Date(product.discountEndDate) : null,
            stock: product.stock !== null ? String(product.stock) : "",
            soldQuantity: product.soldQuantity || 0,
            isFeatured: product.isFeatured ?? false,
            categoryId: product.category && product.category.id ? String(product.category.id) : "",
            supplierId: product.supplier && product.supplier.id ? String(product.supplier.id) : "",
            images: Array.isArray(product.images) ? product.images : [],
        });
        setImagePreviews(Array.isArray(product.images) ? product.images.map((img) => img.imageUrl || "") : []);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: value === "" && ["costPrice", "sellingPrice", "discountedPrice", "stock"].includes(name) ? "" : value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setProductData((prev) => ({ ...prev, images: files }));
        setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const handleRemoveImage = (index) => {
        setProductData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
        setPage(0);
        debouncedFetchProducts();
    };

    const formatDateTimeForBackend = (date) => {
        if (!date) return null;

        const d = new Date(date);
        const pad = (n) => String(n).padStart(2, "0");

        // Lấy các thành phần ngày tháng
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());

        // Định dạng theo ISO-8601 mà không có múi giờ
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (productData.costPrice === "" || productData.sellingPrice === "" || productData.stock === "") {
            toast.error("Vui lòng nhập đầy đủ giá và tồn kho!");
            return;
        }
        if (Number(productData.costPrice) <= 0 || Number(productData.sellingPrice) <= 0 || Number(productData.stock) < 0) {
            toast.error("Giá và tồn kho phải lớn hơn hoặc bằng 0!");
            return;
        }
        if (!productData.categoryId || !productData.supplierId) {
            toast.error("Vui lòng chọn danh mục và nhà cung cấp!");
            return;
        }
        if (!productData.stock || Number(productData.stock) < 0) {
            toast.error("Tồn kho phải là số dương!");
            return;
        }
        setIsLoading(true);

        try {
            let imageUrls = [];
            if (productData.images.length > 0 && productData.images[0] instanceof File) {
                for (let file of productData.images) {
                    const imageUrl = await apiProduct.uploadImageToCloudinary(file);
                    if (imageUrl) imageUrls.push({ imageUrl });
                }
            } else if (editingProduct) {
                const originalProduct = products.find((p) => p.id === editingProduct);
                imageUrls = originalProduct.images || [];
            }

            const productPayload = {
                name: productData.name,
                description: productData.description,
                costPrice: Number(productData.costPrice),
                sellingPrice: Number(productData.sellingPrice),
                discountedPrice: productData.discountedPrice ? Number(productData.discountedPrice) : null,
                discountStartDate: formatDateTimeForBackend(productData.discountStartDate),
                discountEndDate: formatDateTimeForBackend(productData.discountEndDate),
                stock: Number(productData.stock),
                soldQuantity: Number(productData.soldQuantity) || 0,
                isFeatured: productData.isFeatured ?? false,
                category: { id: Number(productData.categoryId) },
                supplier: { id: Number(productData.supplierId) },
                images: imageUrls,
            };

            console.log("Payload to server:", productPayload); // Log dữ liệu trước khi gửi

            let response;
            if (editingProduct) {
                response = await apiProduct.updateProduct(editingProduct, productPayload);
                toast.success("Sản phẩm đã được cập nhật!");
            } else {
                response = await apiProduct.createProduct(productPayload);
                toast.success("Sản phẩm đã được thêm!");
            }

            // Cập nhật tồn kho sau khi thêm/cập nhật sản phẩm
            await apiInventory.adjustInventory(response.id, productData.stock, "Cập nhật sản phẩm");

            setEditingProduct(null);
            setShowForm(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.message || "Lỗi khi lưu sản phẩm!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscountAllSubmit = async (e) => {
        e.preventDefault();
        if (!discountAllData.percentage || !discountAllData.startDateTime || !discountAllData.endDateTime) {
            toast.error("Vui lòng nhập đầy đủ thông tin giảm giá!");
            return;
        }
        try {
            await apiProduct.applyDiscountToAll(
                Number(discountAllData.percentage),
                null,
                formatDateTimeForBackend(discountAllData.startDateTime),
                formatDateTimeForBackend(discountAllData.endDateTime)
            );
            toast.success("Đã áp dụng giảm giá cho tất cả sản phẩm!");
            setShowDiscountAllForm(false);
            fetchProducts();
        } catch (error) {
            console.error("Discount error:", error.response); // Log chi tiết
            toast.error(error.response?.data?.message || error.message || "Lỗi khi áp dụng giảm giá!");
        }
    };

    const handleDiscountSelectedSubmit = async (e) => {
        e.preventDefault();
        if (
            discountSelectedData.selectedProductIds.length === 0 ||
            !discountSelectedData.percentage ||
            !discountSelectedData.startDateTime ||
            !discountSelectedData.endDateTime
        ) {
            toast.error("Vui lòng chọn sản phẩm và nhập đầy đủ thông tin giảm giá!");
            return;
        }
        try {
            await apiProduct.applyDiscountToSelected(
                discountSelectedData.selectedProductIds,
                Number(discountSelectedData.percentage),
                null,
                formatDateTimeForBackend(discountSelectedData.startDateTime),
                formatDateTimeForBackend(discountSelectedData.endDateTime)
            );
            toast.success("Đã áp dụng giảm giá cho các sản phẩm được chọn!");
            setShowDiscountSelectedForm(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.message || "Lỗi khi áp dụng giảm giá!");
        }
    };

    const handleSelectProduct = (id) => {
        setDiscountSelectedData((prev) => {
            const selectedIds = prev.selectedProductIds.includes(id)
                ? prev.selectedProductIds.filter((pid) => pid !== id)
                : [...prev.selectedProductIds, id];
            return { ...prev, selectedProductIds: selectedIds };
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
        setProductData({
            name: "",
            description: "",
            costPrice: "",
            sellingPrice: "",
            discountedPrice: "",
            discountStartDate: null,
            discountEndDate: null,
            stock: "",
            soldQuantity: 0,
            isFeatured: false,
            categoryId: "",
            supplierId: "",
            images: [],
        });
        setImagePreviews([]);
    };

    const handleManageInventory = () => {
        navigate("/admin/inventory");
    };

    const getCurrentPrice = (product) => {
        const now = new Date();
        if (
            product.discountedPrice &&
            product.discountStartDate &&
            product.discountEndDate &&
            now >= new Date(product.discountStartDate) &&
            now <= new Date(product.discountEndDate)
        ) {
            return product.discountedPrice;
        }
        return product.sellingPrice;
    };

    return (
        <div className="max-w-screen-xl mx-auto p-6 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Quản lý Sản phẩm</h2>
                <div className="space-x-2">
                    <Button onClick={() => setShowDiscountAllForm(true)}>Áp dụng giảm giá tất cả</Button>
                    <Button onClick={() => setShowDiscountSelectedForm(true)}>Giảm giá sản phẩm chọn</Button>
                    <Button onClick={handleManageInventory}>Quản lý tồn kho</Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Quay lại danh sách" : "➕ Thêm sản phẩm mới"}
                    </Button>
                </div>
            </div>

            {showForm ? (
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">
                            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên sản phẩm</Label>
                                <Input name="name" value={productData.name} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả sản phẩm</Label>
                                <Textarea
                                    name="description"
                                    value={productData.description}
                                    onChange={handleChange}
                                    className="h-32"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="costPrice">Giá nhập (VNĐ)</Label>
                                    <Input name="costPrice" type="number" value={productData.costPrice} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sellingPrice">Giá bán (VNĐ)</Label>
                                    <Input name="sellingPrice" type="number" value={productData.sellingPrice} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountedPrice">Giá giảm (VNĐ)</Label>
                                <Input name="discountedPrice" type="number" value={productData.discountedPrice} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discountStartDate">Ngày giờ bắt đầu giảm giá</Label>
                                    <DatePicker
                                        selected={productData.discountStartDate}
                                        onChange={(date) => setProductData((prev) => ({ ...prev, discountStartDate: date }))}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        timeFormat="HH:mm"
                                        showTimeSelect
                                        placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountEndDate">Ngày giờ kết thúc giảm giá</Label>
                                    <DatePicker
                                        selected={productData.discountEndDate}
                                        onChange={(date) => setProductData((prev) => ({ ...prev, discountEndDate: date }))}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        timeFormat="HH:mm"
                                        showTimeSelect
                                        placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Tồn kho</Label>
                                <Input name="stock" type="number" value={productData.stock} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="isFeatured">Nổi bật</Label>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={productData.isFeatured ?? false}
                                    onChange={(e) => setProductData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Danh mục</Label>
                                <Select
                                    onValueChange={(value) => setProductData((prev) => ({ ...prev, categoryId: value }))}
                                    value={productData.categoryId ? String(productData.categoryId) : ""}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supplier">Nhà cung cấp</Label>
                                <Select
                                    onValueChange={(value) => setProductData((prev) => ({ ...prev, supplierId: value }))}
                                    value={productData.supplierId ? String(productData.supplierId) : ""}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn nhà cung cấp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Ảnh sản phẩm</Label>
                                <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative">
                                                <img src={preview} alt="Preview" className="w-24 h-24 object-cover" />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-0 right-0"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    X
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Lưu sản phẩm"}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : showDiscountAllForm ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Áp dụng giảm giá tất cả sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDiscountAllSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="percentage">Phần trăm giảm giá (%)</Label>
                                <Input
                                    type="number"
                                    name="percentage"
                                    value={discountAllData.percentage}
                                    onChange={(e) => setDiscountAllData((prev) => ({ ...prev, percentage: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDateTime">Ngày giờ bắt đầu</Label>
                                <DatePicker
                                    selected={discountAllData.startDateTime}
                                    onChange={(date) => setDiscountAllData((prev) => ({ ...prev, startDateTime: date }))}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    timeFormat="HH:mm"
                                    showTimeSelect
                                    placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDateTime">Ngày giờ kết thúc</Label>
                                <DatePicker
                                    selected={discountAllData.endDateTime}
                                    onChange={(date) => setDiscountAllData((prev) => ({ ...prev, endDateTime: date }))}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    timeFormat="HH:mm"
                                    showTimeSelect
                                    placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Áp dụng"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowDiscountAllForm(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : showDiscountSelectedForm ? (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Áp dụng giảm giá cho sản phẩm được chọn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDiscountSelectedSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Chọn sản phẩm</Label>
                                <div className="max-h-40 overflow-y-auto border p-2 rounded">
                                    {products.map((product) => (
                                        <div key={product.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={discountSelectedData.selectedProductIds.includes(product.id)}
                                                onChange={() => handleSelectProduct(product.id)}
                                            />
                                            <span>{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="percentage">Phần trăm giảm giá (%)</Label>
                                <Input
                                    type="number"
                                    name="percentage"
                                    value={discountSelectedData.percentage}
                                    onChange={(e) =>
                                        setDiscountSelectedData((prev) => ({ ...prev, percentage: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDateTime">Ngày giờ bắt đầu</Label>
                                    <DatePicker
                                        selected={discountSelectedData.startDateTime}
                                        onChange={(date) =>
                                            setDiscountSelectedData((prev) => ({ ...prev, startDateTime: date }))
                                        }
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        timeFormat="HH:mm"
                                        showTimeSelect
                                        placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDateTime">Ngày giờ kết thúc</Label>
                                    <DatePicker
                                        selected={discountSelectedData.endDateTime}
                                        onChange={(date) =>
                                            setDiscountSelectedData((prev) => ({ ...prev, endDateTime: date }))
                                        }
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        timeFormat="HH:mm"
                                        showTimeSelect
                                        placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Áp dụng"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowDiscountSelectedForm(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <div className="mb-4 grid grid-cols-4 gap-4">
                        <Input
                            name="searchKeyword"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={filters.searchKeyword}
                            onChange={handleFilterChange}
                        />
                        <Input
                            name="minPrice"
                            type="number"
                            placeholder="Giá tối thiểu"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <Input
                            name="maxPrice"
                            type="number"
                            placeholder="Giá tối đa"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                        <Select
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                            value={filters.sortBy}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="bestselling">Bán chạy</SelectItem>
                                <SelectItem value="priceasc">Giá tăng dần</SelectItem>
                                <SelectItem value="pricedesc">Giá giảm dần</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Tên sản phẩm</th>
                                    <th className="p-2 text-left">Giá bán</th>
                                    <th className="p-2 text-left">Giá hiện tại</th>
                                    <th className="p-2 text-left">Tồn kho</th>
                                    <th className="p-2 text-left">Nổi bật</th>
                                    <th className="p-2 text-left">Danh mục</th>
                                    <th className="p-2 text-left">NCC</th>
                                    <th className="p-2 text-left">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b">
                                        <td className="p-2">{product.name}</td>
                                        <td className="p-2">{product.sellingPrice.toLocaleString()} VNĐ</td>
                                        <td className="p-2">{getCurrentPrice(product).toLocaleString()} VNĐ</td>
                                        <td className="p-2">{product.stock}</td>
                                        <td className="p-2">{product.isFeatured ? "Có" : "Không"}</td>
                                        <td className="p-2">{product.category?.name || "Không có"}</td>
                                        <td className="p-2">{product.supplier?.name || "Không có"}</td>
                                        <td className="p-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditProduct(product)}
                                                className="mr-2"
                                            >
                                                Sửa
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                                Xóa
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0}>
                            Trước
                        </Button>
                        <span>Trang {page + 1} / {totalPages}</span>
                        <Button onClick={() => setPage((prev) => prev + 1)} disabled={page >= totalPages - 1}>
                            Sau
                        </Button>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}

export default ProductManagement;