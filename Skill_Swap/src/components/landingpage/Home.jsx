import { BookOpenText } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="bg-pink-200 text-black py-20 px-8 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        
        <div className="max-w-xl">
          <BookOpenText className="w-10 h-10 mb-4" />

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Learn a Skill. Share a Skill.
          </h1>

          <p className="text-lg mb-6">
            Exchange knowledge, grow together, and build real connections.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-gradient-to-r from-purple-500 to-blue-600  hover:text-white transition"
          >
            Get Started
          </button>
        </div>

        <img
          src="/Hero_section.jpeg"
          alt="SkillSwap Hero"
          className="w-[520px] mt-10 md:mt-0 rounded-2xl"
        />
      </div>
    </section>
  );
};

export default Home;
