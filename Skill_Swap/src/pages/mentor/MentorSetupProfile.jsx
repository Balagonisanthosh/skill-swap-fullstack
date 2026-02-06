import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useMentorStore from "../../store/mentorStore";

const MentorSetupProfile = () => {
  const navigate = useNavigate();
  const {
    createMentorProfile,
    fetchMyMentorProfile,
    loading,
  } = useMentorStore();

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    bio: "",
    skills: "",
    experienceYears: "",
  });

  // 🔐 Redirect if profile already completed
  useEffect(() => {
    const checkProfileStatus = async () => {
      const result = await fetchMyMentorProfile();

      if (result.exists && result.profileCompleted) {
        navigate("/mentor/dashboard", { replace: true });
        return;
      }

      setChecking(false);
    };

    checkProfileStatus();
  }, [fetchMyMentorProfile, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: formData.title.trim(),
      bio: formData.bio.trim(),
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experienceYears: Number(formData.experienceYears),
    };

    const success = await createMentorProfile(payload);

    if (success) {
      alert("Mentor profile created successfully!");
      navigate("/mentor/dashboard", { replace: true });
    } else {
      setError("Failed to create mentor profile. Please try again.");
    }
  };

  // ⏳ While checking mentor status
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Checking mentor profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-2">
          Complete Your Mentor Profile
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          This information will be visible to users looking for mentors.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Professional Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Frontend Developer"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* BIO */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              placeholder="Tell users about your experience and background"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* SKILLS */}
          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <input
              type="text"
              name="skills"
              placeholder="React, JavaScript, Tailwind"
              value={formData.skills}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate skills with commas
            </p>
          </div>

          {/* EXPERIENCE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              name="experienceYears"
              min={0}
              placeholder="3"
              value={formData.experienceYears}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white
                         hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorSetupProfile;
