import { useEffect, useState } from "react";
import useAdminStore from "../../../store/adminStore";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { deleteUserById } = useAdminStore();

  // 🔁 Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ❌ Remove user handler
  const handleRemoveUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmDelete) return;

    await deleteUserById(userId);

    // 🔥 Update UI instantly
    setUsers((prev) => prev.filter((user) => user._id !== userId));

    alert("User deleted successfully!");
  };

  // 📦 Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          "http://localhost:3000/api/admin/getusersList",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch users list");
        }

        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 🔍 Filter users (debounced)
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (loading) return <p className="text-gray-500">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {/* HEADER + SEARCH */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>

        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm w-64
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-3">User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Mentor Status</th>
                <th>Joined</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  {/* USER */}
                  <td className="py-3 flex items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{user.username}</span>
                  </td>

                  <td>{user.email}</td>
                  <td className="capitalize">{user.role}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          user.mentorStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : user.mentorStatus === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : user.mentorStatus === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {user.mentorStatus}
                    </span>
                  </td>

                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="text-center">
                    <button
                      onClick={() => handleRemoveUser(user._id)}
                      className="px-3 py-1 text-sm rounded-lg
                                 bg-red-100 text-red-700
                                 hover:bg-red-200 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
