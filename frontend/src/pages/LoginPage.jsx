import React, { useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { handleFrontendError } from "../common/FrontendCommonIssues";

export default function Login({ onLogin }){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleLogin = async (e) => {
  e.preventDefault();
  try {
      const res = await api.post("/auth/login", { username, password });
      const role = res.data.role.toUpperCase();

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      // ⚡ Gọi callback để App update state role
      onLogin(role);

      if (role === "ADMIN") navigate("/admin/home", { replace: true });
      else if (role === "USER") navigate("/user/home", { replace: true });
    } catch (err) {
      handleFrontendError(err);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white shadow-md rounded-3xl overflow-hidden w-96">
        <div className="bg-gradient-to-b from-yellow-500 to-yellow-400 text-white text-center py-10 rounded-b-[50px]">
          <h2 className="text-3xl font-bold">
            Welcome<br />Back
          </h2>
          <p className="mt-2 text-sm">Please sign-in to continue!</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email"
              className="border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right text-sm text-gray-400">
              <a href="#" className="hover:text-yellow-500">
                Forget your password?
              </a>
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-white font-semibold py-2 rounded-full mt-2 transition"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-yellow-500 font-medium hover:underline"
            >
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
