// Import axiosInstance từ file cấu hình axios
import axiosInstance from "./axiosConfig";

// Hàm đăng nhập người dùng
export const loginUser = async (credentials) => {
    try {
        const response = await axiosInstance.post("/auth/login", credentials, { withCredentials: true });
        console.log("Phản hồi từ server khi đăng nhập:", response.data);
        return response.data; // Chỉ chứa { message }
    } catch (error) {
        console.error("Lỗi từ server khi đăng nhập:", error.response?.data);
        throw error.response?.data || new Error("Đã xảy ra lỗi khi đăng nhập!");
    }
};

// Hàm lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
    try {
        console.log("Gửi yêu cầu tới /users/me");
        const response = await axiosInstance.get("/users/me", { withCredentials: true });
        console.log("Phản hồi từ /users/me:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi từ /users/me:", error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            console.log("Token hết hạn, thử làm mới token...");
            try {
                const refreshResponse = await refreshToken();
                const retryResponse = await axiosInstance.get("/users/me", { withCredentials: true });
                console.log("Phản hồi sau khi làm mới token:", retryResponse.data);
                return retryResponse.data;
            } catch (refreshError) {
                console.error("Không thể làm mới token:", refreshError.response?.data);
                return null; // Trả null thay vì throw để context xử lý
            }
        }
        return null; // Trả null cho các lỗi khác
    }
};

// Hàm đăng xuất người dùng
export const logoutUser = async () => {
    try {
        console.log("Đang gửi yêu cầu đăng xuất tới /auth/logout");
        await axiosInstance.post("/auth/logout", null, {
            withCredentials: true, // Đảm bảo gửi cookie để xóa
        });
        console.log("Đăng xuất thành công, chuyển hướng về trang chủ");
        window.location.href = "/"; // Chuyển hướng về trang chủ
    } catch (error) {
        console.error("Lỗi khi đăng xuất:", error.response?.data);
        throw new Error("Không thể đăng xuất, vui lòng thử lại!");
    }
};

// Hàm đăng ký người dùng mới
export const registerUser = async (userData) => {
    try {
        console.log("Đang đăng ký người dùng với dữ liệu:", userData);
        const response = await axiosInstance.post("/auth/register", userData, {
            withCredentials: true, // Đảm bảo gửi cookie nếu cần
        });
        console.log("Phản hồi từ server khi đăng ký:", response.data);
        return response.data; // Trả về dữ liệu từ server
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error.response?.data);
        throw new Error(error.response?.data?.message || "Có lỗi xảy ra khi đăng ký!");
    }
};

// Hàm yêu cầu quên mật khẩu
export const forgotPassword = async (email) => {
    try {
        console.log("Gửi yêu cầu quên mật khẩu cho email:", email);
        const response = await axiosInstance.post(
            "/auth/forgot-password",
            { email },
            {
                withCredentials: true, // Đảm bảo gửi cookie nếu cần
            }
        );
        console.log("Phản hồi từ server khi yêu cầu quên mật khẩu:", response.data);
        return response.data; // Trả về thông báo từ server
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu quên mật khẩu:", error.response?.data);
        throw new Error(error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu!");
    }
};

// Hàm làm mới token
export const refreshToken = async () => {
    try {
        console.log("Đang gửi yêu cầu làm mới token tới /auth/refresh-token");
        const response = await axiosInstance.post("/auth/refresh-token", null, {
            withCredentials: true, // Đảm bảo gửi cookie refresh_token
        });
        console.log("Phản hồi từ server khi làm mới token:", response.data);
        return response.data; // Trả về token mới
    } catch (error) {
        console.error("Lỗi khi làm mới token:", error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            throw new Error("Không tìm thấy refresh token!");
        }
        throw new Error(error.response?.data?.message || "Không thể làm mới token!");
    }
};