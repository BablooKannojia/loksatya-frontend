'use client';

import React, { useState, useEffect } from "react";
import { API_URL } from "../../../src/API";
import {
    FiSearch,
    FiRotateCcw,
    FiTrash2,
    FiAlertTriangle,
    FiX,
    FiCheckCircle,
    FiMessageSquare
} from "react-icons/fi";

const Comments = ({ isAdmin }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterItem, setFilterItem] = useState("id");
    const [filterItemResponse, setFilterItemResponse] = useState("");
    const [currentComment, setCurrentComment] = useState(null);
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const showNotification = (msg, type = "success") => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "success" });
        }, 3500);
    };

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/comment`);
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching comments:", error);
            showNotification("Failed to fetch comments. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      fetchComments();
    }, [])

    const onFilter = async () => {
        if (!filterItemResponse.trim()) {
            fetchComments();
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/comment?${filterItem}=${encodeURIComponent(filterItemResponse)}`
            );
            if (!response.ok) throw new Error("Filter failed");
            const data = await response.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (err) {
            showNotification("Error in Filtering", "error");
        } finally {
            setLoading(false);
        }
    };

    const onReset = () => {
        setFilterItem("id");
        setFilterItemResponse("");
        fetchComments();
    };

    const ShowDeleteModal = (comment) => {
        setCurrentComment(comment);
        setIsModalDeleteOpen(true);
    };

    const OnDelete = async () => {
        if (!currentComment?._id) return;
        try {
            const response = await fetch(`${API_URL}/comment?id=${currentComment._id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showNotification("Comment Has Successfully Deleted", "success");
                fetchComments();
            } else {
                showNotification("Comment Has Not Deleted", "error");
            }
        } catch (err) {
            console.error(err);
            showNotification("Comment Has Not Deleted", "error");
        } finally {
            setIsModalDeleteOpen(false);
            setCurrentComment(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsModalDeleteOpen(false);
        setCurrentComment(null);
    };

    const placeHolderString = () => {
        switch (filterItem) {
            case "commentID":
                return "Search by Comment ID...";
            case "email":
                return "Search by Email...";
            case "name":
                return "Search by Name...";
            case "comment":
                return "Search by Comment text...";
            case "id":
                return "Search by Post ID...";
            default:
                return "Type here...";
        }
    };

    // Generate serial number (sno)
    const commentsWithSno = comments.map((comment, index) => ({
        ...comment,
        sno: index + 1,
    }));

    return (
        <div className="p-4 bg-[#0a0f1d] min-h-screen text-slate-100 font-sans relative">

            {toast.show && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
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

            {/* Header Section */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
                    <FiMessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Comments Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        View, filter, and moderate user comments across posts.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* Select Filter Type */}
                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                            Filter Parameter
                        </label>
                        <select
                            value={filterItem}
                            onChange={(e) => setFilterItem(e.target.value)}
                            className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                        >
                            <option value="id">By Post ID</option>
                            <option value="commentID">By Comment ID</option>
                            <option value="email">By Email</option>
                            <option value="name">By Name</option>
                            <option value="comment">By Comment Content</option>
                        </select>
                    </div>

                    {/* Search Input Box */}
                    <div className="md:col-span-5">
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                            Search Query
                        </label>
                        <input
                            type="text"
                            value={filterItemResponse}
                            onChange={(e) => setFilterItemResponse(e.target.value)}
                            placeholder={placeHolderString()}
                            className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-4 flex gap-3 md:mt-6">
                        <button
                            onClick={onFilter}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-4 rounded-xl transition duration-150 shadow-lg shadow-cyan-950/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FiSearch className="text-base" />
                            <span>Filter</span>
                        </button>
                        <button
                            onClick={onReset}
                            className="flex-1 bg-red-600/80 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-xl transition duration-150 shadow-lg shadow-red-950/40 text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FiRotateCcw className="text-base" />
                            <span>Reset</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Comments Table */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">

                {/* Counter Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-200">
                        Total Comments ({commentsWithSno.length})
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-3">
                        <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading comments...
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[50vh]">
                        <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-[#0b1329]/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-semibold">
                                    <th className="px-6 py-4 w-[80px]">S.NO</th>
                                    <th className="px-6 py-4 w-[180px]">NAME</th>
                                    <th className="px-6 py-4 w-[220px]">EMAIL</th>
                                    <th className="px-6 py-4">COMMENT</th>
                                    <th className="px-6 py-4 w-[150px]">POST ID</th>
                                    <th className="px-6 py-4 w-[120px] text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {commentsWithSno.length > 0 ? (
                                    commentsWithSno.map((row) => (
                                        <tr
                                            key={row._id || row.sno}
                                            className="hover:bg-slate-800/40 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                                #{row.sno}
                                            </td>
                                            <td className="px-6 py-4 text-slate-200 font-medium">
                                                {row.name || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {row.email || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={row.message}>
                                                {row.message || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-cyan-400 font-mono text-xs truncate max-w-[120px]">
                                                {row.postId || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => ShowDeleteModal(row)}
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
                                            colSpan={6}
                                            className="text-center py-16 text-slate-500 font-medium"
                                        >
                                            No comments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {isModalDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">

                        <button
                            onClick={handleDeleteCancel}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                        >
                            <FiX className="text-xl" />
                        </button>

                        <div className="flex items-center gap-3 text-red-500 mb-3">
                            <FiAlertTriangle className="text-2xl" />
                            <h3 className="text-lg font-bold text-slate-100">
                                Delete Comment
                            </h3>
                        </div>

                        <p className="text-sm text-slate-300 mb-4">
                            Are you sure you want to delete this comment?
                        </p>

                        {currentComment && (
                            <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-3 mb-6 text-xs text-slate-400 space-y-1">
                                <p><span className="text-slate-500">Author:</span> {currentComment.name}</p>
                                <p className="truncate"><span className="text-slate-500">Message:</span> "{currentComment.message}"</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={OnDelete}
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

export default Comments;