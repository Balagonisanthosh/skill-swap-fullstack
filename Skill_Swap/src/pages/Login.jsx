import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, error } = useAuthStore();

  const handleLoginDetails = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        onSubmit={handleLoginDetails}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Login
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            placeholder="abc@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            placeholder="********"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {error}
          </p>
        )}

        {/* Forgot password */}
        <div className="text-right mb-4">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Register Redirect */}
        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
