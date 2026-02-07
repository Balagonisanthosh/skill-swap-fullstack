import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Schema-aligned skill names
  const [knownSkillInput, setKnownSkillInput] = useState("");
  const [skillsYouKnown, setSkillsYouKnown] = useState([]);

  const [learnSkillInput, setLearnSkillInput] = useState("");
  const [skillsYouWantToLearn, setSkillsYouWantToLearn] = useState([]);

  // ✅ Profile image
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Add skill on Enter
  const addSkill = (e, inputValue, setInput, skills, setSkills) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setSkills([...skills, inputValue.trim()]);
      setInput("");
    }
  };

  // Remove skill
  const removeSkill = (index, skills, setSkills) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Handle photo select
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setPhotoName(file.name);
  };

  // Submit form
  const handleSubmitButton = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // ✅ Basic fields
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);

      // ✅ Schema-matching skill fields
      formData.append(
        "skillsYouKnown",
        JSON.stringify(skillsYouKnown)
      );
      formData.append(
        "skillsYouWantToLearn",
        JSON.stringify(skillsYouWantToLearn)
      );

      // ✅ Profile image (Cloudinary)
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
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful 🎉");
      navigate("/login");

    } catch (error) {
      console.error("Register error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        onSubmit={handleSubmitButton}
      >
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
            placeholder="Enter username"
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
            placeholder="abc@gmail.com"
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
            placeholder="********"
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profile Photo */}
        <div className="mb-5">
          <label className="block mb-2 font-medium">Profile Photo</label>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="w-fit px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
            >
              Upload Photo
            </button>

            {photoName && (
              <p className="text-sm text-gray-600">
                ✅ Uploaded:{" "}
                <span className="font-medium">{photoName}</span>
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* Skills You Know */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Skills You Know</label>
          <input
            type="text"
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
            placeholder="Type a skill and press Enter"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap gap-2 mt-3">
            {skillsYouKnown.map((skill, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() =>
                    removeSkill(index, skillsYouKnown, setSkillsYouKnown)
                  }
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Skills You Want To Learn */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">
            Skills You Want to Learn
          </label>
          <input
            type="text"
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
            placeholder="Type a skill and press Enter"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-wrap gap-2 mt-3">
            {skillsYouWantToLearn.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Account
        </button>

        {/* Login Redirect */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
