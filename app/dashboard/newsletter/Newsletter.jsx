'use client';

import React, { useState, useEffect } from "react";
import { API_URL } from "../../../src/API";

const NewsLetter = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, email: null });

  // Toast Trigger Helper
  const showNotification = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/newsletter`);
      const data = await response.json();
      if (response.ok) {
        const subs = data.subscriptions || [];
        setSubscriptions(subs);
        setFilteredData(subs);
      } else {
        showNotification(data.message || "Failed to fetch subscriptions", "error");
      }
    } catch (err) {
      showNotification("An error occurred while fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let updatedList = [...subscriptions];

    if (searchValue.trim() !== "") {
      const query = searchValue.toLowerCase();
      updatedList = updatedList.filter(
        (item) =>
          item.email?.toLowerCase().includes(query) ||
          item._id?.toLowerCase().includes(query)
      );
    }

    setFilteredData(updatedList);
  }, [searchValue, subscriptions, filterType]);

  const handleDelete = async (email) => {
    try {
      const response = await fetch(`${API_URL}/newsletter`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Subscription deleted successfully!", "success");
        setSubscriptions((prev) =>
          prev.filter((subscription) => subscription.email !== email)
        );
      } else {
        showNotification(data.message || "Failed to delete subscription", "error");
      }
    } catch (err) {
      showNotification("An error occurred while deleting the subscription", "error");
    } finally {
      setDeleteModal({ show: false, email: null });
    }
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
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Subscribed Users Management
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          View, filter, and manage email newsletter subscriptions.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Filter Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Filter By Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="all">All Subscriptions</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>

          {/* Search Input Box */}
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Search Email
            </label>
            <input
              type="text"
              placeholder="Search items..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Refresh Action Button */}
          <div className="md:col-span-3 flex gap-3 md:mt-6">
            <button
              onClick={fetchSubscriptions}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-medium py-2.5 px-4 rounded-xl transition duration-150 shadow-lg shadow-emerald-950/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Refresh</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        
        {/* Counter Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-base font-bold text-slate-200">
            Total Items ({filteredData.length})
          </span>
          <span className="text-xs text-slate-500">
            Page 1 of 1
          </span>
        </div>

        {/* Loading / Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading subscribers...
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[50vh]">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0b1329]/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-semibold">
                  <th className="px-6 py-4">EMAIL</th>
                  <th className="px-6 py-4 w-[200px]">CREATED AT</th>
                  <th className="px-6 py-4 w-[120px] text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredData && filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr
                      key={row._id || row.email}
                      className="hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      {/* Email */}
                      <td className="px-6 py-4 text-slate-200 font-medium">
                        {row.email}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteModal({ show: true, email: row.email })}
                          className="bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-300 border border-red-800/60 font-medium text-xs py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-16 text-slate-500 font-medium"
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Tailwind Modal Popup */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-slate-100">
                Confirm Deletion
              </h3>
            </div>
            
            <p className="text-sm text-slate-300 mb-2">
              Are you sure you want to delete this subscription?
            </p>
            <p className="text-xs font-mono bg-[#0b1329] text-cyan-400 p-2.5 rounded-lg border border-slate-800 mb-6 truncate">
              {deleteModal.email}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, email: null })}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.email)}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-950/50 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NewsLetter;