import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMentorStore from "../../store/mentorStore";
import { useAuthStore } from "../../store/authStore";

const MentorEntry = () => {
  const navigate = useNavigate();
  const { fetchMyMentorProfile } = useMentorStore();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    // ⛔ wait until auth is ready
    if (isLoading || !user) return;

    const checkMentor = async () => {
      if (user.role !== "mentor") {
        navigate("/dashboard", { replace: true });
        return;
      }

      const result = await fetchMyMentorProfile();

      if (!result.exists || !result.profileCompleted) {
        navigate("/mentor/setup-profile", { replace: true });
      } else {
        navigate("/mentor/dashboard", { replace: true });
      }
    };

    checkMentor();
  }, [user, isLoading, fetchMyMentorProfile, navigate]);

  return (
    <div className="p-10 text-center text-gray-500">
      Checking mentor access...
    </div>
  );
};

export default MentorEntry;
