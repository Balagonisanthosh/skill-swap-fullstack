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
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ✅ Add skill on Enter
  const addSkill = (e, inputValue, setInput, skills, setSkills) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!inputValue.trim()) return;
      setSkills([...skills, inputValue.trim()]);
      setInput("");
    }
  };

  // ✅ Remove skill
  const removeSkill = (index, skills, setSkills) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // ✅ Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoName(file.name);
  };

  const handleSubmitButton = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
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

      if (photo) formData.append("photo", photo);

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
      console.error(err);
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
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Register
        </h2>

        {/* Username */}
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Email */}
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Skills You Know */}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Skills you know (press Enter)"
          value={knownSkillInput}
          onChange={(e) => setKnownSkillInput(e.target.value)}
          onKeyDown={(e) =>
            addSkill(
              e,
              knownSkillInput,
              setKnownSkillInput,
              skillsYouKnown,
              setSkillsYouKnown
            )
          }
        />

        <div className="flex flex-wrap gap-2 mt-2">
          {skillsYouKnown.map((skill, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() =>
                  removeSkill(index, skillsYouKnown, setSkillsYouKnown)
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Skills You Want to Learn */}
        <input
          className="w-full border rounded px-3 py-2 mt-4"
          placeholder="Skills you want to learn (press Enter)"
          value={learnSkillInput}
          onChange={(e) => setLearnSkillInput(e.target.value)}
          onKeyDown={(e) =>
            addSkill(
              e,
              learnSkillInput,
              setLearnSkillInput,
              skillsYouWantToLearn,
              setSkillsYouWantToLearn
            )
          }
        />

        <div className="flex flex-wrap gap-2 mt-2">
          {skillsYouWantToLearn.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() =>
                  removeSkill(
                    index,
                    skillsYouWantToLearn,
                    setSkillsYouWantToLearn
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* ✅ Upload Photo */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="w-full border border-dashed border-gray-400 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Upload Profile Photo
          </button>

          {photoName && (
            <p className="text-xs text-gray-500 mt-1">{photoName}</p>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className={`w-full mt-6 py-2 rounded-lg font-semibold ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Loading..." : "Create Account"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
