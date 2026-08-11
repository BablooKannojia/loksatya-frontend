"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { API_URL } from "../../../src/API";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddLiveUpdate({ liveNewsId, onAdded }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [postedBy, setPostedBy] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Login user ka email auto-fill karo (jaise UseLiveNewsForm me publishBy hota hai)
    useEffect(() => {
        const userId =
            typeof window !== "undefined" ? localStorage.getItem("id") : null;
        if (!userId) return;

        axios
            .get(`${API_URL}/user?id=${userId}`)
            .then((res) => {
                const u = res.data?.[0];
                if (u) {
                    setPostedBy(u.role || "");
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const submit = async () => {
        if (!title.trim()) {
            alert("Title is required");
            return;
        }
        if (!description.trim()) {
            alert("Description is required");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("postedBy", postedBy);
            if (image) formData.append("image", image);

            const res = await axios.post(
                `${API_URL}/live-news/${liveNewsId}/update`,
                formData
            );

            setTitle("");
            setDescription("");
            setImage(null);

            if (onAdded) onAdded(res.data);
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Update add nahi ho paya");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
                Update Title
            </h3>

            <input
                type="text"
                placeholder="Update title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-indigo-500"
            />

            <div>
                <label className="block text-xs text-slate-400 mb-1">
                    Posted By
                </label>
                <input
                    type="text"
                    readOnly
                    value={postedBy}
                    placeholder="Loading..."
                    className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 outline-none cursor-not-allowed"
                />
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-700">
                <JoditEditor
                    value={description}
                    onBlur={(content) => setDescription(content)}
                    config={{
                        readonly: false,
                        height: 220,
                        placeholder: "Write update here...",
                        style: {
                            background: "#ffffff",
                            color: "#111827",
                        },
                    }}
                />
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1">
                    Image
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="text-sm text-slate-300"
                />
            </div>

            <button
                onClick={submit}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-60"
            >
                {loading ? "Posting..." : "Post Live Update"}
            </button>
        </div>
    );
}