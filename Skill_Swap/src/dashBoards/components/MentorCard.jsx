import React from "react";
import { FaCommentDots } from "react-icons/fa";

const MentorCard = ({ mentor, request, onViewDetails, onChatClick }) => {
  const u = mentor.userId || {};

  return (
    <div
      key={mentor._id}
      className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition flex flex-col relative"
    >
      {request?.status === "accepted" && (
        <button
          onClick={() => onChatClick(u._id)}
          title="Chat with mentor"
          className="absolute top-4 right-4 w-9 h-9 rounded-full
                     bg-blue-600 text-white flex items-center justify-center
                     hover:bg-blue-700 transition"
        >
          <FaCommentDots size={16} />
        </button>
      )}

      <div className="p-6 flex items-center gap-4">
        {u.profileImage ? (
          <img
            src={u.profileImage}
            alt={u.username}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {u.username?.[0]?.toUpperCase()}
          </div>
        )}

        <div>
          <h3 className="font-semibold">{u.username}</h3>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      </div>

      <div className="px-6 pb-6 text-sm text-gray-600 flex-1">
        <p className="mb-2 line-clamp-2">
          <span className="font-medium">Bio:</span> {mentor.bio || "No bio provided"}
        </p>

        <p className="mb-2">
          <span className="font-medium">Experience:</span> {mentor.experienceYears || 0} years
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="font-medium">Skills:</span>
          {mentor.skills?.map((s, i) => (
            <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        {request ? (
          <button disabled className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-xl">
            Request {request.status}
          </button>
        ) : (
          <button
            onClick={() => onViewDetails(mentor)}
            className="w-full border border-blue-600 text-blue-600 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorCard;
