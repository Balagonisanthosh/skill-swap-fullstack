import { create } from "zustand";

// const API_URL = "http://localhost:3000/api/auth";

const API_URL="https://skill-swap-fullstack.onrender.com/api/auth"

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  mentorRequest: null,
  mentorRequestLoading: false,

  // ================= CORE HELPER =================
  fetchWithAuth: async (url, options = {}) => {
    let token = localStorage.getItem("token");

    let response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.status !== 401) {
      return response;
    }

    // 🔁 Try refresh once
    const refreshRes = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      get().logout();
      throw new Error("Session expired");
    }

    const { accessToken } = await refreshRes.json();
    localStorage.setItem("token", accessToken);
    set({ token: accessToken });

    // 🔁 Retry original request
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });
  },

  // ================= LOGIN =================
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.accessToken);

      set({
        user: data.user,
        token: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      await get().getMyMentorRequestStatus();
      return true;
    } catch (err) {
      set({
        error: err.message,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  },

  // ================= FETCH PROFILE =================
  fetchProfile: async () => {
    set({ isLoading: true });

    try {
      const res = await get().fetchWithAuth(`${API_URL}/profile`);
      const data = await res.json();

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      await get().getMyMentorRequestStatus();
    } catch {
      set({ isLoading: false });
    }
  },

  // ================= UPDATE PROFILE =================
  updateProfile: async (profileData) => {
    set({ isLoading: true });

    const formData = new FormData();
    if (profileData.username) formData.append("username", profileData.username);
    if (profileData.skillsYouKnown)
      formData.append("skillsYouKnown", JSON.stringify(profileData.skillsYouKnown));
    if (profileData.skillsYouWantToLearn)
      formData.append("skillsYouWantToLearn", JSON.stringify(profileData.skillsYouWantToLearn));
    if (profileData.photo instanceof File)
      formData.append("photo", profileData.photo);

    const res = await get().fetchWithAuth(`${API_URL}/profile`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    set({ user: data.user, isLoading: false });
    return data.user;
  },

  // ================= MENTOR REQUEST STATUS =================
  getMyMentorRequestStatus: async () => {
    set({ mentorRequestLoading: true });

    try {
      const res = await get().fetchWithAuth(`${API_URL}/mentor-request/user`);
      const data = await res.json();

      set({
        mentorRequest: data.request,
        mentorRequestLoading: false,
      });
    } catch {
      set({ mentorRequestLoading: false });
    }
  },

  // ================= FETCH MENTORS =================
  fetchMentorsList: async () => {
    try {
      const res = await get().fetchWithAuth(`${API_URL}/mentorsList`);
      const data = await res.json();
      return data.mentors || [];
    } catch {
      return [];
    }
  },

  // ================= CONNECTION REQUEST =================
sendConnectionRequest: async (mentorId, message) => {
  try {
    const res = await get().fetchWithAuth(
      `${API_URL}/connectionRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorId,
          message,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send request");
    }

    return data;
  } catch (error) {
    throw error;
  }
},

// ================= FETCH USER CONNECTION REQUESTS =================
fetchUserConnectionRequests: async () => {
  try {
    const res = await get().fetchWithAuth(
      `${API_URL}/connectionRequest/user`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch user requests");
    }

    return data.requests || [];
  } catch (error) {
    console.error("Fetch user connection requests error:", error);
    return [];
  }
},

// ================= FETCH MENTOR CONNECTION REQUESTS =================
fetchMentorConnectionRequests: async () => {
  try {
    const res = await get().fetchWithAuth(
      `${API_URL}/connectionRequest/mentor`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch mentor requests");
    }

    return data|| [];
  } catch (error) {
    console.error("Fetch mentor connection requests error:", error);
    return [];
  }
},

// ================= ACCEPT / REJECT CONNECTION REQUEST =================
respondToConnectionRequest: async (requestId, status) => {
  try {
    const res = await get().fetchWithAuth(
      `${API_URL}/connectionRequest/${requestId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }), // accepted | rejected
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update request");
    }

    return data;
  } catch (error) {
    throw error;
  }
},


  // ================= LOGOUT =================
  logout: async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
      mentorRequest: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
