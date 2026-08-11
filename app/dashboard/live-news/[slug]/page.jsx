"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { API_URL } from "../../../../src/API";

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

export default function PublicLiveNewsPage() {
    const { slug } = useParams();

    const [news, setNews] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNews = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/live-news/${slug}`);
            setNews(res.data.news);
            setUpdates(res.data.updates || []);
        } catch (err) {
            console.error(err);
            setError("News load nahi ho payi");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Har 30 sec me naye updates check karo — jab tak news "live" hai
    useEffect(() => {
        if (!news?.live) return;
        const interval = setInterval(fetchNews, 30000);
        return () => clearInterval(interval);
    }, [news?.live, fetchNews]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
                Loading...
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
                {error || "News not found"}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-20 backdrop-blur">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    {news.live && (
                        <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            LIVE
                        </span>
                    )}
                    <span className="text-xs text-slate-400 uppercase tracking-wide">
                        {news.category}
                        {news.subCategory ? ` • ${news.subCategory}` : ""}
                    </span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Title */}
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-3">
                    {news.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-6">
                    {news.reportedBy && <span>By {news.reportedBy}</span>}
                    <span>•</span>
                    <span>Updated {timeAgo(news.updatedAt)}</span>
                </div>

                {/* Main image */}
                {news.image && (
                    <img
                        src={news.image}
                        alt={news.title}
                        className="w-full rounded-xl object-cover max-h-[420px] mb-6"
                    />
                )}

                {/* Intro description */}
                <div
                    className="prose prose-invert max-w-none mb-8 text-slate-200"
                    dangerouslySetInnerHTML={{ __html: news.description }}
                />

                {/* Gallery */}
                {news.gallery?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                        {news.gallery.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt=""
                                className="rounded-lg h-28 w-full object-cover"
                            />
                        ))}
                    </div>
                )}

                {/* Tags */}
                {news.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {news.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* ================= LIVE UPDATES TIMELINE ================= */}
                <div className="border-t border-slate-800 pt-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                        लाइव अपडेट्स
                    </h2>

                    {updates.length === 0 ? (
                        <p className="text-slate-500 text-sm">
                            Abhi tak koi update nahi.
                        </p>
                    ) : (
                        <div className="relative border-l-2 border-slate-800 ml-2">
                            {updates.map((u) => (
                                <div key={u._id} className="relative pl-6 pb-8 last:pb-0">
                                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-4 border-slate-950" />

                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                        <span className="font-semibold text-slate-300">
                                            {formatClock(u.createdAt)}
                                        </span>
                                        <span>({timeAgo(u.createdAt)})</span>
                                    </div>

                                    {u.title && (
                                        <h3 className="text-lg font-semibold mb-1">
                                            {u.title}
                                        </h3>
                                    )}

                                    {u.postedBy && (
                                        <p className="text-xs text-slate-500 mb-2">
                                            Posted by: {u.postedBy}
                                        </p>
                                    )}

                                    <div
                                        className="prose prose-invert prose-sm max-w-none text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: u.description }}
                                    />

                                    {u.image && (
                                        <img
                                            src={u.image}
                                            alt=""
                                            className="mt-3 w-50 rounded-lg max-h-64 object-cover"
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
        </div>
    );
}