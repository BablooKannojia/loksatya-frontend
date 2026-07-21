'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../../src/API';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import {
  IoChevronBack,
  IoChevronForward,
  IoLayersOutline,
  IoSparklesOutline,
} from 'react-icons/io5';

export default function StoriesPage() {
  const [stories, setStory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // API Call Function
  const fetchTopStories = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/story?paginate=true&page=${page}&limit=${limit}`
      );
      const res = response.data;

      setStory(res?.data || []);
      // API response pagination handling (checking both res.pagination or root level totalPages)
      setTotalPages(res?.pagination?.totalPages || res?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching top stories:", error);
      setStory([]); // Fixed state name bug
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopStories(currentPage);
  }, [currentPage, fetchTopStories]);

  // Handle Page Change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-gray-50/50 py-8 min-h-screen font-devanagari">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-[#D90429] pb-3 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-[#D90429]/10 text-[#D90429] rounded-lg">
              <IoSparklesOutline className="text-xl sm:text-2xl" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              विजुअल स्टोरीज
            </h1>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-2xs">
            पेज {currentPage} / {totalPages}
          </span>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {loading ? (
            /* Skeleton Loading Grid */
            Array(limit)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[9/16] rounded-2xl bg-gray-200 animate-pulse overflow-hidden shadow-xs"
                >
                  <div className="absolute bottom-0 inset-x-0 p-4 space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-4/5"></div>
                  </div>
                </div>
              ))
          ) : stories.length > 0 ? (
            stories.map((item) => {
              // Extract Cover Image & Slides Count
              const coverImg = item?.images?.[0]?.img || '/placeholder.jpg';
              const slideCount = item?.images?.length || 0;

              return (
                <Link
                  key={item._id}
                  href={`/visual-stories/${item._id}`}
                  className="group relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
                >
                  {/* Visual Background Image */}
                  <Image
                    src={coverImg}
                    alt={item.title || "Visual Story"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />

                  {/* Top Gradient & Slide Counter Badge */}
                  <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/70 via-black/20 to-transparent flex justify-between items-center z-10">
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
                      <IoLayersOutline className="text-xs" />
                      {slideCount} इमेजेस
                    </span>
                  </div>

                  {/* Bottom Gradient Overlay & Title */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 flex flex-col justify-end">
                    <h2 className="text-xs sm:text-sm font-bold text-white line-clamp-3 leading-snug group-hover:text-amber-300 transition-colors drop-shadow-xs">
                      {item.title}
                    </h2>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500 font-medium">
              कोई स्टोरी उपलब्ध नहीं है।
            </div>
          )}
        </div>

        {/* Dynamic Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-[#D90429] hover:text-white hover:border-[#D90429] rounded-xl disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              <IoChevronBack className="text-base" /> पिछला
            </button>

            <span className="text-xs sm:text-sm font-semibold text-gray-600 hidden sm:inline-block">
              कुल <strong className="text-gray-900">{totalPages}</strong> में से पेज <strong className="text-gray-900">{currentPage}</strong>
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-[#D90429] hover:text-white hover:border-[#D90429] rounded-xl disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              अगला <IoChevronForward className="text-base" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}