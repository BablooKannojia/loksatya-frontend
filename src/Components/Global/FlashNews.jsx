"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useHomeData } from "../../Context/HomeContext"; // 👈 कॉन्टेक्स्ट हुक लाएं

export default function FlashNews() {
  const { homeData, loading } = useHomeData(); // 👈 होम डेटा निकाला
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const data = homeData?.flashNews || []; // 👈 पोस्टमैन वाली flashNews एरे

  useEffect(() => {
    if (data.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [data.length]);

  if (!isVisible || loading || data.length === 0) return null;

  const currentNews = data[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-5 my-3 pt-4 font-devanagari">
      <div className="relative flex items-center justify-between bg-[#393939] text-white rounded-full py-2 px-6 shadow-md">
        <div className="flex items-center flex-shrink-0 select-none">
          <span className="font-extrabold italic text-[14px] uppercase animate-pulse">BREAKING NEWS</span>
          <span className="mx-3 text-white/50">|</span>
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <Link href={currentNews?.link || "#"} className="block text-[14px] font-semibold text-white truncate hover:underline">
            {currentNews?.slugName || currentNews?.title}
          </Link>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-white/80 hover:text-white">✕</button>
      </div>
    </div>
  );
}