import React, { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { handleFrontendError } from "../common/FrontendCommonIssues";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { username, email, password,  });
      alert("✅ Đăng ký thành công!");
      navigate("/"); // chuyển về login
    } catch (err) {
      handleFrontendError(err);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Cột bên trái màu vàng */}
      <div className="flex flex-col justify-center items-center bg-gradient-to-b from-yellow-400 to-yellow-500 w-1/3 text-white p-10 rounded-r-[50px]">
        <h1 className="text-4xl font-bold text-center">Join Us</h1>
        <p className="mt-2 text-center text-sm opacity-90">
          Create your account and start your journey
        </p>
      </div>

      {/* Cột bên phải chứa form */}
      <div className="flex flex-1 justify-center items-center bg-white">
        <div className="w-96 p-8">
          <h2 className="text-3xl font-bold text-yellow-500 text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              className="border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-white font-semibold py-2 rounded-full mt-2 transition"
            >
              Signup
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-yellow-500 font-medium hover:underline"
            >
              Signin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
