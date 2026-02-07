import React, { useEffect, useState } from "react";
import { FaLinkedin, FaPlayCircle } from "react-icons/fa";
import useAdminStore from "../../../store/adminStore";

const MentorRequests = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedVideo, setSelectedVideo] = useState(null);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // 🔥 Dashboard refresh function
  const { fetchDashboardStats } = useAdminStore();

  // ---------------- FETCH MENTOR REQUESTS ----------------
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/admin/mentorsRequest",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setMentors(data.mentorsList || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // ---------------- APPROVE ----------------
  const handleApprove = async (requestId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/mentor-requests/${requestId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local list
      setMentors((prev) =>
        prev.map((m) =>
          m._id === requestId ? { ...m, status: "approved" } : m
        )
      );

      // ✅ REFRESH DASHBOARD COUNTS
      fetchDashboardStats();
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- REJECT SUBMIT ----------------
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    try {
      const res = await fetch(
        `https://skill-swap-fullstack.onrender.com/api/admin/mentor-requests/${selectedRequestId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local list
      setMentors((prev) =>
        prev.map((m) =>
          m._id === selectedRequestId
            ? { ...m, status: "rejected" }
            : m
        )
      );

      // ✅ REFRESH DASHBOARD COUNTS
      fetchDashboardStats();

      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRequestId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading mentor requests…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Mentor Requests
          </h1>
          <span className="text-sm text-gray-500">
            {mentors.length} request(s)
          </span>
        </header>

        {/* Requests Grid */}
        {mentors.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No mentor approval requests available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {req.userId?.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {req.userId?.email}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium capitalize
                      ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Body */}
                <div className="mt-5 space-y-3 text-sm">
                  <a
                    href={req.linkedInURL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FaLinkedin />
                    View LinkedIn Profile
                  </a>

                  <button
                    onClick={() => setSelectedVideo(req.uploadVideo)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FaPlayCircle />
                    Review Teaching Video
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleApprove(req._id)}
                    disabled={req.status !== "pending"}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRequestId(req._id);
                      setShowRejectModal(true);
                    }}
                    disabled={req.status !== "pending"}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= REJECT MODAL ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Reject Mentor Request
            </h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-lg p-2 mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequestId(null);
                }}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleRejectSubmit}
                className="flex-1 bg-red-600 text-white rounded-lg py-2"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIDEO MODAL ================= */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-lg font-semibold">Teaching Demo Video</h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MentorRequests;
