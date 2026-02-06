import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Dashboard_Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* LOGO */}
      <div
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        SkillsSwap
      </div>

      {/* NAV LINKS */}
      <ul className="hidden md:flex gap-6 text-gray-600 font-medium">
        <li
          className="hover:text-blue-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Home
        </li>

        {/* ✅ SHOW ONLY IF USER IS MENTOR */}
        {user?.role === "mentor" && (
          <li
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => navigate("/mentor")}
          >
            MentorDashboard
          </li>
        )}

        <li
          className="hover:text-blue-600 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          Profile
        </li>
      </ul>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="px-4 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Dashboard_Navbar;
