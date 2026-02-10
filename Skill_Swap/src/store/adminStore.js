import { create } from "zustand";

const ADMIN_API_URL = "http://localhost:3000/api/admin";
const AUTH_API_URL = "http://localhost:3000/api/auth";

// const ADMIN_API_URL="https://skill-swap-fullstack.onrender.com/api/admin";
// const AUTH_API_URL="https://skill-swap-fullstack.onrender.com/api/auth"


const useAdminStore = create((set, get) => ({
  dashboardStats: {
    totalUsers: 0,
    approvedMentors: 0,
    pendingMentors: 0,
    rejectedMentors: 0,
  },
  loading: false,
  error: null,

  // ================= DASHBOARD STATS =================
  fetchDashboardStats: async () => {
    try {
      set({ loading: true, error: null });

      let token = localStorage.getItem("token");

      let res = await fetch(`${ADMIN_API_URL}/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      // 🔁 refresh on 401
      if (res.status === 401) {
        const refreshRes = await fetch(`${AUTH_API_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          localStorage.removeItem("token");
          return set({ loading: false });
        }

        const refreshData = await refreshRes.json();
        token = refreshData.accessToken;
        localStorage.setItem("token", token);

        res = await fetch(`${ADMIN_API_URL}/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
      }

      if (!res.ok) throw new Error("Failed to fetch dashboard stats");

      const data = await res.json();

      set({
        dashboardStats: {
          totalUsers: data.data.totalUsers,
          approvedMentors: data.data.approvedMentors,
          pendingMentors: data.data.pendingMentors,
          rejectedMentors: data.data.rejectedMentors ?? 0,
        },
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message || "Something went wrong",
        loading: false,
      });
    }
  },

  // ================= DELETE MENTOR =================
  deleteMentorById: async (mentorId) => {
    try {
      set({ loading: true, error: null });

      let token = localStorage.getItem("token");

      let res = await fetch(
        `${ADMIN_API_URL}/deleteMentor/${mentorId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (res.status === 401) {
        const refreshRes = await fetch(`${AUTH_API_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("Session expired");

        const refreshData = await refreshRes.json();
        token = refreshData.accessToken;
        localStorage.setItem("token", token);

        res = await fetch(
          `${ADMIN_API_URL}/deleteMentor/${mentorId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
      }

      if (!res.ok) throw new Error("Failed to remove mentor");

      alert("mentor deleted successfully");

      await get().fetchDashboardStats();
      set({ loading: false });
    } catch (error) {
      set({
        error: error.message || "Something went wrong",
        loading: false,
      });
    }
  },

  // ================= DELETE USER =================
  deleteUserById: async (userId) => {
    try {
      set({ loading: true, error: null });

      let token = localStorage.getItem("token");

      let res = await fetch(
        `${ADMIN_API_URL}/deleteUser/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (res.status === 401) {
        const refreshRes = await fetch(`${AUTH_API_URL}/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("Session expired");

        const refreshData = await refreshRes.json();
        token = refreshData.accessToken;
        localStorage.setItem("token", token);

        res = await fetch(
          `${ADMIN_API_URL}/deleteUser/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );
      }

      if (!res.ok) throw new Error("Failed to remove user");

      alert("user deleted successfully");

      await get().fetchDashboardStats();
      set({ loading: false });
    } catch (error) {
      set({
        error: error.message || "Something went wrong",
        loading: false,
      });
    }
  },
}));

export default useAdminStore;
