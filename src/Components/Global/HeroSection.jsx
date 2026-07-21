"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function HeroSection({ sliderData = [] }) {
  const router = useRouter();
  
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // ⚡ NULL Safety Check
  const safeSliderData = sliderData || [];
  const mainArticle = safeSliderData[0];
  const gridArticles = safeSliderData.slice(1, 4);

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollLimits);
      setTimeout(checkScrollLimits, 600);
    }
    return () => el?.removeEventListener("scroll", checkScrollLimits);
  }, [gridArticles]);

  // 🚀 Auto Scroll Logic (3 सेकंड में स्वैप + Infinite Loop)
  useEffect(() => {
    if (gridArticles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth * 0.75, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [gridArticles.length, isPaused]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const formatTitleForUrl = (title = "") => {
    return title.replace(/[/\%.?]/g, "").split(" ").join("-");
  };

  const handleNavigation = (article) => {
    const formattedTitle = formatTitleForUrl(article.title);
    const slug = article.slug ? article.slug : formattedTitle;
    router.push(`/details/${slug}?id=${article._id}`);
  };

  // ⚡ PERFECT CLS SKELETON: Exactly Matches Actual Render Height & Margins
  if (safeSliderData.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4 animate-pulse">
        {/* Top Skeleton (Matches exact height & mt of Main Image) */}
        <div className="w-full h-[260px] sm:h-[350px] md:h-[440px] bg-gray-200 rounded-lg mt-2 md:mt-3" />
        {/* Bottom Skeleton Grid */}
        <div className="w-full flex md:grid md:grid-cols-3 gap-3 md:gap-4 mt-1 md:mt-3 overflow-hidden">
          <div className="min-w-[82vw] sm:min-w-[280px] md:min-w-0 w-full h-[160px] md:h-[180px] bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="min-w-[82vw] sm:min-w-[280px] md:min-w-0 w-full h-[160px] md:h-[180px] bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="min-w-[82vw] sm:min-w-[280px] md:min-w-0 w-full h-[160px] md:h-[180px] bg-gray-200 rounded-lg flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 relative group/section">
      
      {/* 1. TOP BIG NEWS */}
      {mainArticle && (
        <div 
          onClick={() => handleNavigation(mainArticle)}
          className="w-full h-[260px] sm:h-[350px] md:h-[440px] relative rounded-lg overflow-hidden cursor-pointer group shadow-md mt-2 md:mt-3 bg-gray-100"
        >
          <Image
            src={mainArticle.image}
            alt={mainArticle.title || "Main news article"}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority={true}
            fetchPriority="high" 
            className="object-cover transition-transform"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10">
            <h2 className="text-white text-base sm:text-xl md:text-2xl font-bold leading-snug hover:text-red-400 transition-colors duration-200 line-clamp-3 md:line-clamp-none">
              {mainArticle.title}
            </h2>
          </div>
        </div>
      )}

      {/* 2. BOTTOM CAROUSEL GRID */}
      {gridArticles.length > 0 && (
        <div 
          className="relative w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* नैविगेशन बटन्स (Desktop Only) */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 right-2 z-20 justify-between pointer-events-none h-10">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous Slide"
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/95 shadow-lg border border-gray-100 text-xl text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
            >
              <IoChevronBack />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next Slide"
              className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/95 shadow-lg border border-gray-100 text-xl text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
            >
              <IoChevronForward />
            </button>
          </div>

          {/* स्क्रॉल कंटेनर */}
          <div 
            ref={scrollRef}
            className="w-full flex md:grid md:grid-cols-3 gap-3 md:gap-4 mt-1 md:mt-3 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-2 md:pb-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {gridArticles.map((article) => (
              <div 
                key={article._id} 
                onClick={() => handleNavigation(article)}
                className="min-w-[82vw] sm:min-w-[280px] md:min-w-0 w-full h-[160px] md:h-[180px] relative rounded-lg overflow-hidden cursor-pointer group shadow-sm flex-shrink-0 snap-start bg-gray-100"
              >
                <Image
                  src={article.image}
                  alt={article.title || "Grid news article"}
                  fill
                  sizes="(max-width: 768px) 80vw, 23vw"
                  loading="lazy" 
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <p className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-snug hover:text-red-400 transition-colors duration-200 whitespace-normal">
                    {article.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}