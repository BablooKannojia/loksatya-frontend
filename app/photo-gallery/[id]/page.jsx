'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { API_URL } from '@/src/API';
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoShareSocialOutline,
  IoImagesOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
} from 'react-icons/io5';

export default function PhotoGalleryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params?.id;

  const [galleryData, setGalleryData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // API Call Function
  const fetchGalleryDetails = useCallback(async () => {
    if (!photoId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/photo?id=${photoId}`);
      const res = response.data;

      // API Response normalization
      const data = Array.isArray(res?.data) ? res?.data[0] : res?.data || res;
      setGalleryData(data);
    } catch (error) {
      console.error('Error fetching photo gallery details:', error);
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    fetchGalleryDetails();
  }, [fetchGalleryDetails]);

  // Safe Image Extractor Helper
  const getImageUrl = (imgObj) => {
    if (!imgObj) return '/placeholder.jpg';
    return imgObj?.img || imgObj?.image || imgObj?.url || '/placeholder.jpg';
  };

  const imagesList = galleryData?.images || [];
  const currentImageObj = imagesList[selectedIndex];

  // Navigation Handlers
  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex < imagesList.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  }, [selectedIndex, imagesList.length]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') router.back();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, router]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-devanagari">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#D90429] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-400">फोटो लोड हो रही है...</p>
      </div>
    );
  }

  if (!galleryData) {
    return (
      <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-devanagari">
        <p className="text-lg font-semibold text-gray-300 mb-4">फोटो गैलरी नहीं मिली!</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 bg-[#D90429] text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          वापस जाएं
        </button>
      </div>
    );
  }

  // Formatting Date
  const formattedDate = galleryData?.createdAt
    ? new Date(galleryData.createdAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full min-h-screen bg-gray-950 text-white flex flex-col font-devanagari select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer border border-gray-700"
        >
          <IoClose className="text-lg" /> बंद करें
        </button>

        <div className="flex items-center gap-2 max-w-[50%] sm:max-w-xl">
          <span className="p-1.5 bg-[#D90429]/20 text-[#D90429] rounded-lg shrink-0">
            <IoImagesOutline className="text-lg" />
          </span>
          <h1 className="text-xs sm:text-sm font-semibold text-gray-200 truncate">
            {galleryData.title || 'फोटो गैलरी विवरण'}
          </h1>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: galleryData?.title,
                url: window.location.href,
              });
            }
          }}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 transition-all cursor-pointer border border-gray-700"
          title="शेयर करें"
        >
          <IoShareSocialOutline className="text-lg" />
        </button>
      </header>

      {/* 2. MAIN CONTENT AREA (Split Layout: Left Image / Right Details) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* LEFT COLUMN: Main Image Viewer & Thumbnail Controls (8 Cols) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Main Large Image Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-2xl">
            
            {/* Left Nav Arrow */}
            {selectedIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/60 hover:bg-[#D90429] text-white rounded-full transition-all cursor-pointer border border-white/10"
              >
                <IoChevronBack className="text-xl sm:text-2xl" />
              </button>
            )}

            {/* Main Image */}
            <Image
              src={getImageUrl(currentImageObj)}
              alt={currentImageObj?.text || galleryData?.title || 'Gallery View'}
              fill
              unoptimized
              priority
              className="object-contain"
            />

            {/* Right Nav Arrow */}
            {selectedIndex < imagesList.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/60 hover:bg-[#D90429] text-white rounded-full transition-all cursor-pointer border border-white/10"
              >
                <IoChevronForward className="text-xl sm:text-2xl" />
              </button>
            )}

            {/* Photo Counter Badge */}
            <div className="absolute bottom-3 left-3 z-20 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-400 border border-white/10">
              फोटो {selectedIndex + 1} / {imagesList.length}
            </div>
          </div>

          {/* Bottom Thumbnail Strip */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                    idx === selectedIndex
                      ? 'border-[#D90429] scale-105 opacity-100 shadow-md ring-2 ring-[#D90429]/40'
                      : 'border-gray-800 opacity-40 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={`thumb-${idx}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: Full Text & Content Details (4 Cols) */}
        <section className="lg:col-span-5 xl:col-span-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            {/* Meta Info: Date Badge */}
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 border-b border-gray-800 pb-3">
                <IoCalendarOutline className="text-base text-[#D90429]" />
                <span>{formattedDate}</span>
              </div>
            )}

            {/* Gallery Main Title */}
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug tracking-tight">
              {galleryData.title}
            </h2>

            {/* Current Image Specific Content/Description */}
            <div className="pt-2 border-t border-gray-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <IoDocumentTextOutline className="text-sm" /> फ़ोटो विवरण ({selectedIndex + 1}/{imagesList.length}):
              </div>

              {currentImageObj?.text ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal whitespace-pre-line bg-black/30 p-4 rounded-xl border border-gray-800/50">
                  {currentImageObj.text}
                </p>
              ) : (
                <p className="text-xs text-gray-500 italic bg-black/20 p-3 rounded-lg">
                  इस फोटो के लिए कोई अलग विवरण उपलब्ध नहीं है।
                </p>
              )}
            </div>

          </div>

          {/* Footer Quick Navigation Info */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>कीबोर्ड एरो (← →) से बदलें</span>
            <span className="font-semibold text-gray-300">
              {selectedIndex + 1} ऑफ {imagesList.length}
            </span>
          </div>

        </section>

      </main>

    </div>
  );
}