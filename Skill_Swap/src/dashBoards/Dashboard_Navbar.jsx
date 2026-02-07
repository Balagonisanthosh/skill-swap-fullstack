import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Dashboard_Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <div
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => handleNavigate("/dashboard")}
        >
          SkillsSwap
        </div>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex gap-6 text-gray-600 font-medium">
          <li
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            Home
          </li>

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

        {/* DESKTOP LOGOUT */}
        <button
          onClick={handleLogout}
          className="hidden md:block px-4 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-white shadow rounded">
          <ul className="flex flex-col gap-4 px-4 py-4 text-gray-600 font-medium">
            <li
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => handleNavigate("/dashboard")}
            >
              Home
            </li>

            {user?.role === "mentor" && (
              <li
                className="hover:text-blue-600 cursor-pointer"
                onClick={() => handleNavigate("/mentor")}
              >
                MentorDashboard
              </li>
            )}

            <li
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => handleNavigate("/profile")}
            >
              Profile
            </li>

            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Dashboard_Navbar;
