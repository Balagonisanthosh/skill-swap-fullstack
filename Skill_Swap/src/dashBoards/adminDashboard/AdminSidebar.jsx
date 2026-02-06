import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900">
      <div className="p-6 text-2xl font-bold text-white border-b border-gray-700">
        SkillSwap Admin
      </div>

      <nav className="flex flex-col gap-2 p-4">
        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Users
        </NavLink>
        <NavLink to="/admin/mentors" className={linkClass}>
          Mentors
        </NavLink>
        <NavLink to="/admin/mentor-requests" className={linkClass}>
          Mentor Requests
        </NavLink>
        <NavLink to="/admin/reports" className={linkClass}>
          Reports
        </NavLink>
        <NavLink to="/admin/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
