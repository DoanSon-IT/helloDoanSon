import { Routes, Navigate, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import CustomerRoutes from "./routes/CustomerRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
    return (
        <AppProvider>
            <Routes>
                <Route path="/auth/*" element={<AuthRoutes />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/*" element={<CustomerRoutes />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AppProvider>
    );
};

export default App;