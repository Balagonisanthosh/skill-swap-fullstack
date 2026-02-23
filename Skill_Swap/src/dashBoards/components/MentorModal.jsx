import React from "react";

const MentorModal = ({ selectedMentor, request, onClose, onSendRequest }) => {
  if (!selectedMentor) return null;

  const u = selectedMentor.userId || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">
          ✕
        </button>

        <h2 className="text-xl font-bold">{u.username}</h2>
        <p className="text-sm text-gray-500 mb-4">{u.email}</p>

        <p className="mb-2">
          <span className="font-medium">Bio:</span> {selectedMentor.bio}
        </p>

        <p className="mb-2">
          <span className="font-medium">Experience:</span> {selectedMentor.experienceYears} years
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {selectedMentor.skills?.map((s, i) => (
            <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {s}
            </span>
          ))}
        </div>

        {request ? (
          <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl">
            Request {request.status}
          </button>
        ) : (
          <button onClick={() => onSendRequest(selectedMentor)} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700">
            Send Connection Request
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorModal;
