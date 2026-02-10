import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";

const Dashboard_Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
    // ensure sidebar conversations (and unread counts) are loaded for badge
    fetchConversations();
  }, []);

  const totalUnread = (conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);

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
          <li>
            <button
              onClick={() => navigate("/chat")}
              className="relative p-2 rounded hover:bg-gray-100"
              aria-label="Messages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.06 0-2.083-.13-3-.37L3 21l1.37-4.11C3.51 15.7 3 14.39 3 13c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>

              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread}</span>
              )}
            </button>
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

            <li>
              <button
                onClick={() => handleNavigate("/chat")}
                className="relative p-2 rounded hover:bg-gray-100"
                aria-label="Messages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.06 0-2.083-.13-3-.37L3 21l1.37-4.11C3.51 15.7 3 14.39 3 13c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>

                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalUnread}</span>
                )}
              </button>
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
