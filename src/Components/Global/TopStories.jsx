"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useHomeData } from "../../Context/HomeContext";
import ShirshCard from "../../Components/MainPage/ShirshCard";
import { FaGreaterThan } from "react-icons/fa";

export default function TopStories() {
  const router = useRouter();
  const { homeData, loading } = useHomeData();

  const topStories = homeData?.topStories || [];

  if (loading) {
    return (
      <div className="w-full lg:p-4 py-4 bg-white rounded-lg shadow-sm font-devanagari min-h-[620px]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex gap-3 h-[80px] items-center">
                <div className="w-[45%] h-20 bg-gray-200 rounded shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
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

  const sortedStories = [...topStories]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  return (
    <div id="TopStories" className="w-full font-devanagari bg-white lg:p-4 p-2 rounded-lg shadow-sm flex flex-col justify-between min-h-[620px]">

      <div>
        {/* हेडर सेक्शन */}
        <div
          className="cursor-pointer border-b-2 border-brand pb-2 mb-4 h-[34px]"
          onClick={() => router.push(`/stories`)}
        >
          <h2 className="font-bold text-[18px] text-ink-soft hover:text-brand transition-colors flex items-center gap-2">
            <span className="h-4 w-1.5 bg-brand rounded-full"></span>
            शीर्ष आलेख
          </h2>
        </div>

        {/* स्टोरीज़ लिस्ट (नियत साइज लॉक के साथ) */}
        <div className="flex flex-col gap-1 min-h-[480px]">
          {sortedStories.map((data) => {
            let titleSlug = data.slug || data.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";

            return (
              <div key={data._id} className="w-full min-h-[80px]">
                <ShirshCard
                  data={data}
                  OnPress={() => router.push(`/details/${titleSlug}?id=${data?._id}`)}
                  image={data?.image}
                  wid="w-[45%]"
                  text={data?.title}
                />
              </div>
            );
          })}
        </div>
      </div>

      {topStories.length > 6 ? (
        <div
          className="flex items-center justify-end text-[13px] font-semibold text-brand hover:underline cursor-pointer border-t border-gray-100 pt-2 mt-2 self-end select-none h-[28px] w-full"
          onClick={() => router.push(`/stories`)}
        >
          <span>और भी</span>
          <FaGreaterThan className="ml-1.5 text-[9px]" />
        </div>
      ) : (
        <div className="h-[28px] w-full border-t border-transparent" />
      )}

    </div>
  );
}