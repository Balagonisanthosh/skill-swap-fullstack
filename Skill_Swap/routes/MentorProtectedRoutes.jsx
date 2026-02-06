import { Navigate } from "react-router-dom";
import { useAuthStore } from "../src/store/authStore";

const MentorProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="p-10">Checking access...</div>;
  }

  if (!user || user.role !== "mentor") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default MentorProtectedRoute;
