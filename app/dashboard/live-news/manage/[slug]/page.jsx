"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "../../../../../src/API";
import AddLiveUpdate from "../../AddLiveNewsUpdate";
import {
    FiArrowLeft,
    FiTrash2,
    FiEdit2,
    FiRadio,
    FiCheckCircle,
    FiAlertTriangle,
    FiExternalLink,
    FiX,
} from "react-icons/fi";
import Link from "next/link";

function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Abhi";
    if (mins < 60) return `${mins} minute pahle`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ghante pahle`;
    return `${Math.floor(hrs / 24)} din pahle`;
}

function formatClock(dateStr) {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// ==================== EDIT MODAL ====================
function EditUpdateModal({ update, onClose, onSaved, notify }) {
    const [title, setTitle] = useState(update.title || "");
    const [description, setDescription] = useState(update.description || "");
    const [postedBy, setPostedBy] = useState(update.postedBy || "");
    const [image, setImage] = useState(null); // single image file
    const [images, setImages] = useState([]); // multiple images files
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("postedBy", postedBy);
            if (image) formData.append("image", image);
            if (images.length) {
                images.forEach((img) => formData.append("images", img));
            }

            await axios.put(`${API_URL}/live-news/update/${update._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            notify("Update edited successfully");
            onSaved();
            onClose();
        } catch (err) {
            console.error(err);
            notify(err?.response?.data?.message || "Edit fail hua", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#0f1526] border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Edit Update</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition cursor-pointer"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Posted By</label>
                        <input
                            type="text"
                            value={postedBy}
                            onChange={(e) => setPostedBy(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                            HTML allowed (Jodit editor content). Agar rich text editor use karna hai to yahan uska component daal sakte ho.
                        </p>
                    </div>

                    {update.image && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Current Image
                            </label>
                            <img
                                src={update.image}
                                alt=""
                                className="w-32 h-20 object-cover rounded-lg mb-2"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">
                            Replace Image (optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="text-sm text-slate-300"
                        />
                    </div>

                    {update.images?.length > 0 && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">
                                Current Gallery Images
                            </label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {update.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt=""
                                        className="w-full h-16 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">
                            Replace Gallery Images (optional, sabko replace kar dega)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => setImages(Array.from(e.target.files))}
                            className="text-sm text-slate-300"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 transition text-white font-semibold disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ManageLiveUpdates() {
    const { slug } = useParams();
    const router = useRouter();

    const [news, setNews] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingToggle, setSavingToggle] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingUpdate, setEditingUpdate] = useState(null); // NEW

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const notify = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const fetchNews = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/live-news/${slug}`);
            setNews(res.data.news);
            setUpdates(res.data.updates || []);
        } catch (err) {
            console.error(err);
            setError("Live News load nahi ho payi");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const toggleField = async (field, currentValue) => {
        if (!news) return;
        try {
            setSavingToggle(true);
            const formData = new FormData();
            if (field === "live") {
                formData.append("live", !currentValue);
            } else if (field === "status") {
                formData.append("status", currentValue === "online" ? "offline" : "online");
            }
            await axios.put(`${API_URL}/live-news/${news._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            notify("Updated Successfully");
            fetchNews();
        } catch (err) {
            console.error(err);
            notify(err?.response?.data?.message || "Update fail hua", "error");
        } finally {
            setSavingToggle(false);
        }
    };

    const handleDeleteUpdate = async (id) => {
        if (!window.confirm("Ye update delete karna hai?")) return;
        try {
            setDeletingId(id);
            await axios.delete(`${API_URL}/live-news/update/${id}`);
            notify("Update deleted");
            fetchNews();
        } catch (err) {
            console.error(err);
            notify(err?.response?.data?.message || "Delete nahi ho paya", "error");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-slate-300">
                Loading...
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] text-red-400">
                {error || "Live News not found"}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-slate-100 p-4 sm:p-8 font-sans relative">
            {/* Toast */}
            {toast.show && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 ${
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

            {/* Edit Modal */}
            {editingUpdate && (
                <EditUpdateModal
                    update={editingUpdate}
                    onClose={() => setEditingUpdate(null)}
                    onSaved={fetchNews}
                    notify={notify}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <button
                    onClick={() => router.push("/dashboard/live-news")}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                    <FiArrowLeft /> Back to list
                </button>

                
                <a href={`/live-news/${news.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition"
                >
                    <FiExternalLink /> View Public Page
                </a>
            </div>

            {/* News summary card */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 mb-8 flex flex-col sm:flex-row gap-5">
                {news.image && (
                    <img
                        src={news.image}
                        alt=""
                        className="w-full sm:w-40 h-28 rounded-xl object-cover shrink-0"
                    />
                )}

                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-1">{news.title}</h1>
                    <p className="text-xs text-slate-500 mb-3">/{news.slug}</p>

                    <div className="flex flex-wrap gap-2">
                        <button
                            disabled={savingToggle}
                            onClick={() => toggleField("live", news.live)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition disabled:opacity-50 cursor-pointer ${
                                news.live
                                    ? "bg-red-600/20 text-red-400 border-red-700/40"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                        >
                            <FiRadio className="text-xs" />
                            {news.live ? "Live ON" : "Live OFF"}
                        </button>

                        <button
                            disabled={savingToggle}
                            onClick={() => toggleField("status", news.status)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition disabled:opacity-50 cursor-pointer ${
                                news.status === "online"
                                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/40"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                        >
                            {news.status === "online" ? "Online" : "Offline"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add update form */}
            <div className="mb-10">
                <AddLiveUpdate liveNewsId={news._id} onAdded={fetchNews} />
            </div>

            {/* Timeline */}
            <div className="border-t border-slate-800 pt-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                    Live Updates ({updates.length})
                </h2>

                {updates.length === 0 ? (
                    <p className="text-slate-500 text-sm">no update here.</p>
                ) : (
                    <div className="relative border-l-2 border-slate-800 ml-2">
                        {updates.map((u) => (
                            <div key={u._id} className="relative pl-6 pb-8 last:pb-0">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-4 border-[#0a0f1d]" />

                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="font-semibold text-slate-300">
                                            {formatClock(u.createdAt)}
                                        </span>
                                        <span>({timeAgo(u.createdAt)})</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setEditingUpdate(u)}
                                            className="text-slate-500 hover:text-cyan-400 transition cursor-pointer"
                                            title="Edit this update"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button
                                            disabled={deletingId === u._id}
                                            onClick={() => handleDeleteUpdate(u._id)}
                                            className="text-slate-500 hover:text-rose-400 transition disabled:opacity-50 cursor-pointer"
                                            title="Delete this update"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {u.title && (
                                    <Link href={`/dashboard/live-news/${news.slug}`}>
                                        <h3 className="text-lg font-semibold mb-1">{u.title}</h3>
                                    </Link>
                                )}

                                {u.postedBy && (
                                    <p className="text-xs text-slate-500 mb-2">
                                        Posted by: {u.postedBy}
                                    </p>
                                )}

                                <div className="prose prose-invert prose-sm max-w-none text-slate-300"
                                    dangerouslySetInnerHTML={{ __html: u.description }}
                                />

                                {u.image && (
                                    <img
                                        src={u.image}
                                        alt=""
                                        className="w-50 mt-3 rounded-lg max-h-64 object-cover"
                                    />
                                )}

                                {u.images?.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {u.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img}
                                                alt=""
                                                className="rounded-lg h-24 w-full object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}