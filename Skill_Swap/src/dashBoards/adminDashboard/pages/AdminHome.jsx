import { useEffect } from "react";
import useAdminStore from "../../../store/adminStore";

const AdminHome = () => {
  const {
    dashboardStats,
    fetchDashboardStats,
    loading,
    error,
  } = useAdminStore();

  const {
    totalUsers,
    approvedMentors,
    pendingMentors,
    rejectedMentors, 
  } = dashboardStats;

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold">{totalUsers}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Approved Mentors</p>
          <h2 className="text-3xl font-bold">{approvedMentors}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Pending Requests</p>
          <h2 className="text-3xl font-bold">{pendingMentors}</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Rejected Requests</p>
          <h2 className="text-3xl font-bold">{rejectedMentors}</h2>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
