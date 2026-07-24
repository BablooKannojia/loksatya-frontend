"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStoryData } from "../../Context/StoryContext";
import OptimizedImg from "../OptimizedImage";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaGreaterThan } from "react-icons/fa6";

export default function VisualStories() {
  const router = useRouter();
  const { storyData, loading } = useStoryData();
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const stories = Array.isArray(storyData.data) ? storyData.data : [];

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
      requestAnimationFrame(checkScrollLimits);
    }
    return () => el?.removeEventListener("scroll", checkScrollLimits);
  }, [stories.length]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.6 : clientWidth * 0.6;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // 1️⃣ 0 CLS: स्केलेटन में भी बिल्कुल वही विड्थ और aspect-[9/16] दिया ताकि लोड होने से पहले और बाद में 1 पिक्सेल का भी अंतर न आए
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 my-8 font-devanagari min-h-[338px] box-border">
        {/* हेडर स्केलेटन */}
        <div className="border-b-2 border-gray-150 pb-2 mb-5 h-[38px] flex items-center">
          <div className="h-6 bg-gray-200 rounded w-44 animate-pulse"></div>
        </div>
        {/* कार्ड्स स्केलेटन (सटीक विड्थ और आस्पेक्ट रेश्यो लॉक) */}
        <div className="flex gap-4 overflow-hidden min-h-[276px]">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div 
              key={n} 
              className="shrink-0 w-[145px] sm:w-[155px] aspect-[9/16] bg-gray-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // 2️⃣ 0 CLS Safeguard: अगर डेटा न हो, तो बिना लेआउट शिफ्ट के सेफ रिटर्न
  if (!loading && stories.length === 0) return null;

  return (
    <div id="VisualStories" className="relative w-full max-w-7xl mx-auto px-5 my-8 font-devanagari group/section min-h-[338px] box-border">
      
      {/* सेक्शन हेडर */}
      <div className="border-b-2 border-[#D90429] pb-2 mb-5 flex items-center justify-between h-[38px]">
        <h2 
          className="font-bold text-[20px] text-gray-900 flex items-center gap-2"
        >
          <span className="h-5 w-1.5 bg-[#D90429] rounded-full"></span>
          दृश्य कहानियाँ
        </h2>
        <h2
          className="flex items-center text-xs font-bold text-[#D90429] hover:text-[#D90429] cursor-pointer pt-2 select-none h-[24px]"
          onClick={() => router.push(`/story`)}
        >
          <span>{"और भी"}</span>
          <FaGreaterThan className="ml-1 text-[8px]" />
        </h2>
      </div>

      {/* नैविगेशन बटन्स */}
      <div className="absolute top-[60%] -translate-y-1/2 left-2 right-2 z-10 flex justify-between pointer-events-none h-9">
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
          className="pointer-events-auto w-9 h-9 flex items-center justify-center rounded-full bg-white/95 shadow-lg border border-gray-100 text-lg text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <IoChevronForward />
        </button>
      </div>

      {/* हॉरिजॉन्टल स्क्रॉल कंटेनर */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none min-h-[276px] content-start"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {stories.map((story) => {
          const prioritizedImage = story.images?.find((image) => image.albumPeriority === true);
          const displayImage = prioritizedImage ? prioritizedImage.img : story.images?.[0]?.img;
          const displayText = prioritizedImage ? prioritizedImage.text : story.images?.[0]?.text;

          return (
            <a
              href={`/visual-stories/${story._id}`}
              target="_blank"
              key={story._id}
              rel="noreferrer"
              className="shrink-0 w-[145px] sm:w-[155px] aspect-[9/16] snap-start relative rounded-xl overflow-hidden shadow-sm border border-gray-100 group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-gray-900 box-border"
            >
              {/* बैकग्राउंड इमेज */}
              <div className="absolute inset-0 w-full h-full bg-gray-800">
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

              {/* स्टोरी टाइटल (नियत ऊंचाई के साथ सीमित लाइन्स) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10 h-[70px] flex items-end">
                <p className="text-white text-[12px] sm:text-[13px] font-bold leading-[1.35] line-clamp-3 text-shadow-sm group-hover:underline break-words w-full">
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