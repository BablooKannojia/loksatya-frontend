"use client";

import { useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { API_URL } from "../../../src/API";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddLiveUpdate({ liveNewsId, onAdded }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [postedBy, setPostedBy] = useState("");
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!description.trim()) {
            alert("Description likhna zaroori hai");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("postedBy", postedBy);
            if (image) formData.append("image", image);
            images.forEach((img) => formData.append("images", img));

            const res = await axios.post(
                `${API_URL}/live-news/${liveNewsId}/update`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Form reset
            setTitle("");
            setDescription("");
            setPostedBy("");
            setImage(null);
            setImages([]);

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
                Naya Live Update Add Karo
            </h3>

            <input
                type="text"
                placeholder="Update ka title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-indigo-500"
            />

            <input
                type="text"
                placeholder="Posted by (reporter name)"
                value={postedBy}
                onChange={(e) => setPostedBy(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-indigo-500"
            />

            <div className="rounded-xl overflow-hidden border border-slate-700">
                <JoditEditor
                    value={description}
                    config={{ readonly: false, height: 250, placeholder: "Update likho..." }}
                    onBlur={(content) => setDescription(content)}
                />
            </div>

            <div className="flex gap-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">
                        Single Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        className="text-sm text-slate-300"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">
                        Multiple Images
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                            setImages(Array.from(e.target.files || []))
                        }
                        className="text-sm text-slate-300"
                    />
                </div>
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