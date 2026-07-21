"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useHomeData } from "../../Context/HomeContext";
import OptimizedImg from "../OptimizedImage";
import { IoChevronBack, IoChevronForward, IoCameraSharp } from "react-icons/io5";
import { FaGreaterThan } from "react-icons/fa6";
import { useRouter } from "next/navigation";


export default function PhotoGallery() {
  const { homeData, loading } = useHomeData();
  const scrollRef = useRef(null);
  const router = useRouter();
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const photos = homeData?.photos || [];

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
  }, [photos]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // 1️⃣ 0 CLS: लोडिंग स्टेट में सादे स्केलेटन की जगह परफेक्ट हाइट वाला लेआउट प्लेसहोल्डर
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-5 my-8 font-devanagari min-h-[305px]">
        {/* हेडर स्केलेटन */}
        <div className="border-b-2 border-gray-150 pb-2 mb-5 h-[38px] flex items-center">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        {/* कार्ड्स स्केलेटन */}
        <div className="flex gap-5 overflow-hidden min-h-[247px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="shrink-0 w-56 bg-white rounded-xl border border-gray-100 p-0 overflow-hidden space-y-3 h-[245px]">
              <div className="w-full h-36 bg-gray-200 animate-pulse"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2️⃣ 0 CLS Safeguard: अगर डेटा नहीं है, तो अचानक गायब होने के बजाय सेफ रिटर्न
  if (!loading && photos.length === 0) return null;

  return (
    <div id="Photos" className="relative w-full max-w-7xl mx-auto px-5 my-8 font-devanagari group/section min-h-[305px]">
      
      {/* सेक्शन हेडिंग */}
      <div className="border-b-2 border-[#D90429] pb-2 mb-5 flex items-center justify-between h-[38px]">
        <h2 className="font-bold text-[20px] text-gray-900 flex items-center gap-2">
          <span className="h-5 w-1.5 bg-[#D90429] rounded-full"></span>
          फ़ोटो गैलरी
        </h2>

        <h2
          className="flex items-center text-xs font-bold text-[#D90429] hover:text-[#D90429] cursor-pointer pt-2 select-none h-[24px]"
          onClick={() => router.push(`/photo-gallery`)}
        >
          <span>{"और भी"}</span>
          <FaGreaterThan className="ml-1 text-[8px]" />
        </h2>
      </div>

      {/* नैविगेशन बटन्स */}
      <div className="absolute top-[60%] -translate-y-1/2 left-2 right-2 z-10 flex justify-between pointer-events-none h-10">
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/95 shadow-lg border border-gray-100 text-xl text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <IoChevronBack />
        </button>
        <button
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/95 shadow-lg border border-gray-100 text-xl text-gray-800 transition-all duration-200 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <IoChevronForward />
        </button>
      </div>

      {/* हॉरिजॉन्तल स्क्रॉल कंटेनर - Fixed dimensions to stop dynamic shifting */}
      <div 
        ref={scrollRef} 
        className="flex overflow-x-auto gap-5 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none min-h-[247px] content-start"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {photos.map((img) => {
          const prioritizedImage = img?.images?.find((image) => image.albumPeriority === true);
          const displayImage = prioritizedImage ? prioritizedImage.img : img?.images?.[0]?.img;
          const displayText = prioritizedImage ? prioritizedImage.text : img?.images?.[0]?.text;

          const totalImages = img?.images?.length || 0;
          const displayCount = totalImages < 10 ? `0${totalImages}` : totalImages;

          return (
            <div 
              key={img._id} 
              className="shrink-0 w-56 snap-start group bg-white rounded-xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 h-[245px] box-border"
            >
              {/* इमेज लिंक (Fixed aspect box) */}
              <Link href={`/photo-gallery/${img?._id}`} className="block w-full relative h-36 overflow-hidden bg-gray-100">
                <OptimizedImg 
                  src={displayImage} 
                  alt={displayText || img?.title || "Photo"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              {/* फोटो का टाइटल और कैमरा काउंट (Fixed height placeholders) */}
              <div className="p-3 space-y-2">
                <Link 
                  href={`/photo-gallery/${img?._id}`} 
                  className="block text-[13.5px] font-bold text-gray-800 group-hover:text-[#D90429] transition-colors duration-200 line-clamp-2 h-[38px] leading-snug break-words"
                >
                  {img?.title}
                </Link>

                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 pt-1 border-t border-gray-100 h-[22px]">
                  <span className="text-[10px] tracking-wider uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    एल्बम
                  </span>
                  <div className="flex gap-1 items-center text-[#D90429] bg-[#D90429]/10 px-2 py-0.5 rounded-full font-mono">
                    <IoCameraSharp className="text-[13px]" />
                    <span>{displayCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}