import React, { useState } from "react";

const RequestMentorForm = ({ onClose }) => {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [video, setVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video) {
      return alert("Please upload a video");
    }
    if (submitting) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("linkedInURL", linkedinUrl);
    formData.append("uploadVideo", video);

    try {
      const res = await fetch(
        "http://localhost:3000/api/auth/user/applyMentor",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      alert("Mentor request sent successfully!");
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative"
    >
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        Request to Become a Mentor
      </h2>

      {/* LinkedIn */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">LinkedIn Profile URL</label>
        <input
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Video */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">
          Upload Demo Teaching Video
        </label>
        <input
          type="file"
          accept="video/*"
          required
          onChange={(e) => setVideo(e.target.files[0])}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 border border-gray-400 py-2 rounded hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className={`w-1/2 py-2 rounded text-white ${
            submitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default RequestMentorForm;
