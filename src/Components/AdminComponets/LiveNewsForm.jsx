"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useLiveNewsForm } from "./UseLiveNewsForm";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
});

export default function LiveNewsForm({
    heading = "Create Live News",
    editHeading = "Edit Live News",
    subheading = "Publish and manage live news updates.",
    editId,
    shouldLoadForEdit = false,
    onCancelEdit,
}) {
    const f = useLiveNewsForm({
        editId,
        shouldLoadForEdit,
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">

            {/* Toast */}
            {f.toastMessage.text && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold
          ${f.toastMessage.type === "error"
                            ? "bg-red-600"
                            : f.toastMessage.type === "warning"
                                ? "bg-yellow-600"
                                : "bg-emerald-600"
                        }`}
                >
                    {f.toastMessage.text}
                </div>
            )}

            {/* Loader */}
            {f.loading && (
                <div className="mb-6 rounded-lg bg-indigo-600 p-3 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Processing Live News...
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">

                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        {f.onEdit ? editHeading : heading}
                    </h1>

                    <p className="text-slate-400 text-sm mt-1">
                        {subheading}
                    </p>
                </div>

                {f.onEdit && (
                    <button
                        onClick={() => {
                            f.setOnEdit(false);

                            if (onCancelEdit) {
                                onCancelEdit(f.router);
                            }
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                        Cancel Editing
                    </button>
                )}

            </div>

            {/* Main Card */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur-xl shadow-2xl p-6 space-y-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Featured Image */}
                    <div className="lg:col-span-4">

                        <label className="block text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">
                            Featured Image
                        </label>

                        <input
                            id="live-image"
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    f.setImage(e.target.files[0]);
                                    f.setImageUpdated(true);
                                }
                            }}
                        />

                        <div
                            onClick={() =>
                                document.getElementById("live-image")?.click()
                            }
                            className="relative h-60 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden"
                        >

                            {!f.image ? (
                                <div className="text-center">

                                    <svg
                                        className="w-10 h-10 mx-auto text-indigo-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2l2-2a2 2 0 012.8 0L20 14"
                                        />
                                    </svg>

                                    <p className="mt-3 font-semibold">
                                        Upload Featured Image
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        JPG • PNG • WEBP
                                    </p>

                                </div>
                            ) : (
                                <img
                                    src={
                                        f.image instanceof File
                                            ? URL.createObjectURL(f.image)
                                            : f.image
                                    }
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            )}
                        </div>

                    </div>
                    {/* Right Side */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

                        {/* Title */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Live News Title
                            </label>

                            <input
                                type="text"
                                placeholder="Enter Live News title..."
                                value={f.title}
                                onChange={(e) => {
                                    f.setTitle(e.target.value);
                                    f.setSlug(f.createSlug(e.target.value));
                                }}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Category
                            </label>

                            <select
                                value={f.category}
                                onChange={(e) => {
                                    f.setCategory(e.target.value);
                                    f.setSubCategory("");
                                }}
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                            >
                                <option value="">Select Category</option>

                                {f.categories.map((item) => (
                                    <option
                                        key={item.key}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sub Category */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Sub Category
                            </label>

                            <select
                                value={f.subCategory}
                                onChange={(e) =>
                                    f.setSubCategory(e.target.value)
                                }
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                            >
                                <option value="">
                                    Select Sub Category
                                </option>

                                {f.subCategories.map((item) => (
                                    <option
                                        key={item.key}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reporter */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Reported By
                            </label>

                            <input
                                type="text"
                                placeholder="Reporter Name"
                                value={f.reportedBy}
                                onChange={(e) =>
                                    f.setReportedBy(e.target.value)
                                }
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        {/* Publisher */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Publish By
                            </label>

                            <input
                                type="text"
                                value={f.publishBy}
                                readOnly
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        {/* Slug */}
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Slug
                            </label>

                            <input
                                type="text"
                                value={f.slug}
                                onChange={(e) =>
                                    f.setSlug(f.createSlug(e.target.value))
                                }
                                placeholder="live-news-slug"
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Status
                            </label>

                            <select
                                value={f.status}
                                onChange={(e) =>
                                    f.setStatus(e.target.value)
                                }
                                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                            >
                                <option value="online">
                                    Online
                                </option>

                                <option value="offline">
                                    Offline
                                </option>
                            </select>
                        </div>

                        {/* Live */}
                        <div className="flex items-end">

                            <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">

                                <input
                                    type="checkbox"
                                    checked={f.live}
                                    onChange={(e) =>
                                        f.setLive(e.target.checked)
                                    }
                                    className="w-5 h-5 accent-indigo-600"
                                />

                                Live News

                            </label>

                        </div>

                    </div>

                </div>

                {/* Gallery Section starts in Part 1A-1.3 */}

                {/* ================= Gallery Upload ================= */}

                <div className="space-y-4">

                    <div className="flex items-center justify-between">

                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Gallery Images
                        </label>

                        <span className="text-xs text-slate-500">
                            {f.gallery.length} image(s) selected
                        </span>

                    </div>

                    <input
                        id="live-gallery"
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                            if (!e.target.files?.length) return;

                            const files = Array.from(e.target.files);

                            f.setGallery((prev) => [...prev, ...files]);
                            f.setGalleryUpdated(true);
                        }}
                    />

                    <div
                        onClick={() =>
                            document.getElementById("live-gallery")?.click()
                        }
                        className="rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900 p-8 cursor-pointer transition"
                    >

                        <div className="text-center">

                            <svg
                                className="w-10 h-10 mx-auto text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 7h18M3 12h18M3 17h18"
                                />
                            </svg>

                            <p className="mt-3 font-semibold">
                                Upload Gallery Images
                            </p>

                            <p className="text-xs text-slate-500 mt-2">
                                Select multiple images
                            </p>

                        </div>

                    </div>

                    {f.gallery.length > 0 && (

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                            {f.gallery.map((img, index) => {

                                const src =
                                    img instanceof File
                                        ? URL.createObjectURL(img)
                                        : img;

                                return (

                                    <div
                                        key={index}
                                        className="relative rounded-xl overflow-hidden group"
                                    >

                                        <img
                                            src={src}
                                            alt=""
                                            className="w-full h-28 object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                f.setGallery((prev) =>
                                                    prev.filter((_, i) => i !== index)
                                                )
                                            }
                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                                        >
                                            ✕
                                        </button>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </div>

                {/* ================= Tags ================= */}

                <div className="space-y-4 border-t border-slate-700 pt-6">

                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Tags
                    </label>

                    {f.tags.length > 0 && (

                        <div className="flex flex-wrap gap-2">

                            {f.tags.map((tag, index) => (

                                <span
                                    key={index}
                                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs flex items-center gap-2"
                                >
                                    {tag}

                                    <button
                                        type="button"
                                        onClick={() => f.removeTag(tag)}
                                    >
                                        ✕
                                    </button>

                                </span>

                            ))}

                        </div>

                    )}

                    <div className="flex gap-3">

                        <input
                            type="text"
                            placeholder="Enter tag..."
                            value={f.tagInput}
                            onChange={(e) =>
                                f.setTagInput(e.target.value)
                            }
                            onKeyDown={(e) => {

                                if (e.key === "Enter") {

                                    e.preventDefault();

                                    f.addTag();

                                }

                            }}
                            className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
                        />

                        <button
                            type="button"
                            onClick={f.addTag}
                            className="px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500"
                        >
                            Add
                        </button>

                    </div>

                </div>

                {/* ================= Description ================= */}

                <div className="space-y-3 border-t border-slate-700 pt-6">

                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Live News Description
                    </label>

                    <div className="rounded-xl overflow-hidden border border-slate-700">

                        <JoditEditor
                            ref={f.editor}
                            value={f.description}
                            config={f.joditConfig}
                            tabIndex={1}
                            onBlur={(content) =>
                                f.setDescription(content)
                            }
                        />

                    </div>

                </div>

                {/* Part 1A-1.4 → Footer Buttons + Preview Modal */}
                {/* ================= Footer ================= */}

                <div className="border-t border-slate-700 pt-6 flex flex-wrap items-center justify-between gap-4">

                    <div className="flex items-center gap-6">

                        {/* Live Switch */}
                        <label className="flex items-center gap-3 cursor-pointer">

                            <input
                                type="checkbox"
                                checked={f.live}
                                onChange={(e) => f.setLive(e.target.checked)}
                                className="w-5 h-5 accent-indigo-600"
                            />

                            <span className="text-sm font-medium">
                                Publish as Live News
                            </span>

                        </label>

                        {/* Status */}
                        <label className="flex items-center gap-3 cursor-pointer">

                            <input
                                type="checkbox"
                                checked={f.status === "online"}
                                onChange={(e) =>
                                    f.setStatus(
                                        e.target.checked
                                            ? "online"
                                            : "offline"
                                    )
                                }
                                className="w-5 h-5 accent-emerald-600"
                            />

                            <span className="text-sm font-medium">
                                Online
                            </span>

                        </label>

                    </div>

                    <div className="flex gap-3">

                        {f.onEdit && (

                            <button
                                type="button"
                                onClick={() => {
                                    f.resetForm();

                                    if (onCancelEdit) {
                                        onCancelEdit(f.router);
                                    }
                                }}
                                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>

                        )}

                        <button
                            type="button"
                            onClick={f.showPreview}
                            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                        >
                            Preview
                        </button>

                    </div>

                </div>

            </div>

            {/* ================= Preview Modal ================= */}

            {f.previewOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5">

                    <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">

                        {/* Header */}

                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">

                            <h2 className="text-2xl font-bold">
                                Live News Preview
                            </h2>

                            <button
                                onClick={() => f.setPreviewOpen(false)}
                                className="text-3xl leading-none hover:text-red-400"
                            >
                                ×
                            </button>

                        </div>

                        {/* Body */}

                        <div className="p-8 space-y-8">

                            {/* Featured */}

                            {f.image && (

                                <img
                                    src={
                                        f.image instanceof File
                                            ? URL.createObjectURL(f.image)
                                            : f.image
                                    }
                                    alt=""
                                    className="w-full rounded-xl object-cover max-h-[450px]"
                                />

                            )}

                            <div>

                                <h1 className="text-4xl font-bold">
                                    {f.title}
                                </h1>

                                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">

                                    <span>
                                        <strong>Category:</strong> {f.category}
                                    </span>

                                    <span>
                                        <strong>Sub Category:</strong> {f.subCategory}
                                    </span>

                                    <span>
                                        <strong>Reporter:</strong> {f.reportedBy}
                                    </span>

                                </div>

                            </div>

                            {/* Description */}

                            <div
                                className="prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: f.description,
                                }}
                            />

                            {/* Gallery */}

                            {f.gallery.length > 0 && (

                                <div>

                                    <h3 className="text-xl font-semibold mb-4">
                                        Gallery
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                        {f.gallery.map((img, i) => (

                                            <img
                                                key={i}
                                                src={
                                                    img instanceof File
                                                        ? URL.createObjectURL(img)
                                                        : img
                                                }
                                                alt=""
                                                className="rounded-xl h-40 w-full object-cover"
                                            />

                                        ))}

                                    </div>

                                </div>

                            )}

                            {/* Tags */}

                            {f.tags.length > 0 && (

                                <div className="flex flex-wrap gap-2">

                                    {f.tags.map((tag) => (

                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm"
                                        >
                                            #{tag}
                                        </span>

                                    ))}

                                </div>

                            )}

                        </div>

                        {/* Footer */}

                        <div className="flex justify-end gap-4 px-6 py-5 border-t border-slate-700">

                            <button
                                onClick={() => f.setPreviewOpen(false)}
                                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600"
                            >
                                Back
                            </button>

                            <button
                                disabled={f.publishLoading}
                                onClick={() => {
                                    if (f.onEdit) {
                                        f.updateLiveNews();
                                    } else {
                                        f.createLiveNews();
                                    }
                                }}
                                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-60"
                            >
                                {f.publishLoading
                                    ? "Publishing..."
                                    : f.onEdit
                                        ? "Update Live News"
                                        : "Publish Live News"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}