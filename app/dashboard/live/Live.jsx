'use client';

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { API_URL } from "../../../src/API";
import { 
  FiSearch, 
  FiRotateCcw, 
  FiPlus, 
  FiTrash2, 
  FiAlertTriangle, 
  FiX, 
  FiCheckCircle,
  FiExternalLink
} from "react-icons/fi";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const Live = () => {
  const [userData, setUserData] = useState([]);
  const [filterItem, setFilterItem] = useState("id");
  const [filterItemResponse, setFilterItemResponse] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");

  const editor = useRef(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const getAllLive = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/live`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const livesData = Array.isArray(data) ? data.reverse() : [];
      setUserData(livesData);
    } catch (error) {
      console.error("Error fetching live streams:", error);
      showNotification("Failed to fetch live streams. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllLive();
  }, []);

  const onAdd = async () => {
    if (!text.trim() || !link.trim()) {
      showNotification("Please fill in both Title and YouTube Link", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: link,
          title: text,
          discription: desc,
        }),
      });

      if (response.ok) {
        const users = await response.json();
        setUserData(Array.isArray(users) ? users : []);
        showNotification("Successfully Added", "success");
        handleCancel();
        getAllLive();
      } else {
        showNotification("Failed to add live stream", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error adding live stream", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/live/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the live stream");
      }

      await response.json();
      showNotification("Live stream deleted successfully!", "success");
      getAllLive();
    } catch (error) {
      console.error("Error deleting live stream:", error);
      showNotification("Error deleting live stream: " + error.message, "error");
    }
  };

  const onFilter = async () => {
    if (!filterItemResponse.trim()) {
      getAllLive();
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/live?${filterItem}=${encodeURIComponent(filterItemResponse)}`
      );
      if (!response.ok) throw new Error("Filter failed");
      const data = await response.json();
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
    getAllLive();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setText("");
    setLink("");
    setDesc("");
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-6 bg-[#0a0f1d] min-h-screen text-slate-100 font-sans relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-700 text-emerald-200"
              : "bg-red-950/90 border-red-700 text-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <FiCheckCircle className="text-emerald-400 text-lg shrink-0" />
          ) : (
            <FiAlertTriangle className="text-red-400 text-lg shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Live Streaming
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage YouTube live links, titles, and broadcast descriptions.
        </p>
      </div>

      {/* Filter and Action Box */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          
          {/* Select Filter Item */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Filter Parameter
            </label>
            <select
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="id">By ID</option>
              <option value="title">By Title</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Search Query
            </label>
            <input
              type="text"
              value={filterItemResponse}
              onChange={(e) => setFilterItemResponse(e.target.value)}
              placeholder={filterItem === "id" ? "Search by ID..." : "Search by Title..."}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Buttons Group */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 flex-1 min-w-[280px]">
            <button
              onClick={onFilter}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiSearch className="text-base shrink-0" />
              <span>Filter</span>
            </button>
            <button
              onClick={onReset}
              className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiRotateCcw className="text-base shrink-0" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiPlus className="text-base shrink-0" />
              <span className="whitespace-nowrap">Add Live</span>
            </button>
          </div>

        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm sm:text-base font-bold text-slate-200">
            Total Live Streams ({userData.length})
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading streams...
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0b1329]/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-semibold">
                  <th className="px-5 py-3.5 w-28">ID</th>
                  <th className="px-5 py-3.5 max-w-[280px]">LINK</th>
                  <th className="px-5 py-3.5">TITLE</th>
                  <th className="px-5 py-3.5 w-28 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {userData.length > 0 ? (
                  userData.map((row) => (
                    <tr
                      key={row._id}
                      className="hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      <td className="px-5 py-4">
                        <span
                          className="font-mono text-xs text-slate-400 block w-20 truncate"
                          title={row._id}
                        >
                          {row._id}
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-[280px]">
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline font-mono text-xs flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{row.link}</span>
                          <FiExternalLink className="text-xs shrink-0 ml-1" />
                        </a>
                      </td>

                      <td className="px-5 py-4 text-slate-200 font-medium max-w-xs truncate">
                        {row.title || "N/A"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(row._id)}
                          className="bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-300 border border-red-800/60 font-medium text-xs py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <FiTrash2 className="text-xs shrink-0" />
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
                      No live streams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <span className="text-red-500">🔴</span> Upload Live Link
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter Title"
                  className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                  YouTube Live Link
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Enter Youtube Live Link"
                  className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                Description
              </label>
              <div className="text-slate-900 rounded-xl overflow-hidden">
                <JoditEditor
                  ref={editor}
                  value={desc}
                  tabIndex={1}
                  onBlur={(newContent) => setDesc(newContent)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onAdd}
                className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                Upload Live
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Live;