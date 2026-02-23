import React from "react";

const CategoryBar = ({ categories, activeCategory, setActiveCategory }) => (
  <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => setActiveCategory(cat)}
        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
          activeCategory === cat
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CategoryBar;
