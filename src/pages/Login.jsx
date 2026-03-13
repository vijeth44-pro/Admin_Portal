import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import DarkVeil from "../components/DarkVeil";

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    useremail: "",
    userpassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:9000/admin/auth/login",
        form
      );

      if (res.data.success) {
        localStorage.setItem("admintoken", res.data.token);
        alert("Admin logged in successfully");
        onLogin && onLogin();
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center py-6 min-h-screen">
      <div className="w-full max-w-5xl h-[650px] bg-white rounded-4xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden md:flex relative overflow-hidden text-white">
          <div className="absolute inset-0">
            <DarkVeil
              hueShift={0}
              noiseIntensity={0}
              scanlineIntensity={0}
              speed={1.1}
              scanlineFrequency={0}
              warpAmount={0}
            />
          </div>

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10 flex flex-col justify-between p-6 w-full">
            <div>
              <p className="text-sm opacity-80 mb-4">Admin Panel</p>
              <h1 className="text-4xl font-bold leading-snug">
                Control & Manage
                <br />
                Your Platform
              </h1>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Sign In
          </h2>
          <p className="text-gray-500 mb-8">
            Please login to continue.
          </p>

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="useremail"
                value={form.useremail}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="userpassword"
                  value={form.userpassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-br from-blue-500/90 to-blue-700/60 backdrop-blur-xl border border-white/40 text-white font-semibold shadow-[0_10px_40px_rgba(37,99,235,0.45)] hover:shadow-[0_12px_50px_rgba(37,99,235,0.65)] hover:scale-[1.03] transition-all duration-300"
            >
              Login
            </button>
          </div>

          {/* Links */}
          <div className="flex justify-between mt-6 text-sm text-gray-600">
            <Link to="/forgot-password" className="hover:text-blue-600">
              Forgot Password?
            </Link>
            <Link to="/register" className="hover:text-blue-600">
              Create Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}