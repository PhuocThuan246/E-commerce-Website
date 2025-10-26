// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roleRequired = null }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Nếu chưa đăng nhập
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu quyền admin mà user không phải admin
  if (roleRequired === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
