import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-2xl text-gray-600 mb-2">Trang không tồn tại</p>
            <p className="text-gray-500 mb-6 text-center max-w-md">
                Có vẻ như bạn đã nhập sai địa chỉ hoặc trang này đã bị xóa. Hãy quay lại trang chủ để tiếp tục khám phá.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <ArrowLeft className="w-4 h-4" />
                Về trang chủ
            </Link>
        </div>
    );
};

export default NotFoundPage;
