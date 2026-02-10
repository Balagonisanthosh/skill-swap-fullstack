import { fetchWithAuth } from "./fetchWithAuth";

const BASE_URL = "http://localhost:3000/api/chat";

export const chatApi = {
  // ================= GET OR CREATE CONVERSATION =================
  getOrCreateConversation: (receiverId) =>
    fetchWithAuth(`${BASE_URL}/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
      return data;
    }),

  // ================= GET MESSAGES =================
  getMessages: (conversationId) =>
    fetchWithAuth(`${BASE_URL}/messages/${conversationId}`).then((res) =>
      res.json()
    ),

  // ================= SEND MESSAGE =================
  sendMessage: (conversationId, text) =>
    fetchWithAuth(`${BASE_URL}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text }),
    }).then((res) => res.json()),

  // ================= 🔥 NEW: GET CONVERSATIONS (SIDEBAR) =================
  getConversations: () =>
    fetchWithAuth(`${BASE_URL}/conversations`).then((res) =>
      res.json()
    ),
};
