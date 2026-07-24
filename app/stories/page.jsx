"use client";

import { API_URL } from "@/src/API";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { IoChevronBack, IoChevronForward, IoTimeOutline, IoPersonOutline } from "react-icons/io5";
import VisualStories from "@/src/Components/Global/VisualStories";

export default function TopStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4;

  const fetchTopStories = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/article?pagenation=true&limit=${limit}&page=${page}&type=img&newsType=topStories&status=online`
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
    fetchTopStories(currentPage);
  }, [currentPage]);

  const getArticleSlug = (data) => {
    if (data?.slug) return data.slug;
    return data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";
  };

  // ⚡ HTML डिस्क्रिप्शन से प्लेन टेक्स्ट निकालने का फ़ंक्शन
  const formatDescription = (htmlString) => {
    if (!htmlString) return "";
    const plainText = htmlString.replace(/<[^>]*>/g, "").trim();
    return plainText;
  };

  // ⚡ दिनांक फॉर्मेटिंग
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

  // 🏷️ SEO के लिए पहले समाचार की जानकारी निकालना
  const topStory = stories[0];
  const pageTitle = topStory 
    ? `${topStory.title} | शीर्ष आलेख - लोकसत्य` 
    : "शीर्ष आलेख और ताज़ा खबरें | लोकसत्य";
  const pageDescription = topStory 
    ? formatDescription(topStory.discription) 
    : "देश, दुनिया, मनोरंजन, और लाइफस्टाइल की मुख्य और ताज़ा शीर्ष खबरें पढ़ें।";
  const pageImage = topStory?.image || "/default-og-image.jpg";

  return (
    <>
      {/* 🎯 Dynamic Dynamic Meta Tags for SEO */}
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="शीर्ष आलेख, ताज़ा समाचार, मनोरंजन, लाइफस्टाइल, लोकसत्य न्यूज़" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Head>

      <div className="max-w-4xl p-4">
        {/* 📰 Main Container Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          
          {/* Header (शीर्ष आलेख) */}
          <div className="border-b-2 border-[#D90429] pb-2 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1.5 bg-[#D90429] rounded-full inline-block"></span>
              <h1 className="text-xl font-extrabold text-[#D90429] tracking-wide">
                शीर्ष आलेख
              </h1>
            </div>
          </div>

          {/* Stories List */}
          <div className="flex flex-col gap-5 min-h-[420px]">
            {loading ? (
              // Skeleton Loader
              Array(limit)
                .fill(0)
                .map((_, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3.5 items-start animate-pulse">
                    <div className="col-span-4 aspect-[4/3] bg-gray-200 rounded-xl" />
                    <div className="col-span-8 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
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
                    {/* Image Side (4 columns) */}
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

                    {/* Content Side (8 columns) */}
                    <div className="col-span-8 flex flex-col justify-between h-full">
                      <div>
                        {/* Title */}
                        <h2 className="text-xs sm:text-[13px] md:text-[14px] font-extrabold text-gray-900 group-hover:text-[#D90429] transition-colors leading-[1.35] line-clamp-2">
                          {item.title}
                        </h2>

                        {/* Description Preview */}
                        {cleanDescription && (
                          <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {cleanDescription}
                          </p>
                        )}
                      </div>

                      {/* Metadata Footer: ReportedBy & CreatedAt */}
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
                <strong className="text-gray-900">{totalPages}</strong>
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
      </div>

      {/* 🚀 Visual Stories Section */}
      <div className="w-full mt-6">
        <div className="bg-white rounded-2xl py-4 border border-gray-100 shadow-xs">
          <VisualStories />
        </div>
      </div>
    </>
  );
}