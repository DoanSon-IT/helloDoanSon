import { Outlet } from "react-router-dom";
import SideBar from "../components/admin/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex">
      <SideBar />
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
