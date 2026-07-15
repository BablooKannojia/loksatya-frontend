"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useHomeData } from "../../Context/HomeContext";
import ShirshCard from "../../Components/MainPage/ShirshCard";

import { FaGreaterThan } from "react-icons/fa"; 

export default function TopStories() {
  const router = useRouter();
  const { homeData, loading } = useHomeData(); // 👈 होम कॉन्टेक्स्ट का उपयोग

  const topStories = homeData?.topStories || [];

  if (loading) {
    return (
      <div className="w-full lg:w-[30%] p-4 bg-white rounded-lg shadow-sm font-devanagari">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-3">
                <div className="w-[45%] h-20 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (topStories.length === 0) return null;

  // 1. डेटा को अप्डेट डेट के हिसाब से सॉर्ट करना
  const sortedStories = [...topStories].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <div id="TopStories" className="w-full lg:w-[30%] font-devanagari bg-white p-4 rounded-lg shadow-sm">
      
      {/* हेडर सेक्शन */}
      <div 
        className="cursor-pointer border-b-2 border-brand pb-2 mb-4" 
        onClick={() => router.push(`/itempage2?newsType=topStories`)}
      >
        <h2 className="font-bold text-[18px] text-ink-soft hover:text-brand transition-colors flex items-center gap-2">
          <span className="h-4 w-1.5 bg-brand rounded-full"></span>
          शीर्ष आलेख
        </h2>
      </div>

      {/* स्टोरीज़ लिस्ट (अधिकतम 6 कार्ड्स) */}
      <div className="flex flex-col gap-1">
        {sortedStories.map((data, index) => {
          // यूआरएल के अनुकूल टाइटल बनाना
          let title = data.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "";
          if (data.slug) title = data.slug;

          // केवल पहले 6 आइटम्स दिखाएँ
          if (title && index < 6) {
            return (
              <ShirshCard
                data={data}
                key={data._id}
                OnPress={() => router.push(`/details/${title}?id=${data?._id}`)}
                image={data?.image}
                wid="w-[45%]"
                text={data?.title}
              />
            );
          }
          return null;
        })}

        {/* 'और भी' देखें बटन */}
        {sortedStories.length > 6 && (
          <div
            className="flex items-center justify-end text-[13px] font-semibold text-brand hover:underline cursor-pointer border-t border-gray-100"
            onClick={() => router.push(`/itempage2?newsType=topStories`)}
          >
            <span>और भी</span> 
            <FaGreaterThan className="ml-1.5 text-[10px]" />
          </div>
        )}
      </div>

    </div>
  );
}