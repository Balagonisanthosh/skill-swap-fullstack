import React, { useState, useRef, useEffect } from "react";
import RequestMentorForm from "./RequestMentorForm";
import Dashboard_Navbar from "./Dashboard_Navbar";
import { useAuthStore } from "../store/authStore";

const ProfilePage = () => {
  const {
    user: authUser,
    updateProfile,
    isLoading,
    mentorRequest,
    mentorRequestLoading,
    getMyMentorRequestStatus,
  } = useAuthStore();

  const [showMentorForm, setShowMentorForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    username: "",
    email: "",
    profileImage: null,
    skillsYouKnown: [],
    skillsYouWantToLearn: [],
  });

  const [profileImageFile, setProfileImageFile] = useState(null);

  // ================= FETCH MENTOR REQUEST =================
  useEffect(() => {
    getMyMentorRequestStatus();
  }, [getMyMentorRequestStatus]);

  // ================= SYNC AUTH USER =================
  useEffect(() => {
    if (!authUser) return;

    setUser({
      username: authUser.username || "",
      email: authUser.email || "",
      profileImage: authUser.profileImage
        ? `${authUser.profileImage}?t=${Date.now()}`
        : `https://api.dicebear.com/7.x/initials/svg?seed=${authUser.username?.charAt(
            0
          )}`,
      skillsYouKnown: authUser.skillsYouKnown || [],
      skillsYouWantToLearn: authUser.skillsYouWantToLearn || [],
    });

    setProfileImageFile(null);
  }, [authUser]);

  // ================= HANDLERS =================
  const handleChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageFile(file);

    setUser((prev) => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile({
        username: user.username,
        skillsYouKnown: user.skillsYouKnown,
        skillsYouWantToLearn: user.skillsYouWantToLearn,
        photo: profileImageFile,
      });

      if (updatedUser?.profileImage) {
        setUser((prev) => ({
          ...prev,
          profileImage: `${updatedUser.profileImage}?t=${Date.now()}`,
        }));
      }

      setProfileImageFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  return (
    <>
      <Dashboard_Navbar />

      <div className="bg-gray-50 flex justify-center px-4 py-10">
        <div className="bg-white p-6 rounded-xl shadow w-full max-w-lg">
          {/* ===== HEADER ===== */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                isEditing
                  ? "bg-gray-200 text-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* ===== PROFILE IMAGE ===== */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border"
            />

            {isEditing && (
              <>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-2 text-blue-600 text-sm"
                >
                  Change Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </>
            )}
          </div>

          {/* ===== PROFILE DETAILS ===== */}
          <ProfileRow label="Username">
            {isEditing ? (
              <input
                value={user.username}
                onChange={(e) =>
                  handleChange("username", e.target.value)
                }
                className="input"
              />
            ) : (
              user.username
            )}
          </ProfileRow>

          <ProfileRow label="Email">{user.email}</ProfileRow>

          <ProfileRow label="Skills You Have">
            {isEditing ? (
              <input
                value={user.skillsYouKnown.join(", ")}
                onChange={(e) =>
                  handleChange(
                    "skillsYouKnown",
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
                className="input"
              />
            ) : (
              user.skillsYouKnown.join(", ")
            )}
          </ProfileRow>

          <ProfileRow label="Skills To Learn">
            {isEditing ? (
              <input
                value={user.skillsYouWantToLearn.join(", ")}
                onChange={(e) =>
                  handleChange(
                    "skillsYouWantToLearn",
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
                className="input"
              />
            ) : (
              user.skillsYouWantToLearn.join(", ")
            )}
          </ProfileRow>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          )}

          {/* ===== MENTOR REQUEST STATUS ===== */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Mentor Request Status</h3>

            {mentorRequestLoading && <p>Loading...</p>}

            {!mentorRequest && <p>You haven’t applied yet.</p>}

            {mentorRequest?.status === "pending" && (
              <p className="text-yellow-600">⏳ Request under review</p>
            )}

            {mentorRequest?.status === "approved" && (
              <p className="text-green-600">🎉 Approved as mentor</p>
            )}

            {mentorRequest?.status === "rejected" && (
              <div className="bg-red-50 border p-3 rounded">
                <p className="text-red-600 font-semibold">❌ Rejected</p>
                <p className="text-sm">
                  <strong>Reason:</strong>{" "}
                  {mentorRequest.rejectionReason || "No reason provided"}
                </p>
              </div>
            )}
          </div>

          {/* ===== ACTION BUTTON ===== */}
          {mentorRequest?.status !== "pending" && (
            <button
              onClick={() => setShowMentorForm(true)}
              disabled={mentorRequest?.status === "approved"}
              className={`mt-4 px-5 py-2 border rounded transition
                ${
                  mentorRequest?.status === "approved"
                    ? "border-gray-400 text-gray-400 cursor-not-allowed"
                    : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                }
              `}
            >
              {mentorRequest?.status === "approved"
                ? "Already a Mentor"
                : mentorRequest?.status === "rejected"
                ? "Re-apply as Mentor"
                : "Request as Mentor"}
            </button>
          )}
        </div>
      </div>

      {showMentorForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <RequestMentorForm onClose={() => setShowMentorForm(false)} />
        </div>
      )}
    </>
  );
};

const ProfileRow = ({ label, children }) => (
  <div className="flex justify-between mb-3">
    <span className="text-gray-500">{label}</span>
    <span>{children}</span>
  </div>
);

export default ProfilePage;
