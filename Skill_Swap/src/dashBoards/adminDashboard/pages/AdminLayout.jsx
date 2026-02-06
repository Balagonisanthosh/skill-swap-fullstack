import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* sidebar / navbar */}
      <Outlet />
    </div>
  );
};

export default AdminLayout;
