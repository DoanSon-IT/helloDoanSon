import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import { fetchDashboardStats, fetchRecentOrders, fetchTopSellingProducts, fetchRecentUsers } from "../../api/apiAdmin";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Dashboard = () => {
  const { auth, authLoading } = useContext(AppContext); // ✅ Lấy cả auth + loading
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState("");

  // ✅ Nếu chưa load xong auth thì chờ
  if (authLoading) {
    return <div className="text-center mt-10 text-gray-500">🔐 Đang xác thực người dùng...</div>;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await fetchDashboardStats();
        setStats(statsData);

        const ordersData = await fetchRecentOrders();
        setRecentOrders(ordersData);

        const productsData = await fetchTopSellingProducts();
        setTopProducts(productsData);

        const usersData = await fetchRecentUsers();
        setRecentUsers(usersData);
      } catch (err) {
        console.error("🚨 Lỗi khi lấy dữ liệu Dashboard:", err);
        setError(err.message || "Lỗi không xác định!");
      }
    };

    if (auth) {
      fetchDashboardData(); // ✅ Chỉ fetch nếu đã có auth
    }
  }, [auth]);

  const chartData = {
    labels: stats?.revenueByTime ? Object.keys(stats.revenueByTime) : [],
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: stats?.revenueByTime ? Object.values(stats.revenueByTime) : [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const ordersChartData = {
    labels: stats?.ordersByTime ? Object.keys(stats.ordersByTime) : [],
    datasets: [
      {
        label: "Số đơn hàng",
        data: stats?.ordersByTime ? Object.values(stats.ordersByTime) : [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Các thống kê nhanh */}
          <div className="bg-white p-4 shadow rounded">🛒 Tổng đơn hàng: {stats.totalOrders}</div>
          <div className="bg-white p-4 shadow rounded">💰 Tổng doanh thu: {stats.totalRevenue.toString()} VND</div>
          <div className="bg-white p-4 shadow rounded">📦 SP bán chạy: {stats.topSellingProductsCount}</div>
          <div className="bg-white p-4 shadow rounded">👥 Người dùng mới: {stats.newUsersCount}</div>

          {/* Biểu đồ doanh thu */}
          <div className="bg-white p-4 shadow rounded col-span-full">
            <h2 className="text-lg font-semibold">Biểu đồ Doanh thu</h2>
            <Line data={chartData} />
          </div>

          {/* Biểu đồ số đơn hàng */}
          <div className="bg-white p-4 shadow rounded col-span-full">
            <h2 className="text-lg font-semibold">Biểu đồ Số đơn hàng</h2>
            <Line data={ordersChartData} />
          </div>

          {/* Danh sách đơn hàng gần đây */}
          <div className="bg-white p-4 shadow rounded col-span-full">
            <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.totalAmount || "N/A"} VND</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.status || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sản phẩm bán chạy */}
          <div className="bg-white p-4 shadow rounded col-span-full">
            <h2 className="text-lg font-semibold">Sản phẩm bán chạy</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng bán</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.soldQuantity || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Người dùng mới */}
          <div className="bg-white p-4 shadow rounded col-span-full">
            <h2 className="text-lg font-semibold">Người dùng mới</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.fullName || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>Đang tải dữ liệu...</p>
      )}
    </div>
  );
};

export default Dashboard;
