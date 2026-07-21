'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { API_URL } from '@/src/API';
import {
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoShareSocialOutline,
  IoArrowBack,
  IoRefreshOutline,
} from 'react-icons/io5';

export default function VisualStoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params?.id;

  // States
  const [storyData, setStoryData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  // Story ID से Data Fetch करने का Function
  const fetchStoryDetails = useCallback(async () => {
    if (!storyId) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/story?id=${storyId}`);
      const res = response.data;

      // API Data Binding (Array या Single Object दोनों को हैंडल करता है)
      const data = Array.isArray(res?.data) ? res?.data[0] : res?.data || res;
      setStoryData(data);
    } catch (error) {
      console.error('Error fetching story detail:', error);
      setStoryData(null);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    fetchStoryDetails();
  }, [fetchStoryDetails]);

  // Slides array extract
  const slides = storyData?.images || [];
  const currentSlide = slides[currentIndex];

  // Slide Navigation Handlers
  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Auto Advance Progress (5 Seconds per slide)
  useEffect(() => {
    if (loading || isPaused || slides.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, slides.length, isPaused, loading]);

  // Keyboard Control (Left / Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') router.back();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, router]);

  // Share Functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: storyData?.title || 'Visual Story',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-devanagari">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#D90429] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-400">स्टोरी लोड हो रही है...</p>
      </div>
    );
  }

  if (!storyData || slides.length === 0) {
    return (
      <div className="w-full h-screen bg-gray-950 flex flex-col items-center justify-center text-white px-4 text-center font-devanagari">
        <p className="text-lg font-bold mb-4">स्टोरी नहीं मिल सकी या डिलीट कर दी गई है।</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-[#D90429] hover:bg-[#b00320] px-5 py-2.5 rounded-xl font-semibold transition-all"
        >
          <IoArrowBack /> वापस जाएँ
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 flex items-center justify-center overflow-hidden font-devanagari select-none">
      
      {/* Desktop Web Background Overlay */}
      <div className="absolute inset-0 opacity-20 blur-2xl pointer-events-none hidden md:block">
        <Image
          src={currentSlide?.img || ''}
          alt="bg-blur"
          fill
          className="object-cover"
        />
      </div>

      {/* Main Story Container (App Frame View - 9:16 Aspect Ratio) */}
      <div 
        className="relative w-full h-full md:max-w-[420px] md:h-[92vh] md:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between border border-white/10"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        
        {/* Background Slide Image */}
        <div className="absolute inset-0 z-0">
          <Image
            key={currentIndex}
            src={currentSlide?.img || ''}
            alt={currentSlide?.text || storyData.title}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 420px"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />
        </div>

        {/* Top Header Bar */}
        <div className="relative z-20 p-3 sm:p-4 space-y-3">
          
          {/* Progress Bars (Story Indicator) */}
          <div className="flex gap-1.5 w-full">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-xs"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx < currentIndex
                      ? 'w-full'
                      : idx === currentIndex
                      ? isPaused
                        ? 'w-1/2'
                        : 'w-full duration-[5000ms] ease-linear'
                      : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between text-white pt-1">
            <button
              onClick={() => router.back()}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all cursor-pointer"
            >
              <IoClose className="text-xl" />
            </button>

            <div className="text-center px-2 flex-1">
              <span className="text-[11px] font-bold tracking-wider uppercase bg-[#D90429] text-white px-2.5 py-0.5 rounded-full shadow-sm">
                लोकसत्य विजुअल स्टोरी
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

        {/* Left & Right Touch Click Hotspots (Tap to Navigate) */}
        <div className="absolute inset-y-16 inset-x-0 z-20 flex justify-between pointer-events-auto">
          <div
            onClick={handlePrev}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-start pl-2 text-white/50"
          >
            {currentIndex > 0 && <IoChevronBack className="text-3xl" />}
          </div>
          <div
            onClick={handleNext}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-100 flex items-center justify-end pr-2 text-white/50"
          >
            {currentIndex < slides.length - 1 && (
              <IoChevronForward className="text-3xl" />
            )}
          </div>
        </div>

        {/* Bottom Slide Content */}
        <div className="relative z-30 p-5 sm:p-6 space-y-3">
          
          {/* Main Story Title (Shown prominently on 1st slide or small header) */}
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md inline-block">
            स्लाइड {currentIndex + 1} / {slides.length}
          </span>

          {/* Current Slide Text */}
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed drop-shadow-md">
            {currentSlide?.text || storyData?.title}
          </p>

          {/* Replay or Finish Control */}
          {currentIndex === slides.length - 1 && (
            <div className="pt-2">
              <button
                onClick={() => setCurrentIndex(0)}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                <IoRefreshOutline className="text-lg" /> दोबारा देखें
              </button>
            </div>
          )}
        </div>

      </div>

      {/* External Navigation Arrows for Desktop Screen */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <IoChevronBack className="text-2xl" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === slides.length - 1}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        <IoChevronForward className="text-2xl" />
      </button>

    </div>
  );
}