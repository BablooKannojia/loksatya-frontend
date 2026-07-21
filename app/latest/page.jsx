"use client";

import { API_URL } from "@/src/API";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoChevronBack, IoChevronForward, IoTimeOutline, IoPersonOutline } from "react-icons/io5";
import VisualStories from "@/src/Components/Global/VisualStories";
import TopStories from "../../src/Components/Global/TopStories";

export default function TopStoriesClient() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const fetchUpload = async (page) => {
    try {
      setLoading(true);
      // ⚡ FIX: Dynamic page `${page}` pass किया गया है
      const response = await axios.get(
        `${API_URL}/article?pagenation=true&limit=${limit}&page=${page}&type=img&newsType=upload&status=online`
      );
      const res = response.data;

      // API Data Binding
      setStories(res?.data || []);
      setTotalPages(res?.pages || 1);
    } catch (error) {
      console.error("Error fetching top stories:", error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpload(currentPage);
  }, [currentPage]);

  const getArticleSlug = (data) => {
    if (data?.slug) return data.slug;
    return data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";
  };

  const formatDescription = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/<[^>]*>/g, "").trim();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="lg:flex w-full items-start gap-6 px-4 max-w-[1400px] mx-auto mt-3">
        {/* Main Container Card (Added flex-1 to maintain width ratio) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex-1 w-full">
          
          {/* Header */}
          <div className="border-b-2 border-[#D90429] pb-2 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1.5 bg-[#D90429] rounded-full inline-block"></span>
              <h1 className="text-xl font-extrabold text-[#D90429] tracking-wide">
                ताजा खबर
              </h1>
            </div>
          </div>

          {/* Stories List */}
          <div className="flex flex-col gap-5 min-h-[420px]">
            {loading ? (
              /* ⚡ PERFECT MATCH SKELETON LOADER */
              Array(limit)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3.5 items-start border-b border-gray-50 pb-4 last:border-none last:pb-0 animate-pulse"
                  >
                    {/* Image Skeleton (4 Columns) */}
                    <div className="col-span-4 relative aspect-[4/3] w-full rounded-xl bg-gray-200 mt-0.5" />

                    {/* Content Skeleton (8 Columns) */}
                    <div className="col-span-8 flex flex-col justify-between h-full min-h-[85px] sm:min-h-[100px]">
                      <div>
                        {/* Title Lines */}
                        <div className="h-4 bg-gray-200 rounded-md w-full mb-2" />
                        <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2" />

                        {/* Description Lines */}
                        <div className="h-3 bg-gray-100 rounded-md w-11/12 mb-1 hidden sm:block" />
                        <div className="h-3 bg-gray-100 rounded-md w-2/3 hidden sm:block" />
                      </div>

                      {/* Footer Metadata Skeleton */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="h-3 bg-gray-200 rounded w-20" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
            ) : stories.length > 0 ? (
              stories.map((item) => {
                const itemSlug = getArticleSlug(item);
                const cleanDescription = formatDescription(item.discription);
                const formattedDate = formatDate(item.createdAt || item.updatedAt);

                return (
                  <Link
                    key={item._id}
                    href={`/details/${itemSlug}?id=${item._id}`}
                    className="grid grid-cols-12 gap-3.5 items-start group cursor-pointer border-b border-gray-50 pb-4 last:border-none last:pb-0"
                  >
                    {/* Image Side */}
                    <div className="col-span-4 relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 shadow-xs mt-0.5">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || "News"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 35vw, 150px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                      {item.topic && (
                        <span className="absolute top-1.5 left-1.5 bg-[#D90429] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shadow-xs">
                          {item.topic}
                        </span>
                      )}
                    </div>

                    {/* Content Side */}
                    <div className="col-span-8 flex flex-col justify-between h-full">
                      <div>
                        <h2 className="text-xs sm:text-[13px] md:text-[14px] font-extrabold text-gray-900 group-hover:text-[#D90429] transition-colors leading-[1.35] line-clamp-2">
                          {item.title}
                        </h2>

                        {cleanDescription && (
                          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {cleanDescription}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-gray-400 font-medium mt-2">
                        <div className="flex items-center gap-1 text-gray-600 truncate">
                          <IoPersonOutline className="text-red-600 shrink-0" />
                          <span className="truncate">{item.reportedBy || "लोकसत्य"}</span>
                        </div>

                        {formattedDate && (
                          <div className="flex items-center gap-1 shrink-0">
                            <IoTimeOutline />
                            <span>{formattedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-500">कोई समाचार उपलब्ध नहीं है।</div>
            )}
          </div>

          {/* 🔢 Dynamic Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-[#D90429] hover:text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-colors"
              >
                <IoChevronBack className="text-sm" /> पिछला
              </button>

              <span className="text-xs font-semibold text-gray-600">
                पेज <strong className="text-gray-900">{currentPage}</strong> का{" "}
                <strong className="text-gray-900">{totalPages.toLocaleString("hi-IN")}</strong>
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-[#D90429] hover:text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-colors"
              >
                अगला <IoChevronForward className="text-sm" />
              </button>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="lg:w-[30%] w-full shrink-0 lg:pt-0 pt-4">
          <TopStories />
        </div>
      </div>

      {/* Visual Stories Section */}
      <div className="w-full px-4 mt-6 max-w-[1400px] mx-auto">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <VisualStories />
        </div>
      </div>
    </>
  );
}