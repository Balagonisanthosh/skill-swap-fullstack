import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    await logout();
    navigate("/login");
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* ================= PROFILE HEADER ================= */}
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
          {user?.username?.charAt(0)?.toUpperCase() || "A"}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user?.username}
          </h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>

          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600 font-medium">
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ================= ACCOUNT INFO ================= */}
      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-800">
          Account Information
        </h3>

        <div className="flex justify-between">
          <span className="text-gray-500">Username</span>
          <span className="font-medium text-gray-800">
            {user?.username || "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Email</span>
          <span className="font-medium text-gray-800">
            {user?.email || "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Joined</span>
          <span className="font-medium text-gray-800">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "-"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Password</span>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-blue-600 hover:underline text-sm"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ================= DANGER ZONE ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-red-600 font-semibold mb-4">
          Danger Zone
        </h3>

        <button
          onClick={handleLogout}
          className="w-full px-6 py-2 bg-red-600 text-white rounded-lg 
                     hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;