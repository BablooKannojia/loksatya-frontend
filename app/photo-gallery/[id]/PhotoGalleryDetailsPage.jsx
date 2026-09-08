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
} from 'react-icons/io5';

export default function PhotoGalleryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params?.id;

  const [galleryData, setGalleryData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchGalleryDetails = useCallback(async () => {
    if (!photoId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/photo?id=${photoId}`);
      const res = response.data;
      const data = Array.isArray(res?.data) ? res?.data[0] : res?.data || res;
      setGalleryData(data);
    } catch (error) {
      console.error('Error fetching photo gallery details:', error);
      setGalleryData(null);
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    fetchGalleryDetails();
  }, [fetchGalleryDetails]);

  const getImageUrl = (imgObj) => {
    if (!imgObj) return '/placeholder.jpg';
    return imgObj?.img || imgObj?.image || imgObj?.url || '/placeholder.jpg';
  };

  const imagesList = galleryData?.images || [];
  const currentImageObj = imagesList[selectedIndex];

  // Preload next/prev images
  useEffect(() => {
    if (!imagesList.length) return;
    [selectedIndex + 1, selectedIndex - 1].forEach((idx) => {
      const url = getImageUrl(imagesList[idx]);
      if (url && url !== '/placeholder.jpg') {
        const img = new window.Image();
        img.src = url;
      }
    });
  }, [selectedIndex, imagesList]);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) setSelectedIndex((prev) => prev - 1);
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex < imagesList.length - 1) setSelectedIndex((prev) => prev + 1);
  }, [selectedIndex, imagesList.length]);

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: galleryData?.title || 'Photo Gallery',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, router]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-devanagari">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#D90429] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-400">फोटो लोड हो रही है...</p>
      </div>
    );
  }

  if (!galleryData || imagesList.length === 0) {
    return (
      <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center text-white px-4 text-center font-devanagari">
        <p className="text-lg font-bold mb-4">फोटो गैलरी नहीं मिली या डिलीट कर दी गई है।</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-[#D90429] hover:bg-[#b00320] px-5 py-2.5 rounded-xl font-semibold transition-all"
        >
          <IoClose /> वापस जाएँ
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 flex items-center justify-center overflow-hidden font-devanagari select-none">

      {/* Desktop Background Blur */}
      <div className="absolute inset-0 opacity-20 blur-2xl pointer-events-none hidden md:block">
        <Image
          src={getImageUrl(currentImageObj)}
          alt="bg-blur"
          fill
          unoptimized
          className="object-cover"
        />
      </div>

      {/* Main Frame (9:16 Story View) */}
      <div className="relative w-full h-full md:max-w-[420px] md:h-[92vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between border border-white/10">

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            key={selectedIndex}
            src={getImageUrl(currentImageObj)}
            alt={currentImageObj?.text || galleryData?.title}
            fill
            unoptimized
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 420px"
          />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
        </div>

        {/* Top Header */}
        <div className="relative z-20 p-3 sm:p-4 space-y-3">

          {/* Progress Bars */}
          <div className="flex gap-1.5 w-full">
            {imagesList.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-xs"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx <= selectedIndex ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between text-white pt-1">
            <button
              onClick={handleClose}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all cursor-pointer"
            >
              <IoClose className="text-xl" />
            </button>

            <div className="text-center px-2 flex-1 flex items-center justify-center gap-1.5">
              <IoImagesOutline className="text-xs" />
              <span className="text-[11px] font-bold tracking-wider uppercase bg-[#D90429] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                लोकसत्य फोटो गैलरी
              </span>
            </div>

            <button
              onClick={handleShare}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all cursor-pointer relative"
            >
              <IoShareSocialOutline className="text-lg" />
              {copied && (
                <span className="absolute -bottom-8 right-0 bg-white text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  लिंक कॉपी हो गया!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tap Hotspots */}
        <div className="absolute inset-y-16 inset-x-0 z-20 flex justify-between pointer-events-auto">
          <div
            onClick={handlePrev}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-start pl-2 text-white/50"
          >
            {selectedIndex > 0 && <IoChevronBack className="text-3xl" />}
          </div>
          <div
            onClick={handleNext}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-end pr-2 text-white/50"
          >
            {selectedIndex < imagesList.length - 1 && (
              <IoChevronForward className="text-3xl" />
            )}
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 sm:px-8 pointer-events-none">
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md inline-block">
            फोटो {selectedIndex + 1} / {imagesList.length}
          </span>

          <p className="text-base sm:text-lg font-bold text-white leading-relaxed drop-shadow-md">
            {currentImageObj?.text || galleryData?.title}
          </p>
        </div>

      </div>

      {/* Desktop External Arrows */}
      <button
        onClick={handlePrev}
        disabled={selectedIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <IoChevronBack className="text-2xl" />
      </button>

      <button
        onClick={handleNext}
        disabled={selectedIndex === imagesList.length - 1}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <IoChevronForward className="text-2xl" />
      </button>

    </div>
  );
}