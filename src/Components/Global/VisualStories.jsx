"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStoryData } from "../../Context/StoryContext";
import OptimizedImg from "../OptimizedImage";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function VisualStories() {
  const router = useRouter();
  const { storyData, loading } = useStoryData();
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // === यहाँ फिक्स किया गया ===
  // चूंकि storyData खुद एक ऐरे है, हम सीधे उसे यूज़ करेंगे। 
  // सुरक्षा के लिए चेक कर लेते हैं कि वो ऐरे ही हो।
  const stories = Array.isArray(storyData) ? storyData : [];

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
      setTimeout(checkScrollLimits, 500);
    }
    return () => el?.removeEventListener("scroll", checkScrollLimits);
  }, [stories]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.6 : clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // 1. लोडिंग स्केलेटन
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 my-8 font-devanagari">
        <div className="h-7 bg-gray-200 rounded w-44 mb-4 animate-pulse"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="shrink-0 w-[140px] h-[220px] bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // 2. अगर डेटा अभी भी खाली है, तो कुछ रेंडर न करें
  if (stories.length === 0) return null;

  return (
    <div id="VisualStories" className="relative w-full max-w-7xl mx-auto px-5 my-8 font-devanagari group/section">
      
      {/* सेक्शन हेडर */}
      <div className="border-b-2 border-[#D90429] pb-2 mb-5 flex items-center justify-between">
        <h2 
          onClick={() => router.push("/story")}
          className="font-bold text-[20px] text-gray-900 flex items-center gap-2 cursor-pointer hover:text-[#D90429] transition-colors"
        >
          <span className="h-5 w-1.5 bg-[#D90429] rounded-full"></span>
          दृश्य कहानियाँ
        </h2>
      </div>

      {/* नैविगेशन बटन्स */}
      <div className="absolute top-[58%] -translate-y-1/2 left-2 right-2 z-10 flex justify-between pointer-events-none">
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          className="pointer-events-auto w-9 h-9 flex items-center justify-center rounded-full bg-white/95 shadow-md border border-gray-100 text-lg text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <IoChevronBack />
        </button>
        <button
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          className="pointer-events-auto w-9 h-9 flex items-center justify-center rounded-full bg-white/95 shadow-md border border-gray-100 text-lg text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <IoChevronForward />
        </button>
      </div>

      {/* हॉरिजॉन्टल स्क्रॉल कंटेनर (9:16 Aspect Ratio) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {stories.map((story) => {
          // इमेजेस ऐरे से सेफली डेटा निकालना
          const prioritizedImage = story.images?.find((image) => image.albumPeriority === true);
          const displayImage = prioritizedImage ? prioritizedImage.img : story.images?.[0]?.img;
          const displayText = prioritizedImage ? prioritizedImage.text : story.images?.[0]?.text;

          return (
            <a
              href={`/stories?id=${story._id}`}
              target="_blank"
              key={story._id}
              rel="noreferrer"
              className="shrink-0 w-[145px] sm:w-[155px] aspect-[9/16] snap-start relative rounded-xl overflow-hidden shadow-sm border border-gray-100 group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-gray-900"
            >
              {/* बैकग्राउंड इमेज */}
              <div className="absolute inset-0 w-full h-full">
                <OptimizedImg
                  src={displayImage}
                  alt={displayText || story.title || "Story"}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* बॉटम ग्रेडिएंट ओवरले */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* वेब स्टोरीज़ रेड इंडिकेटर टैग */}
              <div className="absolute top-2 left-2 bg-[#D90429] w-2 h-2 rounded-full animate-ping z-10" />
              <div className="absolute top-2 left-2 bg-[#D90429] w-2 h-2 rounded-full z-10" />

              {/* स्टोरी टाइटल */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-white text-[12px] sm:text-[13px] font-bold leading-[1.35] line-clamp-3 text-shadow-sm group-hover:underline">
                  {story.title}
                </p>
              </div>
            </a>
          );
        })}
      </div>

    </div>
  );
}