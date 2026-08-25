'use client';

import React, { useState, useEffect } from "react";
import { API_URL } from "../../../src/API";
import { 
  FiSearch, 
  FiRotateCcw, 
  FiPlus, 
  FiTrash2, 
  FiAlertTriangle, 
  FiX, 
  FiCheckCircle, 
  FiBarChart2
} from "react-icons/fi";

const Poll = () => {
  const [filterItem, setFilterItem] = useState("id");
  const [filterItemResponse, setFilterItemResponse] = useState("");
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Upload Poll
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([{ text: "" }, { text: "" }]);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const getAllPolls = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/polls`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const pollsData = Array.isArray(data) ? data.reverse() : [];
      setUserData(pollsData);
    } catch (error) {
      console.error("Error fetching polls:", error);
      showNotification("Failed to fetch polls. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPolls();
  }, []);

  const handleDeletePoll = async (id) => {
    try {
      const res = await fetch(`${API_URL}/delete_pool/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.status === 200) {
        showNotification(data.message || "Poll deleted successfully", "success");
      } else {
        showNotification(data.message || "Failed to delete poll", "error");
      }
      getAllPolls();
    } catch (error) {
      console.error("Error deleting poll:", error);
      showNotification("Error in deleting poll", "error");
    }
  };

  const onFilter = async () => {
    if (!filterItemResponse.trim()) {
      getAllPolls();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/polls?${filterItem}=${encodeURIComponent(filterItemResponse)}`
      );
      if (!res.ok) throw new Error("Filter failed");
      const data = await res.json();
      setUserData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showNotification("Error in Filtering", "error");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setFilterItem("id");
    setFilterItemResponse("");
    getAllPolls();
  };

  const createPoll = async () => {
    if (!question.trim()) {
      showNotification("Please enter a poll question", "error");
      return;
    }

    const validOptions = options.filter((opt) => opt.text.trim() !== "");
    if (validOptions.length < 2) {
      showNotification("Please provide at least 2 non-empty options", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          options: validOptions.map((option) => ({
            optionText: option.text,
            votes: 0,
            percentage: 0,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const polls = Array.isArray(data) ? data.reverse() : [];
        setUserData(polls);
        showNotification("Poll Successfully Added", "success");
        handleCancel();
        getAllPolls();
      } else {
        showNotification("Poll Not Added", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Poll Not Added", "error");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setQuestion("");
    setOptions([{ text: "" }, { text: "" }]);
  };

  const addOptionField = () => {
    setOptions([...options, { text: "" }]);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const removeOptionField = (index) => {
    if (options.length <= 2) {
      showNotification("Minimum 2 options are required", "error");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 bg-[#0a0f1d] min-h-screen text-slate-100 font-sans relative">
      
      {/* Toast Notification Alert */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-700 text-emerald-200"
              : "bg-red-950/90 border-red-700 text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheckCircle className="text-emerald-400 text-lg" />
          ) : (
            <FiAlertTriangle className="text-red-400 text-lg" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Title Section */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
          <FiBarChart2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Poll Management
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Create, filter, and view response analytics for public polls.
          </p>
        </div>
      </div>

      {/* Filter Bar & Controls Container */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Select Filter Option */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Filter Parameter
            </label>
            <select
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="id">By ID</option>
              <option value="question">By Question</option>
            </select>
          </div>

          {/* Search Query Input */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Search Query
            </label>
            <input
              type="text"
              value={filterItemResponse}
              onChange={(e) => setFilterItemResponse(e.target.value)}
              placeholder={filterItem === "id" ? "Search by ID..." : "Search by Question..."}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-5 flex gap-3 md:mt-6">
            <button
              onClick={onFilter}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-lg shadow-cyan-950/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiSearch className="text-base" />
              <span>Filter</span>
            </button>
            <button
              onClick={onReset}
              className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-lg shadow-red-950/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiRotateCcw className="text-base" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-lg shadow-emerald-950/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiPlus className="text-base" />
              <span>Add Poll</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        
        {/* Table Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-base font-bold text-slate-200">
            Total Polls ({userData.length})
          </span>
        </div>

        {/* Loading Spinner / Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading polls...
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[50vh]">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#0b1329]/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-semibold">
                  <th className="px-6 py-4 w-[120px]">ID</th>
                  <th className="px-6 py-4 w-[300px]">QUESTION</th>
                  <th className="px-6 py-4">OPTIONS & VOTES</th>
                  <th className="px-6 py-4 w-[120px] text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {userData.length > 0 ? (
                  userData.map((row) => (
                    <tr
                      key={row._id}
                      className="hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      {/* ID Tag */}
                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-xs text-slate-400 block w-[90px] truncate"
                          title={row._id}
                        >
                          {row._id}
                        </span>
                      </td>

                      {/* Question */}
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {row.question}
                      </td>

                      {/* Options & Votes List */}
                      <td className="px-6 py-4">
                        <ul className="space-y-1 text-xs">
                          {row.options?.map((option, idx) => (
                            <li key={idx} className="text-slate-300 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                              <span className="font-semibold text-slate-100">{option.optionText}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">Votes: {option.votes}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-cyan-400 font-mono">
                                {option.percentage ? option.percentage.toFixed(0) : 0}%
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Delete Action Button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePoll(row._id)}
                          className="bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-300 border border-red-800/60 font-medium text-xs py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <FiTrash2 className="text-xs" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16 text-slate-500 font-medium"
                    >
                      No polls found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Poll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Cross Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <span className="text-cyan-400">📊</span> Create New Poll
            </h3>

            {/* Question Field */}
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                Poll Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Options List */}
            <div className="mb-4 space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Options
              </label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOptionField(index)}
                      className="text-slate-500 hover:text-red-400 p-2 transition cursor-pointer"
                      title="Remove option"
                    >
                      <FiX className="text-lg" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Link/Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={addOptionField}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus /> Add New Option
              </button>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={createPoll}
                className="px-5 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                Submit Poll
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Poll;