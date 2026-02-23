import React, { useEffect, useState, useMemo } from "react";
import Dashboard_Navbar from "../../components/dashboard/Dashboard_Navbar";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";

import SearchBar from "../../components/dashboard/SearchBar";
import CategoryBar from "../../components/dashboard/CategoryBar";
import MentorCard from "../../components/dashboard/MentorCard";
import MentorModal from "../../components/dashboard/MentorModal";
import TECH_CATEGORIES from "../../constants/techCategories";

const UserDashBoards = () => {
  const {
    fetchMentorsList,
    fetchUserConnectionRequests,
    sendConnectionRequest,
    user,
    token,
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const mentorData = await fetchMentorsList();
      const requestData = await fetchUserConnectionRequests();

      setMentors(mentorData || []);
      setMyRequests(requestData || []);

      const skillSet = new Set();
      mentorData?.forEach((m) => m.skills?.forEach((s) => skillSet.add(s)));

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

  const getRequestForMentor = (mentorId) => myRequests.find((r) => r.mentorId?._id === mentorId);

  const handleChatClick = async (receiverId) => {
    try {
      if (!receiverId || receiverId.length !== 24) return;
      if (receiverId === user?._id) return;

      const convo = await startConversation(receiverId, token, user?._id);
      navigate(`/chat/${convo._id}`);
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  const filteredMentors = useMemo(() => {
    let data =
      activeCategory === "All"
        ? mentors
        : mentors.filter((m) => {
            if (["Beginner Friendly", "Intermediate", "Advanced"].includes(activeCategory)) {
              if (activeCategory === "Beginner Friendly") return m.experienceYears <= 2;
              if (activeCategory === "Intermediate") return m.experienceYears > 2 && m.experienceYears <= 5;
              if (activeCategory === "Advanced") return m.experienceYears > 5;
            }

            return m.skills?.includes(activeCategory) || m.title?.toLowerCase().includes(activeCategory.toLowerCase());
          });

    if (!search.trim()) return data;

    const q = search.toLowerCase();
    return data.filter((m) => {
      const u = m.userId || {};
      return (
        u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || m.skills?.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [mentors, activeCategory, search]);

  const handleSendRequest = async (mentor) => {
    if (getRequestForMentor(mentor._id)) return;

    await sendConnectionRequest(mentor._id, "Hi! I’d love to connect and learn from your experience.");

    const updated = await fetchUserConnectionRequests();
    setMyRequests(updated);
    setSelectedMentor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard_Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back{user?.username ? `, ${user.username}` : ""} 👋</h1>
        <p className="text-gray-500 mt-2">Search, filter, and connect with mentors</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <SearchBar search={search} setSearch={setSearch} />

        <CategoryBar categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => {
            const request = getRequestForMentor(mentor._id);

            return (
              <MentorCard key={mentor._id} mentor={mentor} request={request} onViewDetails={(m) => setSelectedMentor(m)} onChatClick={handleChatClick} />
            );
          })}
        </div>
      </div>

      <MentorModal selectedMentor={selectedMentor} request={selectedMentor ? getRequestForMentor(selectedMentor._id) : null} onClose={() => setSelectedMentor(null)} onSendRequest={handleSendRequest} />
    </div>
  );
};

export default UserDashBoards;
