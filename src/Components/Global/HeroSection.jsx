"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ⚡ LCP, FCP और CLS का पक्का इलाज

export default function HeroSection({ sliderData = [] }) {
  const router = useRouter();

  // ========================================================
  // ⚡ FIX FCP & CLS: डेटा लोड होते समय ब्लिंक करता हुआ स्केलेटन लोडर
  // ========================================================
  if (!sliderData || sliderData.length === 0) {
    return (
      <div className="w-[100%] flex flex-col gap-4 animate-pulse">
        {/* बड़ी इमेज का स्केलेटन */}
        <div className="w-full h-[440px] bg-gray-200 rounded-lg mt-3" />
        {/* नीचे के 3 ग्रिड का स्केलेटन */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="h-[180px] bg-gray-200 rounded-lg" />
          <div className="h-[180px] bg-gray-200 rounded-lg" />
          <div className="h-[180px] bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  const mainArticle = sliderData[0];
  const gridArticles = sliderData.slice(1, 4);

  const formatTitleForUrl = (title = "") => {
    return title.replace(/[/\%.?]/g, "").split(" ").join("-");
  };

  const handleNavigation = (article) => {
    const formattedTitle = formatTitleForUrl(article.title);
    const slug = article.slug ? article.slug : formattedTitle;
    router.push(`/details/${slug}?id=${article._id}`);
  };

  return (
    <div className="w-[100%] flex flex-col gap-4">
      
      {/* ========================================================
          1. TOP SECTION: 1 PREMIUM FIXED BIG NEWS (LCP PRIORITY FIXED)
         ======================================================== */}
      {mainArticle && (
        <div 
          onClick={() => handleNavigation(mainArticle)}
          className="w-full h-[440px] relative rounded-lg overflow-hidden cursor-pointer group shadow-md mt-3"
        >
          {/* 🚀 Next.js Image: यहाँ से w-full h-full हटा दिया है, अब यह परफेक्ट दिखेगी */}
          <Image
            src={mainArticle.image}
            alt={mainArticle.title}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority={true} // ⚡ LCP फिक्स: सबसे पहले लोड होगी
            fetchPriority="high" // ⚡ FCP/LCP को और बूस्ट करेगा
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Smooth Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Content Positioned perfectly at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            <h2 className="text-white text-xl md:text-2xl font-bold leading-snug hover:text-red-400 transition-colors duration-200">
              {mainArticle.title}
            </h2>
          </div>
        </div>
      )}

      {/* ========================================================
          2. BOTTOM SECTION: 3 COLUMNS PERFECT GRID
         ======================================================== */}
      {gridArticles.length > 0 && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          {gridArticles.map((article) => (
            <div 
              key={article._id} 
              onClick={() => handleNavigation(article)}
              className="w-full h-[180px] relative rounded-lg overflow-hidden cursor-pointer group shadow-sm"
            >
              {/* 🚀 यहाँ से भी w-full h-full हटा दिया ताकि ग्रिड इमेजेस दिखने लगें */}
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 23vw"
                loading="lazy" 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient for clear text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <p className="text-white text-sm font-semibold line-clamp-2 leading-tight hover:text-red-400 transition-colors duration-200 whitespace-normal">
                  {article.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}