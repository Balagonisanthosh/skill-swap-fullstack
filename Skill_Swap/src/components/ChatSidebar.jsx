import { useEffect, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ChatSidebar() {
  const {
    conversations,
    fetchConversations,
    loadingConversations,
  } = useChatStore();

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const token = useAuthStore((s) => s.token);
  const fetchMentorsList = useAuthStore((s) => s.fetchMentorsList);
  const fetchUserConnectionRequests = useAuthStore((s) => s.fetchUserConnectionRequests);
  const sendConnectionRequest = useAuthStore((s) => s.sendConnectionRequest);
  const { startConversation } = useChatStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState([]);
  const [acceptedMentorIds, setAcceptedMentorIds] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  useEffect(() => {
    fetchConversations();

    (async () => {
      setLoadingMentors(true);
      try {
        const all = await fetchMentorsList();
        setMentors(all || []);

        const requests = await fetchUserConnectionRequests();
        const accepted = (requests || [])
          .filter((r) => r.status === "accepted")
          .map((r) => String(r.mentorId?._id || r.mentorId));

        setAcceptedMentorIds(accepted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMentors(false);
      }
    })();
  }, []);

  if (loadingConversations) {
    return (
      <div className="w-80 border-r p-4 text-gray-500">
        Loading chats…
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-white overflow-y-auto">
      <div className="p-4 border-b">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search mentors..."
          className="w-full border rounded px-3 py-2 text-sm outline-none"
        />

        {!loadingMentors && searchTerm.trim() !== "" && (
          <div className="mt-2 max-h-48 overflow-y-auto">
            {mentors
              .filter((m) =>
                (m.userId?.username || "")
                  .toLowerCase()
                  .includes(searchTerm.trim().toLowerCase())
              )
              .map((m) => {
                const mentorUserId = m.userId?._id || m.userId;
                const accepted = acceptedMentorIds.includes(String(m._id));

                return (
                  <div key={m._id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded">
                    <div className="text-sm font-medium">{m.userId?.username || "Mentor"}</div>
                    {accepted ? (
                      <button
                        onClick={async () => {
                          try {
                            const receiverId = mentorUserId;
                            if (!receiverId) {
                              alert("Mentor id not available");
                              return;
                            }
                            const convo = await startConversation(receiverId, token, user?._id);
                            if (convo && convo._id) navigate(`/chat/${convo._id}`);
                          } catch (err) {
                            console.error(err);
                            alert(err.message || "Failed to start conversation");
                          }
                        }}
                        className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await sendConnectionRequest(m._id, "Hello, I'd like to connect");
                            const requests = await fetchUserConnectionRequests();
                            const accepted = (requests || []).filter((r) => r.status === "accepted").map((r) => String(r.mentorId?._id || r.mentorId));
                            setAcceptedMentorIds(accepted);
                            alert('Connection request sent');
                          } catch (err) {
                            console.error(err);
                            alert(err.message || 'Failed to send request');
                          }
                        }}
                        className="ml-2 px-3 py-1 border text-xs rounded"
                      >
                        Send Request
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {conversations.length === 0 && (
        <div className="p-6 text-gray-500 text-sm">No conversations yet</div>
      )}

      {conversations.map((c) => {
        const otherUser = c.participants?.find((p) => String(p._id) !== String(user?._id));

        const unreadCount = c.unreadCount || 0;
        const lastFromOther = c.lastMessage && String(c.lastMessage?.senderId?._id) !== String(user?._id);
        const isUnread = unreadCount > 0 && lastFromOther;

        return (
          <div
            key={c._id}
            onClick={() => navigate(`/chat/${c._id}`)}
            className="p-4 border-b cursor-pointer hover:bg-gray-100 flex items-start justify-between"
          >
            <div>
              <div className={`${isUnread ? "font-bold" : "font-semibold"}`}>{otherUser?.username || "User"}</div>
              <div className={`text-sm truncate ${isUnread ? "text-gray-800" : "text-gray-500"}`}>
                {c.lastMessage?.text || "No messages yet"}
              </div>
            </div>

            {unreadCount > 0 && (
              <div className="ml-2">
                <span className="inline-flex items-center justify-center bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
