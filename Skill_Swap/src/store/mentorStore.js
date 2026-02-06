import { create } from "zustand";
import { useAuthStore } from "./authStore";

// ✅ HARD-CODE BASE URL (NO .env)
const BASE_URL = "http://localhost:3000";
const MENTOR_API_URL = `${BASE_URL}/api/mentors`;
const AUTH_API_URL = `${BASE_URL}/api/auth`;

const useMentorStore = create((set) => ({
  mentor: null,
  loading: false,
  error: null,

  // ================= GET MY MENTOR PROFILE =================
  fetchMyMentorProfile: async () => {
    try {
      set({ loading: true, error: null });

      const fetchWithAuth = useAuthStore.getState().fetchWithAuth;

      const res = await fetchWithAuth(
        `${MENTOR_API_URL}/mentor/me`,
        { cache: "no-store" } // ✅ avoid cached 304
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      set({ mentor: data.mentor || null, loading: false });

      return {
        exists: data.exists,
        profileCompleted: data.profileCompleted,
      };
    } catch (err) {
      set({ mentor: null, error: err.message, loading: false });
      return { exists: false, profileCompleted: false };
    }
  },

  // ================= CREATE MENTOR PROFILE =================
  createMentorProfile: async (payload) => {
    try {
      set({ loading: true, error: null });

      const fetchWithAuth = useAuthStore.getState().fetchWithAuth;

      const res = await fetchWithAuth(
        `${MENTOR_API_URL}/mentor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 🔁 refresh token
      const refreshRes = await fetch(`${AUTH_API_URL}/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        localStorage.setItem("token", refreshData.accessToken);
      }

      // ✅ REFRESH AUTH USER (VERY IMPORTANT)
      await useAuthStore.getState().fetchProfile();

      set({ mentor: data.mentor, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },
}));

export default useMentorStore;
