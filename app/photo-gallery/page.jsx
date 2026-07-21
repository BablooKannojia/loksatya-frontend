'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { API_URL } from '@/src/API';
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoImagesOutline,
  IoEyeOutline,
  IoLayersOutline,
} from 'react-icons/io5';
import Link from 'next/link'

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Lightbox Modal States
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const limit = 12;

  // Helper Function: API Response से सही Image URL निकालने के लिए
  const getImageUrl = (item) => {
    if (!item) return '/placeholder.jpg';

    // 1. अगर images ऐरे के अंदर पहला ऑब्जेक्ट है और उसमें img है
    if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImgObj = item.images[0];
      if (firstImgObj?.img) return firstImgObj.img;
      if (firstImgObj?.image) return firstImgObj.image;
      if (firstImgObj?.url) return firstImgObj.url;
    }

    // 2. Direct Properties Check
    if (item.img) return item.img;
    if (item.image) return item.image;
    if (item.url) return item.url;

    return '/placeholder.jpg';
  };

  // API Call Function
  const fetchPhotos = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/photo?paginate=true&page=${page}&limit=${limit}`
      );
      const res = response.data;

      setPhotos(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || res?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPhotos(currentPage);
  }, [currentPage, fetchPhotos]);

  // Page Change Handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Lightbox Navigation
  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex((prev) => prev - 1);
    }
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full bg-gray-50/50 py-8 min-h-screen font-devanagari">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-[#D90429] pb-3 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#D90429]/10 text-[#D90429] rounded-xl">
              <IoImagesOutline className="text-xl sm:text-2xl" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              फोटो गैलरी
            </h1>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-500 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            पेज {currentPage} / {totalPages}
          </span>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            /* Skeleton Loader */
            Array(limit)
              .fill(0)
              .map((_, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-2xl bg-gray-200 animate-pulse overflow-hidden shadow-xs"
                />
              ))
          ) : photos.length > 0 ? (
            photos.map((item, index) => {
              const photoImg = getImageUrl(item);
              const imageCount = item?.images?.length || 0;
              const photoId = item._id || item.id;

              return (
                <Link key={photoId || index}
                  href={`/photo-gallery/${photoId}`}
                  className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 block">
                  <Image
                    src={photoImg}
                    alt={item.title || 'Photo'}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  />


                  {/* Top Badge: Image Count (यदि एल्बम में एक से ज्यादा फोटो हैं) */}
                  {imageCount > 1 && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                        <IoLayersOutline className="text-xs" /> {imageCount}
                      </span>
                    </div>
                  )}

                  {/* Dark Hover Overlay & Title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                    <div className="flex justify-end">
                      <span className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full">
                        <IoEyeOutline className="text-lg" />
                      </span>
                    </div>
                    {item.title && (
                      <p className="text-xs sm:text-sm font-semibold text-white line-clamp-2 drop-shadow-sm leading-snug">
                        {item.title}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500 font-medium">
              कोई फोटो उपलब्ध नहीं है।
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

      {/* 🚀 Lightbox Modal View */}
      {selectedPhotoIndex !== null && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-50"
          >
            <IoClose className="text-2xl" />
          </button>

          {/* Previous Button */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-50"
            >
              <IoChevronBack className="text-2xl" />
            </button>
          )}

          {/* Next Button */}
          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={handleNextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-50"
            >
              <IoChevronForward className="text-2xl" />
            </button>
          )}

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center"
          >
            <div className="relative w-full h-[65vh] sm:h-[75vh]">
              <Image
                src={getImageUrl(photos[selectedPhotoIndex])}
                alt={photos[selectedPhotoIndex]?.title || 'Photo Large View'}
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>

            {/* Title / Caption */}
            {photos[selectedPhotoIndex]?.title && (
              <p className="mt-4 text-center text-white text-sm sm:text-base font-medium max-w-2xl px-4 leading-relaxed">
                {photos[selectedPhotoIndex].title}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}