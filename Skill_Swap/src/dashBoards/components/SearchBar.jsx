import React from "react";

const SearchBar = ({ search, setSearch }) => (
  <div className="mb-6">
    <input
      type="text"
      placeholder="Search mentors by name, email, or skill..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

export default SearchBar;
