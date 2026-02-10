import React, { useEffect, useState, useMemo } from "react";
import Dashboard_Navbar from "./Dashboard_Navbar";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { FaCommentDots } from "react-icons/fa";
import { useChatStore } from "../store/chatStore";

/* 🔹 Static Technology Categories */
const TECH_CATEGORIES = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Mobile Development",
  "DevOps",
  "Cloud",
  "AI / ML",
  "Data Science",
  "Cyber Security",
  "Blockchain",
  "UI / UX",
  "Testing / QA",
  "System Design",
];

const UserDashBoards = () => {
  const {
    fetchMentorsList,
    fetchUserConnectionRequests,
    sendConnectionRequest,
    user,
    token, // ✅ REQUIRED FOR CHAT
  } = useAuthStore();

  const navigate = useNavigate();
  const startConversation = useChatStore((state) => state.startConversation);

  const [mentors, setMentors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const mentorData = await fetchMentorsList();
      const requestData = await fetchUserConnectionRequests();

      setMentors(mentorData || []);
      setMyRequests(requestData || []);

      // build dynamic categories
      const skillSet = new Set();
      mentorData?.forEach((m) =>
        m.skills?.forEach((s) => skillSet.add(s)),
      );

      setCategories([
        "All",
        "Beginner Friendly",
        "Intermediate",
        "Advanced",
        ...TECH_CATEGORIES,
        ...Array.from(skillSet),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ================= HELPERS =================
  const getRequestForMentor = (mentorId) =>
    myRequests.find((r) => r.mentorId?._id === mentorId);

  // ================= CHAT FIX (IMPORTANT) =================
  const handleChatClick = async (receiverId) => {
    try {
      // 🧠 Support ALL p ossible backend shapes
      if (!receiverId || receiverId.length !== 24) {
        console.error("Invalid receiver userId", receiverId);
        return;
      }

      // don't start chat with self
      if (receiverId === user?._id) return;

      const convo = await startConversation(receiverId, token, user?._id);
      navigate(`/chat/${convo._id}`);
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };



  // ================= FILTER + SEARCH =================
  const filteredMentors = useMemo(() => {
    let data =
      activeCategory === "All"
        ? mentors
        : mentors.filter((m) => {
            if (
              ["Beginner Friendly", "Intermediate", "Advanced"].includes(
                activeCategory,
              )
            ) {
              if (activeCategory === "Beginner Friendly")
                return m.experienceYears <= 2;
              if (activeCategory === "Intermediate")
                return m.experienceYears > 2 && m.experienceYears <= 5;
              if (activeCategory === "Advanced")
                return m.experienceYears > 5;
            }

            return (
              m.skills?.includes(activeCategory) ||
              m.title?.toLowerCase().includes(activeCategory.toLowerCase())
            );
          });

    if (!search.trim()) return data;

    const q = search.toLowerCase();
    return data.filter((m) => {
      const u = m.userId || {};
      return (
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        m.skills?.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [mentors, activeCategory, search]);

  // ================= SEND REQUEST =================
  const handleSendRequest = async (mentor) => {
    if (getRequestForMentor(mentor._id)) return;

    await sendConnectionRequest(
      mentor._id,
      "Hi! I’d love to connect and learn from your experience.",
    );

    const updated = await fetchUserConnectionRequests();
    setMyRequests(updated);
    setSelectedMentor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard_Navbar />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user?.username ? `, ${user.username}` : ""} 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Search, filter, and connect with mentors
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search mentors by name, email, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* CATEGORY BAR */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => {
            const u = mentor.userId || {};
            const request = getRequestForMentor(mentor._id);

            return (
              <div
                key={mentor._id}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition flex flex-col relative"
              >
                {/* CHAT ICON */}
                {request?.status === "accepted" && (
                  <button
                    onClick={() => handleChatClick(u._id)}
                    title="Chat with mentor"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full
                               bg-blue-600 text-white flex items-center justify-center
                               hover:bg-blue-700 transition"
                  >
                    <FaCommentDots size={16} />
                  </button>
                )}

                {/* CARD CONTENT */}
                <div className="p-6 flex items-center gap-4">
                  {u.profileImage ? (
                    <img
                      src={u.profileImage}
                      alt={u.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold">{u.username}</h3>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 text-sm text-gray-600 flex-1">
                  <p className="mb-2 line-clamp-2">
                    <span className="font-medium">Bio:</span>{" "}
                    {mentor.bio || "No bio provided"}
                  </p>

                  <p className="mb-2">
                    <span className="font-medium">Experience:</span>{" "}
                    {mentor.experienceYears || 0} years
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium">Skills:</span>
                    {mentor.skills?.map((s, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {request ? (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-xl"
                    >
                      Request {request.status}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="w-full border border-blue-600 text-blue-600 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL (UNCHANGED) */}
      {selectedMentor && (() => {
        const u = selectedMentor.userId || {};
        const request = getRequestForMentor(selectedMentor._id);

        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
              <button
                onClick={() => setSelectedMentor(null)}
                className="absolute top-4 right-4 text-gray-500"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold">{u.username}</h2>
              <p className="text-sm text-gray-500 mb-4">{u.email}</p>

              <p className="mb-2">
                <span className="font-medium">Bio:</span>{" "}
                {selectedMentor.bio}
              </p>

              <p className="mb-2">
                <span className="font-medium">Experience:</span>{" "}
                {selectedMentor.experienceYears} years
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedMentor.skills?.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {request ? (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl"
                >
                  Request {request.status}
                </button>
              ) : (
                <button
                  onClick={() => handleSendRequest(selectedMentor)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
                >
                  Send Connection Request
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default UserDashBoards;
