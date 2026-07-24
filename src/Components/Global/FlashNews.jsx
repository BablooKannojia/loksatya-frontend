"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useHomeData } from "../../Context/HomeContext";

export default function FlashNews() {
  const { homeData, loading } = useHomeData();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const data = homeData?.flashNews || [];

  useEffect(() => {
    if (!data.length) return;

    let timeoutId;

    const intervalId = setInterval(() => {
      setFade(false);

      timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length);
        setFade(true);
      }, 300);
    }, 4000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [data.length]);

  // Safe index
  const currentNews = data[currentIndex] ?? data[0];

  // CLS-safe loading placeholder
  if (loading || !data.length) {
    return (
      <div className="w-full max-w-7xl mx-auto lg:px-4 px-2 my-2 lg:my-3 pt-2 lg:pt-4 box-border">
        <div className="h-[44px] lg:h-[46px] w-full rounded-full border border-gray-200/50 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto lg:px-4 px-2 my-2 lg:my-3 pt-2 lg:pt-4 font-devanagari box-border">
      <div className="relative flex items-center justify-between h-[44px] lg:h-[46px] px-3.5 sm:px-5 lg:px-6 rounded-full bg-[#393939] text-white shadow-md overflow-hidden">

        <div className="flex items-center flex-shrink-0 select-none">
          <span className="font-extrabold italic uppercase tracking-wider whitespace-nowrap text-[#D90429] text-[9px] sm:text-[11px] lg:text-[13px] animate-pulse">
            BREAKING NEWS
          </span>

          <span className="mx-2 sm:mx-3 text-white/30 text-[12px] sm:text-[14px]">
            |
          </span>
        </div>

        <div
          className={`flex-1 min-w-0 transition-opacity duration-300 ease-in-out ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link
            href={currentNews?.link || "#"}
            className="block truncate leading-snug text-[15px] lg:text-[14px] font-bold sm:font-semibold text-white hover:underline"
          >
            {currentNews?.slugName || currentNews?.title}
          </Link>
        </div>

      </div>
    </div>
  );
}