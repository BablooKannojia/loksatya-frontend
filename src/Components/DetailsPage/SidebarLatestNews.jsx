"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useHomeData } from "../../../src/Context/HomeContext";

export default function SidebarLatestNews() {
  const { homeData } = useHomeData();
  const latestNews = homeData?.latestNews || [];

  if (!latestNews || latestNews.length === 0) return null;

  const getArticleSlug = (data) => {
    if (data?.slug) return data.slug;
    return data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mt-6">
      {/* 🚀 Header: लाल पिलर, बोल्ड टेक्स्ट और बॉटम रेड बॉर्डर */}
      <div className="border-b-2 border-[#D90429] pb-2 mb-5 flex items-center gap-2">
        <span className="h-5 w-1.5 bg-[#D90429] rounded-full inline-block"></span>
        <h3 className="text-xl font-extrabold text-[#D90429] tracking-wide">
          ताज़ा ख़बरें
        </h3>
      </div>

      {/* 📰 News List Matching Image Layout */}
      <div className="flex flex-col gap-5">
        {latestNews.slice(0, 5).map((item) => {
          const itemSlug = getArticleSlug(item);
          return (
            <Link
              key={item._id}
              href={`/details/${itemSlug}?id=${item._id}`}
              className="grid grid-cols-12 gap-3.5 items-center group cursor-pointer"
            >
              {/* Image Side (5 columns) */}
              <div className="col-span-5 relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-100 shadow-xs">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title || "News"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 40vw, 150px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* Content Side (7 columns) */}
              <div className="col-span-7 flex flex-col justify-center">
                <h4 className="text-xs sm:text-[13px] md:text-[14px] font-extrabold text-gray-900 group-hover:text-[#D90429] transition-colors leading-[1.35] line-clamp-3">
                  {item.title}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}