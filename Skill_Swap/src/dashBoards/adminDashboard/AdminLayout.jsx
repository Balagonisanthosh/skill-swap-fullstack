import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="ml-64 w-full min-h-screen bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 
