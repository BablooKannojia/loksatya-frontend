"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { OnEdit as onEditContext } from "../../../src/Context/index";
import { API_URL } from "../../../src/API";
import {
    FiSearch,
    FiRotateCcw,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiAlertTriangle,
    FiX,
    FiCheckCircle,
    FiRadio,
    FiList,
    FiExternalLink,
} from "react-icons/fi";

export default function LiveNewsList() {
    const router = useRouter();
    const { setOnEdit, setId } = useContext(onEditContext);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const showNotification = (msg, type = "success") => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
    };

    const fetchList = async (targetPage = page) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/live-news/admin`, {
                params: {
                    page: targetPage,
                    limit: 10,
                    search: search || undefined,
                    status: status || undefined,
                },
            });
            setData(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotal(res.data.total || 0);
            setPage(res.data.currentPage || targetPage);
        } catch (err) {
            console.error(err);
            showNotification("Live News list load nahi ho payi", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearch = () => fetchList(1);

    const onReset = () => {
        setSearch("");
        setStatus("");
        fetchList(1);
    };

    const goCreate = () => {
        setOnEdit(false);
        setId("");
        router.push("/dashboard/live-news/create");
    };

    const goEdit = (item) => {
        setOnEdit(true);
        setId(item._id);
        router.push("/dashboard/live-news/create?edit=true");
    };

    const goManageUpdates = (item) => {
        router.push(`/dashboard/live-news/manage/${item.slug}`);
    };

    const confirmDelete = (item) => {
        setCurrentItem(item);
        setIsModalDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!currentItem) return;
        try {
            await axios.delete(`${API_URL}/live-news/${currentItem._id}`);
            showNotification("Live News deleted successfully");
            setIsModalDeleteOpen(false);
            setCurrentItem(null);
            fetchList(page);
        } catch (err) {
            console.error(err);
            showNotification(
                err?.response?.data?.message || "Delete nahi ho paya",
                "error"
            );
        }
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return "-";
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "Abhi";
        if (mins < 60) return `${mins}m pahle`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h pahle`;
        return `${Math.floor(hrs / 24)}d pahle`;
    };

    return (
        <div className="px-4 px-6 bg-[#0a0f1d] min-h-screen text-slate-100 font-sans relative">
            {/* Toast */}
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

            {/* Header */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Live News Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        Live blog banao, updates push karo, status control karo.
                    </p>
                </div>

                <button
                    onClick={goCreate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl transition duration-150 shadow-lg shadow-emerald-950/40 text-sm flex items-center gap-2 cursor-pointer"
                >
                    <FiPlus className="text-base" />
                    <span>New Live News</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-6 mb-6 backdrop-blur-md shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6">
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                            Search (title / slug / category)
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSearch()}
                            placeholder="Search..."
                            className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
                        >
                            <option value="">All</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                        <button
                            onClick={onSearch}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FiSearch className="text-base" />
                            <span>Search</span>
                        </button>
                        <button
                            onClick={onReset}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-3 rounded-xl transition duration-150 text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FiRotateCcw className="text-base" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111827]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-200">
                        Total Live News ({total})
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20 text-slate-400 text-sm gap-3">
                        <svg className="animate-spin h-5 w-5 text-cyan-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                    </div>
                ) : (
                    <div className="overflow-x-auto min-h-[40vh]">
                        <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-[#0b1329]/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 font-semibold">
                                    <th className="px-6 py-4 w-[70px]">Image</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 w-[140px]">Category</th>
                                    <th className="px-6 py-4 w-[110px]">Status</th>
                                    <th className="px-6 py-4 w-[110px]">Updates</th>
                                    <th className="px-6 py-4 w-[130px]">Last Update</th>
                                    <th className="px-6 py-4 w-[220px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="hover:bg-slate-800/40 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-3">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700" />
                                                )}
                                            </td>

                                            <td className="px-6 py-3 max-w-[320px]">
                                                <div className="flex items-center gap-2">
                                                    {item.live && (
                                                        <span
                                                            title="Currently Live"
                                                            className="flex items-center gap-1 bg-red-600/20 text-red-400 border border-red-700/40 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                                        >
                                                            <FiRadio className="text-[10px]" /> LIVE
                                                        </span>
                                                    )}
                                                    <span className="text-slate-200 font-medium truncate">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-500 truncate block">
                                                    /{item.slug}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3">
                                                <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-indigo-400 bg-indigo-950/50 border border-indigo-800/40 rounded-md truncate max-w-full">
                                                    {item.category || "-"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3">
                                                <span
                                                    className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                                                        item.status === "online"
                                                            ? "text-emerald-400 bg-emerald-950/50 border-emerald-800/40"
                                                            : "text-slate-400 bg-slate-800/60 border-slate-700"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3 text-slate-300">
                                                {item.totalUpdates ?? 0}
                                            </td>

                                            <td className="px-6 py-3 text-slate-400 text-xs">
                                                {timeAgo(item.latestUpdateAt)}
                                            </td>

                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => goManageUpdates(item)}
                                                        title="Add / View Live Updates"
                                                        className="bg-cyan-950/50 hover:bg-cyan-900/80 text-cyan-400 hover:text-cyan-300 border border-cyan-800/60 font-medium text-xs py-1.5 px-2.5 rounded-lg transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
                                                    >
                                                        <FiList className="text-xs" />
                                                        Updates
                                                    </button>
                                                    <button
                                                        onClick={() => goEdit(item)}
                                                        title="Edit Live News"
                                                        className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                    <a
                                                        href={`/live-news/${item.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="View Public Page"
                                                        className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <FiExternalLink size={14} />
                                                    </a>
                                                    <button
                                                        onClick={() => confirmDelete(item)}
                                                        title="Delete"
                                                        className="p-1.5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-slate-500 font-medium">
                                            Live News not found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                        <button
                            disabled={page <= 1}
                            onClick={() => fetchList(page - 1)}
                            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-slate-400">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => fetchList(page + 1)}
                            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {isModalDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="bg-[#111827] border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsModalDeleteOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                            <FiX className="text-xl" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <FiAlertTriangle className="text-red-400 text-2xl" />
                            <h3 className="text-lg font-bold text-slate-100">
                                Delete Live News?
                            </h3>
                        </div>

                        <p className="text-sm text-slate-400 mb-6">
                            "{currentItem?.title}" aur iski saari updates permanently delete ho jayengi. Ye action undo nahi ho sakta.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalDeleteOpen(false)}
                                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition shadow-lg shadow-red-950/50 cursor-pointer"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}