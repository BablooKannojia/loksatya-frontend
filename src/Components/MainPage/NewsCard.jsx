"use client";

import React from "react";
import OptimizedImg from "../OptimizedImage";

const img = "/assets/Rectangle 73.png";

const NewsCard = ({ data, onPress }) => {
  return (
    <div
      className="group relative h-[210px] w-full overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
      onClick={onPress}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPress?.();
      }}
    >
      {/* Optimized Image with Hover Zoom Effect */}
      <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500">
        <OptimizedImg
          src={data?.image || img}
          alt={data?.title || "News image"}
          className="w-full h-full object-cover rounded-xl"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
        />
      </div>

      {/* Dark Overlay Gradient for better Text Visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Title Text positioned at the bottom */}
      <div className="absolute bottom-0 left-0 w-full p-3.5 z-10">
        <h3 className="text-white text-[14px] font-bold leading-snug line-clamp-2 group-hover:text-red-100 transition-colors">
          {data?.title || "International Aid Arrives In Flood-Hit Libya As More Bodies Wash Ashore"}
        </h3>
      </div>
    </div>
  );
};

export default NewsCard;