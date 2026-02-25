import { Navigate } from "react-router-dom";
import { useAuthStore } from "../src/store/authStore";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/access-denied" />;
  }

  return children;
};

export default AdminRoute;