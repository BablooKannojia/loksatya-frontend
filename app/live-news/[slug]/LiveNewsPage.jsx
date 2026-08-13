"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { IoTimeOutline, IoPersonOutline } from "react-icons/io5";
import ShareButtons from "../../details/[slug]/ShareButtons";
import { API_URL } from "../../../src/API";
import TopStories from "../../../src/Components/Global/TopStories";
import SidebarLatestNews from "../../../src/Components/DetailsPage/SidebarLatestNews";

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

// ⚡ Details page jaisa hi skeleton
function LiveNewsSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="w-24 h-6 bg-gray-200 rounded-full" />
            <div className="w-full h-8 sm:h-12 bg-gray-200 rounded" />
            <div className="w-3/4 h-8 sm:h-12 bg-gray-200 rounded" />
            <div className="w-full h-12 border-y border-gray-200 py-3 flex justify-between items-center">
                <div className="w-48 h-4 bg-gray-200 rounded" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
            <div className="w-full h-[260px] sm:h-[400px] bg-gray-200 rounded-xl" />
            <div className="space-y-3 pt-4">
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-5/6 h-4 bg-gray-200 rounded" />
            </div>
        </div>
    );
}

export default function LiveNewsPage() {
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

    const shareUrl = `https://loksatya.com/live-news/${slug}`;

    const formattedDate = news?.updatedAt || news?.createdAt
        ? new Date(news.updatedAt || news.createdAt).toLocaleDateString("hi-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Main Content (8 Columns) */}
                <article className="lg:col-span-8">
                    {loading ? (
                        <LiveNewsSkeleton />
                    ) : error || !news ? (
                        <div className="py-20 text-center text-red-500 font-medium">
                            {error || "News not found"}
                        </div>
                    ) : (
                        <>
                            {/* Category + LIVE badge */}
                            <div className="flex items-center gap-2 mb-3">
                                {news.category && (
                                    <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {news.category}
                                    </span>
                                )}
                                {news.live && (
                                    <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        LIVE
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 leading-snug mb-4">
                                {news.title}
                            </h1>

                            {/* Meta Bar */}
                            <div className="flex flex-wrap items-center justify-between border-y border-gray-200 py-3 mb-6 text-sm text-gray-600 gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-1 font-medium text-gray-800">
                                        <IoPersonOutline className="text-base text-red-600" />
                                        <span>{news.reportedBy || "लोकसत्य"}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <IoTimeOutline className="text-base" />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>

                                <ShareButtons shareUrl={shareUrl} title={news.title} />
                            </div>

                            {/* Featured Image */}
                            {news.image && (
                                <div className="relative w-full h-[260px] sm:h-[400px] md:h-[450px] rounded-xl overflow-hidden mb-8 bg-gray-100 shadow-sm">
                                    <Image
                                        src={news.image}
                                        alt={news.title || "Live News Image"}
                                        fill
                                        priority={true}
                                        fetchPriority="high"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Intro description */}
                            <div
                                className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-4 font-sans"
                                dangerouslySetInnerHTML={{ __html: news.description }}
                            />

                            {/* Tags */}
                            {news.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {news.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* ================= LIVE UPDATES TIMELINE ================= */}
                            <div className="border-t border-gray-200 mt-10 pt-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                                    <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                                    लाइव अपडेट्स
                                </h2>

                                {updates.length === 0 ? (
                                    <p className="text-gray-400 text-sm">
                                        Abhi tak koi update nahi.
                                    </p>
                                ) : (
                                    <div className="relative border-l-2 border-gray-200 ml-2">
                                        {updates.map((u) => (
                                            <div key={u._id} className="relative pl-6 pb-8 last:pb-0">
                                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-600 border-4 border-white" />

                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                    <span className="font-semibold text-gray-700">
                                                        {formatClock(u.createdAt)}
                                                    </span>
                                                    <span>({timeAgo(u.createdAt)})</span>
                                                </div>

                                                {u.title && (
                                                    <h3 className="text-lg font-semibold mb-1 text-gray-900">
                                                        {u.title}
                                                    </h3>
                                                )}

                                                {u.postedBy && (
                                                    <p className="text-xs text-gray-400 mb-2">
                                                        Posted by: {u.postedBy}
                                                    </p>
                                                )}

                                                <div
                                                    className="prose prose-sm max-w-none text-gray-700"
                                                    dangerouslySetInnerHTML={{ __html: u.description }}
                                                />

                                                {u.image && (
                                                    <img
                                                        src={u.image}
                                                        alt=""
                                                        className="mt-3 w-full sm:w-96 rounded-lg max-h-64 object-cover"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </article>

                {/* Right: Sidebar (4 Columns) */}
                <aside className="lg:col-span-4">
                    <div className="sticky top-20 flex flex-col">
                        <TopStories />
                        <SidebarLatestNews />
                    </div>
                </aside>
            </div>
        </div>
    );
}