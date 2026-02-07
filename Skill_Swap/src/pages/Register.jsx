import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [knownSkillInput, setKnownSkillInput] = useState("");
  const [skillsYouKnown, setSkillsYouKnown] = useState([]);

  const [learnSkillInput, setLearnSkillInput] = useState("");
  const [skillsYouWantToLearn, setSkillsYouWantToLearn] = useState([]);

  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  // ✅ NEW: error state
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const addSkill = (e, inputValue, setInput, skills, setSkills) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setSkills([...skills, inputValue.trim()]);
      setInput("");
    }
  };

  const removeSkill = (index, skills, setSkills) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setPhotoName(file.name);
  };

  const handleSubmitButton = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");       // ✅ clear previous error
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("skillsYouKnown", JSON.stringify(skillsYouKnown));
      formData.append(
        "skillsYouWantToLearn",
        JSON.stringify(skillsYouWantToLearn)
      );

      if (photo) {
        formData.append("photo", photo);
      }

      const response = await fetch(
        "https://skill-swap-fullstack.onrender.com/api/auth/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      alert("Registration successful 🎉");
      navigate("/login");

    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        onSubmit={handleSubmitButton}
      >

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Register
        </h2>

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profile Photo */}
        <div className="mb-5">
          <label className="block mb-2 font-medium">Profile Photo</label>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
          >
            Upload Photo
          </button>

          {photoName && (
            <p className="text-sm text-gray-600 mt-2">
              ✅ Uploaded: <span className="font-medium">{photoName}</span>
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition
            ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          `}
        >
          {loading ? "Loading..." : "Create Account"}
        </button>

        {/* Login Redirect */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
