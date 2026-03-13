import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import AdminDashboard from "./pages/AdminDashboard";
import AdminJobs from "./pages/AdminJobs";
import AdminUsers from "./pages/AdminUsers";
import Applications from "./pages/Applications";

const App = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    !!localStorage.getItem("admintoken")
  );

  const handleLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admintoken");
    setIsAdminLoggedIn(false);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAdminLoggedIn ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {isAdminLoggedIn && (
        <>
          <Route
            path="/dashboard"
            element={<AdminDashboard onLogout={handleLogout} />}
          />
          <Route path="/dashboard/jobs" element={<AdminJobs />} />
          <Route path="/dashboard/users" element={<AdminUsers />} />
          <Route path="/dashboard/applications" element={<Applications />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;