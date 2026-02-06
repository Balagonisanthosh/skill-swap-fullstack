import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

// Public Pages
import App from "./App";
import Register from "./pages/Register";
import Login from "./pages/Login";

// User Dashboards
import UserDashBoards from "./dashBoards/UserDashBoards";
import ProfilePage from "./dashBoards/ProfilePage";

// Mentor Pages
import MentorsPage from "./pages/mentor/MentorDashboard";
import MentorSetupProfile from "./pages/mentor/MentorSetupProfile";
import MentorEntry from "./pages/mentor/MentorEntry";

// Admin Dashboard
import AdminLayout from "./dashBoards/adminDashboard/AdminLayout";
import AdminHome from "./dashBoards/adminDashboard/pages/AdminHome";
import Users from "./dashBoards/adminDashboard/pages/Users";
import Mentors from "./dashBoards/adminDashboard/pages/Mentors";
import MentorRequests from "./dashBoards/adminDashboard/pages/MentorRequests";
import Reports from "./dashBoards/adminDashboard/pages/Reports";
import Settings from "./dashBoards/adminDashboard/pages/Settings";

// Protected Routes
import ProtectedRoute from "../routes/protectedRoutes";
import MentorProtectedRoute from "../routes/MentorProtectedRoutes";

const router = createBrowserRouter([
  // ---------- PUBLIC ----------
  { path: "/", element: <App /> },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },

  // ---------- PROTECTED ROUTES ----------
  {
    element: <ProtectedRoute />,
    children: [
      // { path: "/dashboard", element: <UserDashBoards /> },
      {path:"/dashboard",element:<UserDashBoards/>},
      { path: "/profile", element: <ProfilePage /> },

      // ===== MENTOR ROUTES (ALL UNDER /mentor) =====
      {
        path: "/mentor",
        children: [
          {
            index: true,
            element: <MentorEntry />, // /mentor
          },
          {
            path: "setup-profile",
            element: <MentorSetupProfile />, // /mentor/setup-profile
          },
          {
            path: "dashboard",
            element: (
              <MentorProtectedRoute>
                <MentorsPage />
              </MentorProtectedRoute>
            ), // /mentor/dashboard
          },
        ],
      },
    ],
  },

  // ---------- ADMIN ROUTES ----------
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "users", element: <Users /> },
      { path: "mentors", element: <Mentors /> },
      { path: "mentor-requests", element: <MentorRequests /> },
      { path: "reports", element: <Reports /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
