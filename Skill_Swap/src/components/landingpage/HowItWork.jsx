import React from "react";

const HowItWorks = () => {
  return (
    <section id="howtowork" className="py-16 px-8 md:px-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12">
        How SkillSwap Works
      </h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
          <p>List skills you can teach and want to learn.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Match & Connect</h3>
          <p>Find people with complementary skills.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="text-xl font-semibold mb-2">Swap Skills</h3>
          <p>Learn together through sessions and projects.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
