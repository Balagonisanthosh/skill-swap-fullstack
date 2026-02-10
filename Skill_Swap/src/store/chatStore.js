import { create } from "zustand";
import { chatApi } from "../api/chatApi";
import { connectSocket, disconnectSocket } from "../socket/Socket";

export const useChatStore = create((set, get) => ({
  // ================= STATE =================
  conversation: null,
  conversations: [],
  messages: [],
  socket: null,
  loading: false,
  loadingConversations: false,
 
  // 🔑 VERY IMPORTANT
  currentUserId: null,
  setMessages:(messages)=>set({messages}),

  // ================= FETCH CONVERSATIONS (SIDEBAR) =================
  fetchConversations: async () => {
    try {
      set({ loadingConversations: true });
      const data = await chatApi.getConversations();
      set({ conversations: data || [], loadingConversations: false });
    } catch (error) {
      console.error("fetchConversations error:", error);
      set({ loadingConversations: false });
    }
  },

  // ================= START / CREATE CONVERSATION =================
  startConversation: async (receiverId, token, userId) => {
    try {
      set({ loading: true, currentUserId: userId });

      let response;
      try {
        response = await chatApi.getOrCreateConversation(receiverId);
      } catch (apiErr) {
        console.error("getOrCreateConversation API error:", apiErr);
        throw new Error(apiErr.message || "Failed to get or create conversation");
      }

      const convo = response?.conversation || response;
      if (!convo || !convo._id) {
        console.error("Invalid conversation response:", response);
        throw new Error("Invalid conversation returned from server: null");
      }

      const socket = connectSocket(token);
      socket.emit("joinRoom", convo._id);

      socket.off("receiveMessage");
      socket.on("receiveMessage", (msg) => {
        const myId = get().currentUserId;

        // If this is my own message, try to replace optimistic temp message
        if (msg.senderId?._id === myId) {
          set((state) => {
            // find temp optimistic message matching by text and temp id pattern
            const tempIndex = state.messages.findIndex(
              (m) => typeof m._id === "string" && m._id.startsWith("temp-") && m.text === msg.text
            );

            if (tempIndex !== -1) {
              const updated = [...state.messages];
              updated[tempIndex] = msg;
              return { messages: updated };
            }

            // otherwise ensure we don't duplicate
            const exists = state.messages.some((m) => m._id === msg._id);
            if (exists) return state;
            return { messages: [...state.messages, msg] };
          });
          return;
        }

        // For others' messages, append if not present and update conversations unread
        set((state) => {
          const exists = state.messages.some((m) => m._id === msg._id);
          if (exists) return state;

          const messages = [...state.messages, msg];

          const conversations = (state.conversations || []).map((c) => {
            if (String(c._id) === String(msg.conversationId)) {
              const last = msg;
              let unread = c.unreadCount || 0;
              // if message from other user and this convo isn't currently open, increment
              if (String(msg.senderId?._id) !== String(state.currentUserId)) {
                if (String(state.conversation?._id) !== String(msg.conversationId)) {
                  unread = (unread || 0) + 1;
                }
              }
              return { ...c, lastMessage: last, unreadCount: unread };
            }
            return c;
          });

          return { messages, conversations };
        });
      });

      // listen for read receipts
      socket.off("messagesRead");
      socket.on("messagesRead", ({ conversationId: convId, readerId }) => {
        set((state) => {
          const updated = state.conversations.map((c) => {
            if (String(c._id) === String(convId)) {
              const last = c.lastMessage ? { ...c.lastMessage } : null;
              if (last) {
                last.readBy = last.readBy || [];
                if (!last.readBy.some((id) => String(id) === String(readerId))) {
                  last.readBy = [...last.readBy, readerId];
                }
              }
              const unread = c.unreadCount || 0;
              const newUnread = readerId !== state.currentUserId ? Math.max(0, unread - 1) : 0;
              return { ...c, lastMessage: last, unreadCount: newUnread };
            }
            return c;
          });

          let messages = state.messages;
          if (String(state.conversation?._id) === String(convId)) {
            messages = messages.map((m) => {
              const readBy = Array.isArray(m.readBy) ? [...m.readBy] : [];
              if (!readBy.some((id) => String(id) === String(readerId))) readBy.push(readerId);
              return { ...m, readBy };
            });
          }

          return { conversations: updated, messages };
        });
      });

      // listen for read receipts from other clients
      socket.off("messagesRead");
      socket.on("messagesRead", ({ conversationId: convId, readerId }) => {
        // update conversations list unreadCount and lastMessage.readBy
        set((state) => {
          const updated = state.conversations.map((c) => {
            if (String(c._id) === String(convId)) {
              const last = c.lastMessage ? { ...c.lastMessage } : null;
              if (last) {
                last.readBy = last.readBy || [];
                if (!last.readBy.some((id) => String(id) === String(readerId))) {
                  last.readBy = [...last.readBy, readerId];
                }
              }
              // if reader is not me, reduce unreadCount
              const unread = c.unreadCount || 0;
              const newUnread = readerId !== state.currentUserId ? Math.max(0, unread - 1) : 0;
              return { ...c, lastMessage: last, unreadCount: newUnread };
            }
            return c;
          });

          // also update messages for open conversation
          let messages = state.messages;
          if (String(state.conversation?._id) === String(convId)) {
            messages = messages.map((m) => {
              const readBy = Array.isArray(m.readBy) ? [...m.readBy] : [];
              if (!readBy.some((id) => String(id) === String(readerId))) readBy.push(readerId);
              return { ...m, readBy };
            });
          }

          return { conversations: updated, messages };
        });
      });

      set({
        conversation: convo,
        socket,
        loading: false,
      });

      return convo;
    } catch (error) {
      set({ loading: false });
      console.error("startConversation error:", error);
      throw error;
    }
  },

  // ================= OPEN EXISTING CONVERSATION =================
  openConversationById: async (conversationId, token, userId) => {
    try {
      set({ currentUserId: userId });

      const socket = connectSocket(token);
      socket.emit("joinRoom", conversationId);

      socket.off("receiveMessage");
      socket.on("receiveMessage", (msg) => {
        const myId = get().currentUserId;

        if (msg.senderId?._id === myId) {
          set((state) => {
            const tempIndex = state.messages.findIndex(
              (m) => typeof m._id === "string" && m._id.startsWith("temp-") && m.text === msg.text
            );

            if (tempIndex !== -1) {
              const updated = [...state.messages];
              updated[tempIndex] = msg;
              return { messages: updated };
            }

            const exists = state.messages.some((m) => m._id === msg._id);
            if (exists) return state;
            return { messages: [...state.messages, msg] };
          });
          return;
        }

        set((state) => {
          const exists = state.messages.some((m) => m._id === msg._id);
          if (exists) return state;

          const messages = [...state.messages, msg];

          const conversations = (state.conversations || []).map((c) => {
            if (String(c._id) === String(msg.conversationId)) {
              const last = msg;
              let unread = c.unreadCount || 0;
              if (String(msg.senderId?._id) !== String(state.currentUserId)) {
                if (String(state.conversation?._id) !== String(msg.conversationId)) {
                  unread = (unread || 0) + 1;
                }
              }
              return { ...c, lastMessage: last, unreadCount: unread };
            }
            return c;
          });

          return { messages, conversations };
        });
      });

      const messages = await chatApi.getMessages(conversationId);

      // After server marks messages read, inform other participants via socket
      try {
        socket.emit("messagesRead", { conversationId, readerId: userId });
      } catch (err) {
        console.warn("Failed to emit messagesRead", err);
      }

      // Update local conversations list so sidebar shows no unread for this convo
      set((state) => {
        const updated = state.conversations.map((c) => {
          if (String(c._id) === String(conversationId)) {
            const last = c.lastMessage ? { ...c.lastMessage } : null;
            if (last) {
              // ensure readBy array exists and contains current user
              last.readBy = last.readBy || [];
              if (!last.readBy.some((id) => String(id) === String(userId))) {
                last.readBy = [...last.readBy, userId];
              }
            }
            return { ...c, lastMessage: last, unreadCount: 0 };
          }
          return c;
        });

        return { conversation: { _id: conversationId }, messages, socket, conversations: updated };
      });
    } catch (error) {
      console.error("openConversationById error:", error);
    }
  },

  // ================= SEND MESSAGE (OPTIMISTIC UI) =================
  sendMessage: async (conversationId, text, user) => {
    const { socket } = get();
    if (!socket || !text.trim()) return;
    

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      text,
      conversationId,
      senderId: {
        _id: user._id,
        username: user.username,
      },
      createdAt: new Date().toISOString(),
    };

    // ✅ Add immediately (blue side)
    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    socket.emit("sendMessage", { conversationId, text });
  },

  // ================= CLEANUP =================
  cleanupChat: () => {
    disconnectSocket();
    set({
      conversation: null,
      messages: [],
      socket: null,
      currentUserId: null,
    });
  },
}));
