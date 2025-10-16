import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <Link to="/" style={{ color: "white", marginRight: "15px" }}>🏠 Home</Link>
      {isLoggedIn && (
        <>
          <Link to="/profile" style={{ color: "white", marginRight: "15px" }}>👤 Profile</Link>
          <Link to="/users" style={{ color: "white", marginRight: "15px" }}>👥 Users</Link>
          <button onClick={handleLogout} style={{ background: "red", color: "white", border: "none", cursor: "pointer" }}>Logout</button>
        </>
      )}
      {!isLoggedIn && (
        <>
          <Link to="/login" style={{ color: "white", marginRight: "15px" }}>Login</Link>
          <Link to="/register" style={{ color: "white" }}>Register</Link>
        </>
      )}
    </nav>
  );
}