import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useState } from "react";
// import { useEffect } from "react";

// ✅ ADMIN PAGES
import AdminHome from "./pages/adminPage/AdminHome";
import ManageMenu from "./pages/adminPage/ManageMenu";
import ManageTables from "./pages/adminPage/ManageTables";
import Report from "./pages/adminPage/Report";

// ✅ USER PAGES
import UserHome from "./pages/userPage/UserHome";
import MenuPage from "./pages/userPage/Menu";
import BookTablePage from "./pages/userPage/BookTable";
import TableStatusPage from "./pages/userPage/TableStatus";
import ProfilePage from "./pages/ProfilePage";

export default function App() {


  // Lấy role từ localStorage khi App mount
const [role, setRole] = useState(sessionStorage.getItem("role") || null);



  return (
    <Routes>
      {/* 🔐 Auth Routes */}
       <Route
        path="/"
        element={<Login onLogin={(newRole) => setRole(newRole)} />}
      />
      <Route path="/register" element={<RegisterPage />} />

      {/* 🧑‍💼 ADMIN ROUTES */}
      <Route
        path="/admin/home"
        element={role === "ADMIN" ? <AdminHome /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/menu"
        element={role === "ADMIN" ? <ManageMenu /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/tables"
        element={
          role === "ADMIN" ? <ManageTables /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/admin/report"
        element={role === "ADMIN" ? <Report /> : <Navigate to="/" replace />}
      />

      {/* 👥 USER ROUTES */}
      <Route
        path="/user/home"
        element={role === "USER" ? <UserHome /> : <Navigate to="/" replace />}
      />
      <Route
        path="/user/menu"
        element={role === "USER" ? <MenuPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/user/book-table"
        element={
          role === "USER" ? <BookTablePage /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/user/table-status"
        element={
          role === "USER" ? <TableStatusPage /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/user/profile"
        element={
          role === "USER" ? <ProfilePage /> : <Navigate to="/" replace />
        }
      />

      {/* 🚫 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
