'use client';

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";
import { 
  FiUserPlus, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiShield, 
  FiFolder, 
  FiCheckSquare,
  FiCheck,
  FiX
} from "react-icons/fi";

const CreateUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("staff");
  const [cateGet, setCateGet] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [acsses, setAcsses] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 4000);
  };

  const onSumbit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !phoneNumber.trim()) {
      showAlert("error", "Input Fields Can't be empty");
      return;
    }

    setLoading(true);
    axios
      .post(`${API_URL}/registerd`, {
        email,
        password,
        phone: phoneNumber,
        byAdmin: true,
        role,
        acsses,
        selectedKeywords,
      })
      .then(async () => {
        showAlert("success", "New User Was Created Successfully!");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setSelectedKeywords([]);
        setAcsses([]);
      })
      .catch((err) => {
        console.error("error in creating user : ", err);
        showAlert(
          "error", 
          err.response?.data?.err || "Failed to create user. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const options = [
    { label: "Top Stories", value: "topstories" },
    { label: "Article", value: "articles" },
    { label: "Dashboard", value: "dashboard" },
    { label: "Breaking News", value: "breakingnews" },
    { label: "Upload", value: "upload" },
    { label: "Create Users", value: "creatuser" },
    { label: "Advertisement", value: "ads" },
    { label: "Live", value: "live" },
    { label: "Poll", value: "poll" },
    { label: "Users", value: "users" },
    { label: "Flash News", value: "flashnews" },
    { label: "Tags & Category", value: "content" },
    { label: "Comments", value: "comment" },
    { label: "Visual Stories", value: "stories" },
    { label: "Videos", value: "videos" },
    { label: "Photos", value: "photos" },
    { label: "Newsletter", value: "newsletter" },
  ];

  // Handle Checkbox Selection
  const handleCheckboxChange = (value) => {
    setAcsses((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Select All or Deselect All Checkboxes
  const handleSelectAllPermissions = (e) => {
    if (e.target.checked) {
      setAcsses(options.map((opt) => opt.value));
    } else {
      setAcsses([]);
    }
  };

  // Handle Multiple Category Selection
  const handleCategorySelect = (e) => {
    const selectedOptionsArr = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedKeywords(selectedOptionsArr);
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/content?type=category`)
      .then((content) => {
        let arr = [];
        for (let i = 0; i < content.data.length; i++) {
          const element = content.data[i];
          arr.push({
            key: element._id,
            value: element.text,
            label: element.text,
          });
        }
        setCateGet(arr);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
          <FiUserPlus size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create New User
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add a new team member and set up their roles & permissions.
          </p>
        </div>
      </div>

      {/* Alert Toast Notification */}
      {alert.message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400"
              : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === "success" ? <FiCheck size={18} /> : <FiX size={18} />}
            <span className="font-medium">{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert({ type: "", message: "" })}
            className="opacity-70 hover:opacity-100"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={onSumbit} className="space-y-6">
          
          {/* User Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={email}
                  placeholder="user@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={phoneNumber}
                  placeholder="+91 9876543210"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  value={password}
                  placeholder="Enter secure password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                User Role
              </label>
              <div className="relative">
                <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="author">Author</option>
                  <option value="journalist">Journalist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Multiple Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiFolder size={14} /> Assigned Categories
              </span>
              <span className="text-[11px] text-gray-400 font-normal">
                (Hold Ctrl / Cmd to select multiple)
              </span>
            </label>
            <select
              multiple
              value={selectedKeywords}
              onChange={handleCategorySelect}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl p-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]"
            >
              {cateGet.map((item) => (
                <option key={item.key} value={item.value} className="py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-slate-700">
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <hr className="border-gray-100 dark:border-slate-800" />

          {/* Module Access / Permissions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FiCheckSquare size={16} className="text-blue-600" /> Module Access Permissions
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                <input
                  type="checkbox"
                  onChange={handleSelectAllPermissions}
                  checked={acsses.length === options.length}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Select All
              </label>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200/60 dark:border-slate-800">
              {options.map((option) => {
                const isChecked = acsses.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border text-xs font-medium ${
                      isChecked
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUserPlus size={18} />
              {loading ? "Creating User..." : "Create User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateUser;