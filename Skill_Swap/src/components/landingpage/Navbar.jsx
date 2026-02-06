import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate=useNavigate();



  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/updated_logo.png"
            alt="logo"
            className="w-10 h-10 object-contain"
          />
          <h2 className="text-xl font-bold text-violet-800">
            SkillSwap
          </h2>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <a href="#home" className="hover:text-white hover:bg-blue-600 px-2 py-1 rounded">
            Home
          </a>
          <a href="#howtowork" className="hover:text-white hover:bg-blue-600 px-2 py-1 rounded">
            How It Works
          </a>
          <a href="#about" className="hover:text-white hover:bg-blue-600 px-2 py-1 rounded">
            About
          </a>
        </nav>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <button className="border-2 border-blue-600 text-blue-600 px-4 py-1 rounded hover:bg-blue-600 hover:text-white transition" onClick={()=>{navigate("/login")}}>
            Login
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div
          className="md:hidden cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col gap-4 px-6 py-4">
            <li>
              <a
                href="#home"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#howtowork"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#about"
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-600"
              >
                About
              </a>
            </li>
            <li>
              <button className="mt-2 border-2 border-blue-600 text-blue-600 px-4 py-1 rounded hover:bg-gradient-to-r from-blue-500 to-purple-600  transition">
                Login
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
