'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiMail, FiLock } from "react-icons/fi";
import { API_URL } from "../../src/API";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (userId) {
      axios
        .get(`${API_URL}/user?id=${userId}`)
        .then((res) => {
          const user = res.data?.[0];
          if (user?.role === "user") {
            router.push("/");
          } else {
            router.push("/dashboard/dashboard");
          }
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
        });
    }
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const userData = response.data;
      localStorage.setItem("id", userData._id);

      if (userData.role === "user") {
        router.push("/");
      } else {
        router.push("/dashboard/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Enter Correct Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0B1120] px-4 py-12">
      <div className="w-full max-w-md bg-[#131C31] backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#D90429]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#D90429]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title & Brand Accent */}
        <div className="text-center mb-8 relative z-10">
          <span className="inline-block px-3 py-1 bg-[#D90429]/10 border border-[#D90429]/30 text-[#D90429] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
            Admin / User Portal
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            लॉगिन करें
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            आगे बढ़ने के लिए अपना ईमेल और पासवर्ड दर्ज करें
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5 relative z-10">
          
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FiMail size={18} />
              </span>
              <input
                type="email"
                id="email"
                required
                value={email}
                placeholder="name@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0B1120]/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <FiLock size={18} />
              </span>
              <input
                type={isOpen ? "text" : "password"}
                id="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-[#0B1120]/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429] transition-all"
              />
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                aria-label={isOpen ? "Hide password" : "Show password"}
              >
                {isOpen ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#D90429] hover:bg-[#b80322] disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#D90429]/25 flex justify-center items-center cursor-pointer text-sm uppercase tracking-wider"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "लॉग इन करें"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}