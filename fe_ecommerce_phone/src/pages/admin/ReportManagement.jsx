import React, { useState, useContext } from "react"; // Thêm useContext
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import apiReport from "../../api/apiReport";
import { AppContext } from "../../context/AppContext"; // Import AppContext

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportManagement = () => {
    const { token } = useContext(AppContext); // Lấy token từ context
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [revenue, setRevenue] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [orderStatus, setOrderStatus] = useState({});
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

    const fetchReports = async () => {
        if (!startDate || !endDate) {
            setSnackbar({ open: true, message: "Vui lòng chọn ngày bắt đầu và kết thúc", severity: "warning" });
            return;
        }
        if (!token) {
            setSnackbar({ open: true, message: "Vui lòng đăng nhập để xem báo cáo!", severity: "error" });
            return;
        }
        setLoading(true);
        try {
            const revenueData = await apiReport.getRevenue(startDate, endDate, token);
            const topProductsData = await apiReport.getTopSellingProducts(startDate, endDate, 5, token);
            const orderStatusData = await apiReport.getOrderCountByStatus(token);
            const lowStockData = await apiReport.getLowStockProducts(5, token);

            console.log("Revenue:", revenueData);
            console.log("Top Products:", topProductsData);
            console.log("Order Status:", orderStatusData);
            console.log("Low Stock Products:", lowStockData);

            setRevenue(revenueData || 0);
            setTopProducts(topProductsData || []);
            setOrderStatus(orderStatusData || {});
            setLowStockProducts(lowStockData || []);
            setSnackbar({ open: true, message: "Tải báo cáo thành công!", severity: "success" });
        } catch (error) {
            console.error("Error fetching reports:", error.response?.data || error.message);
            setSnackbar({ open: true, message: "Lỗi khi tải báo cáo! Kiểm tra console để biết chi tiết.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!startDate || !endDate) {
            setSnackbar({ open: true, message: "Vui lòng chọn ngày bắt đầu và kết thúc", severity: "warning" });
            return;
        }
        if (!token) {
            setSnackbar({ open: true, message: "Vui lòng đăng nhập để xuất báo cáo!", severity: "error" });
            return;
        }
        setLoading(true);
        try {
            await apiReport.exportRevenueReport(startDate, endDate, token);
            setSnackbar({ open: true, message: "Xuất báo cáo thành công!", severity: "success" });
        } catch (error) {
            console.error("Error exporting report:", error.response?.data || error.message);
            setSnackbar({ open: true, message: "Lỗi khi xuất báo cáo!", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: topProducts.map((p) => p.name || "Unknown"),
        datasets: [
            {
                label: "Doanh thu (VNĐ)",
                data: topProducts.map((p) => p.revenue || 0),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: "top" }, title: { display: true, text: "Doanh thu Top 5 sản phẩm" } },
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Quản lý Báo cáo
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    label="Ngày bắt đầu"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Ngày kết thúc"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={fetchReports} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Xem Báo cáo"}
                </Button>
                <Button variant="outlined" onClick={handleExport} disabled={loading}>
                    Xuất Excel
                </Button>
            </Box>

            {revenue !== null && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">Doanh thu</Typography>
                    <Typography variant="h5">{revenue.toLocaleString()} VNĐ</Typography>
                </Paper>
            )}

            {topProducts.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Bar data={chartData} options={chartOptions} />
                </Paper>
            )}

            {topProducts.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">Top 5 sản phẩm bán chạy</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên sản phẩm</TableCell>
                                <TableCell>Số lượng bán</TableCell>
                                <TableCell>Doanh thu</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell>{product.name || "N/A"}</TableCell>
                                    <TableCell>{product.quantitySold || 0}</TableCell>
                                    <TableCell>{(product.revenue || 0).toLocaleString()} VNĐ</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {Object.keys(orderStatus).length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">Số lượng đơn hàng theo trạng thái</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Số lượng</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(orderStatus).map(([status, count]) => (
                                <TableRow key={status}>
                                    <TableCell>
                                        {status === "COMPLETED" ? "Hoàn thành" : status === "PENDING" ? "Đang chờ" : status}
                                    </TableCell>
                                    <TableCell>{count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {lowStockProducts.length > 0 && (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Sản phẩm tồn kho thấp {"(< 5)"}</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên sản phẩm</TableCell>
                                <TableCell>Số lượng tồn</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lowStockProducts.map((product) => (
                                <TableRow key={product.id || Math.random()}>
                                    <TableCell>{product.name || "N/A"}</TableCell>
                                    <TableCell>{product.stock || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReportManagement;