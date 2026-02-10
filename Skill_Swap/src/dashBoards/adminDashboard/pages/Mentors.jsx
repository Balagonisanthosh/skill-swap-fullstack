import { useEffect, useState } from "react";
import useAdminStore from "../../../store/adminStore";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { deleteMentorById } = useAdminStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleRemoveMentor = async (mentorId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this mentor?"
    );
    if (!confirmDelete) return;

    await deleteMentorById(mentorId);

    setMentors((prev) => prev.filter((m) => m._id !== mentorId));

    alert("Mentor removed successfully!");
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          "http://localhost:3000/api/admin/getTotalMentorsList",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch mentors list");
        }

        const data = await res.json();
        setMentors(data.mentors);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.username
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      mentor.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (loading) return <p className="text-gray-500">Loading mentors...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {/* HEADER + SEARCH */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mentors</h1>

        <input
          type="text"
          placeholder="Search mentors by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        {filteredMentors.length === 0 ? (
          <p className="text-gray-500">No mentors found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-3">Mentor</th>
                <th>Email</th>
                <th>Role</th>
                <th>Mentor Status</th>
                <th>Approved On</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredMentors.map((mentor) => (
                <tr
                  key={mentor._id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  {/* MENTOR INFO */}
                  <td className="py-3 flex items-center gap-3">
                    {mentor.profileImage ? (
                      <img
                        src={mentor.profileImage}
                        alt={mentor.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                        {mentor.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{mentor.username}</span>
                  </td>

                  <td>{mentor.email}</td>
                  <td className="capitalize">{mentor.role}</td>

                  <td>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {mentor.mentorStatus}
                    </span>
                  </td>

                  <td>{new Date(mentor.createdAt).toLocaleDateString()}</td>

                  <td className="text-center">
                    <button
                      onClick={() => handleRemoveMentor(mentor._id)}
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

export default Mentors;
