import { useEffect, useState } from "react";

const Settings = () => {
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    // Example: load admin info from localStorage or auth context
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setAdmin({
        username: storedUser.username,
        email: storedUser.email,
      });
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Admin Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* PROFILE INFO */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-gray-800">
            Account Information
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Username</span>
              <span className="font-medium text-gray-800">
                {admin.username || "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">
                {admin.email || "-"}
              </span>
            </div>
          </div>
        </div>

        <hr />

        {/* LOGOUT */}
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg
                       hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
