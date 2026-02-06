import { useEffect, useState } from "react";
import Dashboard_Navbar from "../../dashBoards/Dashboard_Navbar";
import { useAuthStore } from "../../store/authStore";

const MentorsPage = () => {
  const [stats, setStats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, fetchMentorConnectionRequests, respondToConnectionRequest } =
    useAuthStore();

  // ================= LOAD DASHBOARD DATA =================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const data = await fetchMentorConnectionRequests();

        setRequests(data.requests || []);

        setStats([
          { label: "Classes Taught", value: 124 },
          { label: "Overall Rating", value: "4.8 ⭐" },
          { label: "Connections", value: data.connectionsCount || 0 },
          { label: "Upcoming Requests", value: data.requests?.length || 0 },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchMentorConnectionRequests]);

  // ================= ACTIONS =================
  const handleAccept = async (requestId) => {
    try {
      await respondToConnectionRequest(requestId, "accepted");

      // remove request card
      setRequests((prev) => prev.filter((r) => r._id !== requestId));

      // ✅ update stats safely
      setStats((prevStats) =>
        prevStats.map((stat) => {
          if (stat.label === "Connections") {
            return { ...stat, value: stat.value + 1 };
          }
          if (stat.label === "Upcoming Requests") {
            return { ...stat, value: Math.max(stat.value - 1, 0) };
          }
          return stat;
        }),
      );

      alert("Connection request accepted ✅");
    } catch (error) {
      alert(error.message || "Failed to accept request");
    }
  };

  const handleReject = async (requestId) => {
  try {
    await respondToConnectionRequest(requestId, "rejected");

    setRequests((prev) => prev.filter((r) => r._id !== requestId));

    setStats((prevStats) =>
      prevStats.map((stat) => {
        if (stat.label === "Upcoming Requests") {
          return { ...stat, value: Math.max(stat.value - 1, 0) };
        }
        return stat;
      })
    );

    alert("Connection request rejected ❌");
  } catch (error) {
    alert(error.message || "Failed to reject request");
  }
};


  // ================= GREETING =================
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      <Dashboard_Navbar />

      <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}
            {user?.username ? `, ${user.username}` : ""} 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Here’s an overview of your mentoring activity and new connection
            requests
          </p>
        </div>

        {loading && (
          <div className="text-gray-500 text-center py-20">
            Loading mentor dashboard...
          </div>
        )}

        {!loading && (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-5">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* REQUESTS */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Connection Requests
              </h2>

              {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
                  No pending connection requests.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {req.userId?.username}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {req.userId?.skillsYouKnown?.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {req.message}
                        </p>

                        <p className="text-xs text-gray-400">
                          Requested:{" "}
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-300 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MentorsPage;
