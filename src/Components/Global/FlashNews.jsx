"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useHomeData } from "../../Context/HomeContext";

export default function FlashNews() {
  const { homeData, loading } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fade, setFade] = useState(true);

  const data = homeData?.flashNews || [];

  useEffect(() => {
    if (data.length === 0) return;
    
    const timer = setInterval(() => {
      // टेक्स्ट बदलने से ठीक पहले स्मूथ फेड-आउट एनिमेट करें
      setFade(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length);
        setFade(true);
      }, 300); // 300ms का एनीमेशन डिले
      
    }, 4000);
    
    return () => clearInterval(timer);
  }, [data.length]);

  // अगर यूजर ने मैन्युअली बंद कर दिया है, तभी गायब करें
  if (!isVisible) return null;

  // 1️⃣ 0 CLS: लोडिंग स्टेट या जब तक डेटा खाली है, तब तक खाली स्पेस रिजर्व रखें ताकि नीचे का लेआउट न हिले
  if (loading || data.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto lg:px-4 px-2 my-3 pt-4 box-border">
        {/* कंस्ट्रक्टेड डमी पट्टी जो बिल्कुल असली पट्टी जितनी जगह घेर कर रखेगी */}
        <div className="h-[46px] w-full bg-gray-100 rounded-full border border-gray-200/50 animate-pulse" />
      </div>
    );
  }

  const currentNews = data[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto lg:px-4 px-2 my-3 pt-4 font-devanagari box-border">
      {/* 2️⃣ Fixed height container inside ensures no vertical pixel moves */}
      <div className="relative flex items-center justify-between bg-[#393939] text-white rounded-full h-[46px] px-6 shadow-md overflow-hidden">
        
        {/* Label Tag (Fixed Size) */}
        <div className="flex items-center flex-shrink-0 select-none">
          <span className="font-extrabold italic text-[14px] uppercase tracking-wider text-[#D90429] animate-pulse">
            BREAKING NEWS
          </span>
          <span className="mx-3 text-white/30">|</span>
        </div>
        
        {/* News Content Wrapper with Smooth Fade Transition */}
        <div className={`flex-1 min-w-0 pr-4 transition-opacity duration-300 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}>
          <Link 
            href={currentNews?.link || "#"} 
            className="block text-[14px] font-semibold text-white truncate hover:underline"
          >
            {currentNews?.slugName || currentNews?.title}
          </Link>
        </div>
        
        {/* Close Button */}
        {/* <button 
          onClick={() => setIsVisible(false)} 
          className="text-white/60 hover:text-white transition-colors p-1 text-[13px] shrink-0"
          aria-label="Close Alert"
        >
          ✕
        </button> */}
      </div>
    </div>
  );
}