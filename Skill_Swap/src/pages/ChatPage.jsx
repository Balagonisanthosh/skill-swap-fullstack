import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import ChatSidebar from "../components/ChatSidebar";
import axios from 'axios';

export default function ChatPage() {
  const { conversationId } = useParams();

  const {
    conversation,
    messages,
    sendMessage,
    setMessages,
    cleanupChat,
    openConversationById,
  } = useChatStore();

  const { token, user } = useAuthStore();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // ================= LOAD CHAT =================
  useEffect(() => {
    if (!conversationId || !token || !user?._id) return;

    // Load messages and open socket room via the chat store
    openConversationById(conversationId, token, user._id);

    return () => cleanupChat();
  }, [conversationId, token, user]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex h-screen">
        <ChatSidebar />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a conversation to start chatting
        </div>
      </div>
    );
  }

  // ================= SEND HANDLER =================
  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage(conversation._id, text, user);
    setText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar />

      {/* CHAT WINDOW */}
      <div className="flex-1 flex flex-col">
        
        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(() => {
            // determine other participant id from messages
            const otherUserId = messages.find((mm) => mm.senderId?._id !== user?._id)?.senderId?._id;

            // find last message sent by me
            const lastSentByMe = [...messages].reverse().find((mm) => mm.senderId?._id === user?._id);

            return messages.map((m) => {
              const isMe = m.senderId?._id === user?._id;
              const isLastSentByMe = lastSentByMe && String(m._id) === String(lastSentByMe._id);

              return (
                <div
                  key={m._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm shadow
                    ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }
                  `}
                  >
                    {!isMe && (
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        {m.senderId?.username}
                      </div>
                    )}
                    <div>{m.text}</div>

                    {isMe && isLastSentByMe && otherUserId && (
                      <div className="text-xs text-gray-300 mt-1 text-right">
                        {Array.isArray(m.readBy) && m.readBy.some((id) => String(id) === String(otherUserId)) ? (
                          <span className="text-xs text-gray-200">Seen</span>
                        ) : (
                          <span className="text-xs text-gray-200">Sent</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 flex gap-2 bg-white border-t">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border rounded-full px-4 py-2 outline-none
                       focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message…"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700
                       text-white px-5 rounded-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
