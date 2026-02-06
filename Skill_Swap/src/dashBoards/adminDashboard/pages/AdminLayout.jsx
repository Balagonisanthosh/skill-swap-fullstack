import { Outlet } from "react-router-dom";
import AdminSidebar from "../AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* ADMIN SIDEBAR */}
      <AdminSidebar/>

      {/* PAGE CONTENT */}
      <main className="ml-64 flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
