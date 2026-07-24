"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";

const FlashNews = () => {
  // Input states
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  // Table Data & Pagination states
  const [userData, setUserData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Status & Loading controls
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Modals & Active Edit/Delete item
  const [editData, setEditData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null); // Item selected for deletion
  const [toastMessage, setToastMessage] = useState({ text: "", type: "" });

  // Notification Helper
  const notify = (text, type = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: "", type: "" }), 3000);
  };

  // Fetch News Data with Pagination
  const fetchFlashNews = useCallback(async (currentPage = 1) => {
    setTableLoading(true);
    try {
      const res = await axios.get(`${API_URL}/flashnews?page=${currentPage}&limit=10`);
      
      if (res.data && Array.isArray(res.data.data)) {
        setUserData(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
      } else if (Array.isArray(res.data)) {
        setUserData([...res.data].reverse());
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      notify("Failed to fetch flash news data.", "error");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashNews(page);
  }, [page, fetchFlashNews]);

  // Handle Edit Select
  const handleEditClick = (article) => {
    setEditData(article);
    setTitle(article.slugName || "");
    setLink(article.link || "");
  };

  // Reset Form
  const resetForm = () => {
    setTitle("");
    setLink("");
    setEditData(null);
  };

  // Upload New Flash News
  const onUpload = async () => {
    if (!title.trim() || !link.trim()) {
      notify("Title and Link are required!", "warning");
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem("id");
      await axios.post(`${API_URL}/flashnews?id=${userId}`, {
        link,
        slugName: title,
        status: "active",
      });

      notify("Flash News uploaded successfully!", "success");
      resetForm();
      fetchFlashNews(1);
      setPage(1);
    } catch (error) {
      console.error("Upload Error:", error);
      notify("Failed to upload Flash News.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Save Edits
  const onEdit = async () => {
    if (!title.trim() || !link.trim()) {
      notify("Title and Link cannot be empty!", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_URL}/flashnews/${editData._id}/edit`, {
        link,
        slugName: title,
      });

      notify("Flash News updated successfully!", "success");
      resetForm();
      fetchFlashNews(page);
    } catch (error) {
      console.error("Edit Error:", error);
      notify("Failed to update Flash News.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Status (Active / Inactive)
  const handleToggleStatus = async (newsId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.put(`${API_URL}/flashnews/${newsId}/status`, { status: newStatus });
      notify(`Status changed to ${newStatus}!`, "success");
      fetchFlashNews(page);
    } catch (error) {
      console.error("Status Update Error:", error);
      notify("Failed to update status.", "error");
    }
  };

  // Delete Flash News Handler
  const handleDelete = async () => {
    if (!deleteItem) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/flashnews/${deleteItem._id}`);
      notify("Flash news deleted successfully!", "success");
      
      // Reset edit state if user is deleting the item currently being edited
      if (editData && editData._id === deleteItem._id) {
        resetForm();
      }

      setDeleteItem(null);
      fetchFlashNews(page);
    } catch (error) {
      console.error("Delete Error:", error);
      notify(error.response?.data?.message || "Failed to delete flash news.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage.text && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md text-white text-sm font-semibold flex items-center gap-2 border transition-all animate-bounce ${
            toastMessage.type === "error"
              ? "bg-rose-600/90 border-rose-500/50"
              : toastMessage.type === "warning"
              ? "bg-amber-500/90 border-amber-400/50"
              : "bg-emerald-600/90 border-emerald-500/50"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          Flash News Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Add, edit, toggle status, or delete active flash news ticker items.
        </p>
      </div>

      {/* Main Card / Form */}
      <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Title Input */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              News Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter headline/title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-cyan-500 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Link Input */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Destination Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://loksatya.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-cyan-500 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={editData ? onEdit : onUpload}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {editData ? "Save Changes" : "Upload News"}
            </button>

            {editData && (
              <button
                onClick={resetForm}
                className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-900/40">
          <h2 className="text-base font-bold text-slate-200">
            Recent Flash News ({totalItems})
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-700">
                <th className="py-3.5 px-4">Title</th>
                {/* <th className="py-3.5 px-4">Link</th> */}
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {tableLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading flash news items...
                    </div>
                  </td>
                </tr>
              ) : userData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-500">
                    No flash news found.
                  </td>
                </tr>
              ) : (
                userData.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-100 font-medium max-w-md line-clamp-2">
                      {item.slugName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === "active"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {item.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(item._id, item.status)
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-700/50 hover:bg-indigo-900/60 rounded-lg transition-all"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/50 hover:bg-rose-900/60 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || tableLoading}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          <span className="text-xs text-slate-400">
            Page <strong className="text-slate-200">{page}</strong> of{" "}
            <strong className="text-slate-200">{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || tableLoading}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span className="text-rose-500">⚠️</span> Confirm Deletion
              </h3>
              <p className="text-sm text-slate-400">
                Are you sure you want to delete this flash news item? This action cannot be undone.
              </p>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 italic line-clamp-3">
                "{deleteItem.slugName}"
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                {deleteLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashNews;