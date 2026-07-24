"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useArticleForm } from "./UseArticleform";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function ArticleFormBase({
    heading = "Create Article",
    editHeading = "Edit Article",
    subheading = "Fill out the information below to publish a post.",
    defaultNewsType = "breakingNews",
    editId,
    shouldLoadForEdit = false,
    enableScheduling = false,
    resetEditWhenNotLoading = false,
    onCancelEdit,
}) {
    const f = useArticleForm({
        defaultNewsType,
        editId,
        shouldLoadForEdit,
        enableScheduling,
        resetEditWhenNotLoading,
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
            {/* Toast Notification */}
            {f.toastMessage.text && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md text-white text-sm font-semibold flex items-center gap-2 border transition-all animate-bounce ${f.toastMessage.type === "error"
                            ? "bg-rose-600/90 border-rose-500/50"
                            : f.toastMessage.type === "warning"
                                ? "bg-amber-500/90 border-amber-400/50"
                                : "bg-emerald-600/90 border-emerald-500/50"
                        }`}
                >
                    {f.toastMessage.text}
                </div>
            )}

            {f.loading && (
                <div className="p-3 mb-6 text-white bg-indigo-600 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing article data...
                </div>
            )}

            {/* Main Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        {f.onEdit ? editHeading : heading}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{subheading}</p>
                </div>

                {f.onEdit && (
                    <button
                        onClick={() => {
                            f.setOnEdit(false);
                            if (onCancelEdit) onCancelEdit(f.router);
                        }}
                        className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg transition-all shadow-sm"
                    >
                        Cancel Editing
                    </button>
                )}
            </div>

            {/* Editor Main Card */}
            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
                {/* Top Grid: Media Upload & Core Metadata */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 flex flex-col">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Featured Media Asset
                        </label>
                        <input
                            type="file"
                            name="file"
                            id="file-name"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    f.setImg(e.target.files[0]);
                                    f.setUpdate(true);
                                }
                            }}
                            className="hidden"
                        />
                        <div
                            onClick={() => document.getElementById("file-name")?.click()}
                            className="relative group w-full h-56 bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300"
                        >
                            {f.img == null ? (
                                <div className="text-center p-6 flex flex-col items-center gap-2">
                                    <div className="p-3 bg-slate-800 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-300">Upload Featured Image/Video</span>
                                    <span className="text-xs text-slate-500">Supports JPG, PNG, MP4</span>
                                </div>
                            ) : f.type === "img" ? (
                                <img
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                    alt="Uploaded preview"
                                    src={f.Update && f.img instanceof File ? URL.createObjectURL(f.img) : f.img}
                                />
                            ) : (
                                <video
                                    className="w-full h-full object-cover"
                                    src={f.Update && f.img instanceof File ? URL.createObjectURL(f.img) : f.img}
                                    controls
                                />
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Media Type
                            </label>
                            <select
                                value={f.type}
                                onChange={(e) => f.setType(e.target.value)}
                                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                            >
                                <option value="img">Image</option>
                                <option value="vid">Video</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Language
                            </label>
                            <select
                                value={f.Language}
                                onChange={(e) => f.setLanguage(e.target.value)}
                                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                            >
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Headline
                            </label>
                            <input
                                type="text"
                                placeholder="Enter headline..."
                                value={f.title}
                                onChange={(e) => {
                                    f.setTitle(e.target.value);
                                    f.setSlug(f.createSlugText(e.target.value));
                                }}
                                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Category
                            </label>
                            <select
                                value={f.Topic}
                                onChange={(e) => {
                                    f.setTopic(e.target.value);
                                    f.setSubCategory("");
                                }}
                                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                            >
                                <option value="">Select Category</option>
                                {f.categoriesToDisplay.map((item, idx) => (
                                    <option key={item.key || idx} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Sub Category
                            </label>
                            <select
                                value={f.subCategory}
                                onChange={(e) => f.setSubCategory?.(e.target.value)}
                                className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                            >
                                <option value="">Select Sub Category</option>
                                {f.subCategoryData.map((item) => (
                                    <option key={item.key} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Jodit Editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Article Content
                        </label>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={f.insertTweetEmbed}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                𝕏 Insert Tweet/Post
                            </button>
                            <span className="text-xs text-indigo-400 font-medium">
                                💡 Tip: Multiple images drag & drop karke ya toolbar image icon se ek sath upload kar sakte hain.
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-700 text-slate-900 shadow-inner">
                        <JoditEditor
                            ref={f.editor}
                            value={f.desc}
                            config={f.joditConfig}
                            tabIndex={1}
                            onBlur={(newContent) => f.setdesc(newContent)}
                        />
                    </div>
                </div>

                {/* Tags and Meta Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-700/60">
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Tags ({f.keyword.length} selected)
                        </label>

                        {f.keyword.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-900/40 border border-slate-800 rounded-xl">
                                {f.keyword.map((tagVal, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/80 text-white border border-indigo-500/50 shadow-sm"
                                    >
                                        <span>{tagVal}</span>
                                        <button
                                            type="button"
                                            onClick={() => f.handleTagToggle(tagVal)}
                                            className="hover:text-rose-300 font-bold ml-0.5"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search tags..."
                                value={f.searchTag}
                                onChange={(e) => f.setSearchTag(e.target.value)}
                                className="w-full p-2.5 pl-9 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-500"
                            />
                            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {f.searchTag && (
                                <button
                                    type="button"
                                    onClick={() => f.setSearchTag("")}
                                    className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-3 max-h-40 overflow-y-auto flex flex-wrap gap-2">
                            {f.filteredOptions.length === 0 ? (
                                <span className="text-xs text-slate-500 italic p-1">No matching tags found</span>
                            ) : (
                                f.filteredOptions.map((option) => {
                                    const isSelected = f.keyword.includes(option.value);
                                    return (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => f.handleTagToggle(option.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${isSelected
                                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                                                }`}
                                        >
                                            <span>{option.label}</span>
                                            {isSelected && <span className="text-xs font-bold">✓</span>}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex gap-2 pt-1">
                            <input
                                type="text"
                                placeholder="Create new tag..."
                                ref={f.inputRef}
                                value={f.name}
                                onChange={(e) => f.setName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        f.addItem();
                                    }
                                }}
                                className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={f.addItem}
                                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm"
                            >
                                + Add Tag
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Reported By
                        </label>
                        <select
                            value={f.reported}
                            onChange={(e) => f.setreported(e.target.value)}
                            className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                        >
                            <option value="">Select Reporter</option>
                            <option value="लोकसत्य">लोकसत्य</option>
                        </select>

                        <div className="mt-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Publish By
                            </label>
                            <input
                                type="text"
                                readOnly
                                placeholder="Publish By"
                                value={f.publish}
                                className="w-full p-3 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-xl text-sm outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Slug
                        </label>
                        <input
                            type="text"
                            placeholder="article-url-slug"
                            value={f.slug}
                            onChange={(e) => f.setSlug(f.createSlugText(e.target.value))}
                            className="w-full p-3 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Switches & Main Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-700/60">
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-300 hover:text-white">
                            <input
                                type="checkbox"
                                checked={f.comment}
                                onChange={(e) => f.setComment(e.target.checked)}
                                className="w-5 h-5 rounded-md accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                            />
                            <span>Enable Comments</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-300 hover:text-white">
                            <input
                                type="checkbox"
                                checked={f.priority}
                                onChange={(e) => f.setPriority(e.target.checked)}
                                className="w-5 h-5 rounded-md accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                            />
                            <span>Priority Post</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-medium text-slate-300 hover:text-white">
                            <input
                                type="checkbox"
                                checked={f.slider}
                                onChange={(e) => f.setSlider(e.target.checked)}
                                className="w-5 h-5 rounded-md accent-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                            />
                            <span>Show in Slider</span>
                        </label>
                    </div>

                    <button
                        onClick={f.showVerifyModal}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:scale-[1.02]"
                    >
                        Preview & Publish
                    </button>
                </div>
            </div>

            {/* Modal Popup */}
            {f.isVerifyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Article Preview & Publication
                            </h2>
                            <button
                                onClick={() => f.setIsVerifyModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors text-xl font-bold w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {enableScheduling && (
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Schedule Publication (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={f.scheduleDateTime}
                                        onChange={(e) => f.setScheduleDateTime(e.target.value)}
                                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Headline</h3>
                                <p className="text-xl font-bold text-slate-100">{f.title}</p>
                            </div>

                            <hr className="border-slate-800" />

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Content Body</h3>
                                <div
                                    id="preview"
                                    className="prose prose-invert max-w-none text-slate-300 bg-slate-950 p-5 rounded-xl border border-slate-800"
                                ></div>
                            </div>

                            <hr className="border-slate-800" />

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h3>
                                    <p className="text-sm font-semibold text-slate-200 mt-1">{f.Topic || "N/A"}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Language</h3>
                                    <p className="text-sm font-semibold text-slate-200 mt-1">{f.Language}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags</h3>
                                    <p className="text-sm font-semibold text-indigo-400 mt-1">{f.keyword.join(", ") || "None"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                            <button
                                onClick={() => f.setIsVerifyModalOpen(false)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>

                            {enableScheduling && (
                                <button
                                    disabled={f.publishLoading || f.scheduleLoading}
                                    onClick={() => {
                                        if (!f.scheduleDateTime) {
                                            f.notify("Please select a schedule time", "warning");
                                            return;
                                        }
                                        f.onUpload(true);
                                    }}
                                    className="px-5 py-2.5 bg-slate-800 border border-indigo-500/50 hover:bg-slate-700 text-indigo-300 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {f.scheduleLoading ? "Scheduling..." : "Schedule"}
                                </button>
                            )}

                            <button
                                disabled={f.publishLoading || f.scheduleLoading}
                                onClick={() => {
                                    f.setScheduleDateTime("");
                                    if (f.onEdit) f.onEditHandle();
                                    else f.onUpload(false);
                                }}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-colors disabled:opacity-50"
                            >
                                {f.publishLoading
                                    ? "Publishing..."
                                    : f.onEdit
                                        ? "Save Changes"
                                        : "Publish Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}