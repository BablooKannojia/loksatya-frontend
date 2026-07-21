"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  IoChevronBack,
  IoChevronForward,
  IoTimeOutline,
  IoPersonOutline,
  IoSearchSharp,
} from "react-icons/io5";
import TopStories from "../../src/Components/Global/TopStories";
import { API_URL } from "../../src/API";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawQuery = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(rawQuery);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setInputValue(rawQuery);
  }, [rawQuery]);

  const fetchSearchResults = useCallback(
    async (keyword, page) => {
      if (!keyword?.trim()) {
        setArticles([]);
        setTotalPages(1);
        setTotal(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const queryParams = new URLSearchParams({
          keyword: keyword.trim(),
          pagenation: "true",
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await axios.get(
          `${API_URL}/article?${queryParams.toString()}`
        );

        const resData = response.data;

        setArticles(resData?.data || []);
        setTotalPages(resData?.pages || 1);
        setTotal(resData?.total || 0);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setArticles([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchSearchResults(rawQuery, 1);
  }, [rawQuery, fetchSearchResults]);

  useEffect(() => {
    if (currentPage === 1) return;
    fetchSearchResults(rawQuery, currentPage);
  }, [currentPage, rawQuery, fetchSearchResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const getArticleSlug = (item) => {
    if (item?.slug) return item.slug;
    return item?.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";
  };

  const formatDescription = (htmlString, maxLength = 85) => {
    if (!htmlString) return "";
    const cleanText = htmlString.replace(/<[^>]*>/g, "").trim();
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-gray-50/50 py-4 font-devanagari">
      <div className="max-w-[1300px] mx-auto px-3 sm:px-4 flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-[70%] bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-xs">
          {/* Search Box */}
          <form onSubmit={handleSubmit} className="mb-5">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="खबर खोजें..."
                className="w-full rounded-lg border border-gray-300 bg-white pl-4 pr-12 py-3 text-sm sm:text-base outline-none focus:border-[#D90429] focus:ring-2 focus:ring-[#D90429]/20"
              />
              <button
                type="submit"
                aria-label="खोजें"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md bg-[#D90429] text-white hover:bg-[#b8031f] transition-colors"
              >
                <IoSearchSharp className="text-lg" />
              </button>
            </div>
          </form>

          {/* Section Header */}
          <div className="border-b-2 border-[#D90429] pb-3 mb-5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="h-6 w-1.5 bg-[#D90429] rounded-full inline-block"></span>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                {rawQuery ? `"${rawQuery}" के लिए परिणाम` : "खबर खोजें"}
              </h1>
            </div>
            {!loading && rawQuery && (
              <span className="text-xs sm:text-sm text-gray-500 font-medium">
                {total.toLocaleString("hi-IN")} परिणाम मिले
              </span>
            )}
          </div>

          {/* Articles List Container */}
          <div className="flex flex-col gap-4 min-h-[400px]">
            {loading ? (
              Array(limit)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3.5 sm:gap-4 items-center border-b border-gray-100 pb-4 last:border-none animate-pulse"
                  >
                    <div className="col-span-4 sm:col-span-3 relative aspect-[4/3] w-full bg-gray-200 rounded-xl" />
                    <div className="col-span-8 sm:col-span-9 flex flex-col justify-between py-1 space-y-2">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-md w-full" />
                        <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                        <div className="h-3 bg-gray-100 rounded-md w-4/5 hidden sm:block mt-1" />
                      </div>
                      <div className="flex items-center gap-4 pt-1">
                        <div className="h-3 bg-gray-200 rounded-md w-20" />
                        <div className="h-3 bg-gray-200 rounded-md w-16" />
                      </div>
                    </div>
                  </div>
                ))
            ) : !rawQuery ? (
              <div className="text-center py-16 text-gray-500 text-base">
                कुछ खोजने के लिए ऊपर टाइप करें।
              </div>
            ) : articles.length > 0 ? (
              articles.map((item) => {
                const articleSlug = getArticleSlug(item);
                const shortDescription = formatDescription(item.discription, 230);
                const formattedDate = formatDate(item.createdAt || item.publishAt);

                return (
                  <Link
                    key={item._id}
                    href={`/details/${articleSlug}?id=${item._id}`}
                    className="grid grid-cols-12 gap-3.5 sm:gap-4 items-center group cursor-pointer border-b border-gray-100 pb-4 last:border-none last:pb-0"
                  >
                    <div className="col-span-4 sm:col-span-3 relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 shadow-xs shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || "News"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 35vw, 200px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-sans">
                          No Image
                        </div>
                      )}

                      {item.topic && (
                        <span className="absolute top-2 left-2 bg-[#D90429] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                          {item.topic}
                        </span>
                      )}
                    </div>

                    <div className="col-span-8 sm:col-span-9 flex flex-col justify-between h-full py-0.5">
                      <div>
                        <h2 className="text-sm sm:text-base md:text-[17px] font-bold text-gray-900 group-hover:text-[#D90429] transition-colors leading-snug sm:leading-snug line-clamp-2">
                          {item.title}
                        </h2>

                        {shortDescription && (
                          <p className="text-xs sm:text-[13px] text-gray-600 mt-1 line-clamp-1 sm:line-clamp-2 leading-relaxed hidden sm:block">
                            {shortDescription}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-500 font-medium mt-2">
                        <div className="flex items-center gap-1.5 truncate text-gray-700">
                          <IoPersonOutline className="text-[#D90429] shrink-0 text-xs sm:text-sm" />
                          <span className="truncate">
                            {item.reportedBy || "लोकसत्य"}
                          </span>
                        </div>

                        {formattedDate && (
                          <div className="flex items-center gap-1 shrink-0 text-gray-400">
                            <IoTimeOutline className="text-xs sm:text-sm" />
                            <span>{formattedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-16 text-gray-500 text-base">
                "{rawQuery}" के लिए कोई खबर नहीं मिली।
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-[#D90429] hover:text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <IoChevronBack className="text-base" /> पिछला
              </button>

              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                पेज <strong className="text-gray-900">{currentPage}</strong> का{" "}
                <strong className="text-gray-900">
                  {totalPages.toLocaleString("hi-IN")}
                </strong>
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-[#D90429] hover:text-white rounded-lg disabled:opacity-40 disabled:hover:bg-gray-100 disabled:hover:text-gray-700 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                अगला <IoChevronForward className="text-base" />
              </button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[30%] shrink-0 sticky top-4">
          <TopStories />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px]" />}>
      <SearchContent />
    </Suspense>
  );
}