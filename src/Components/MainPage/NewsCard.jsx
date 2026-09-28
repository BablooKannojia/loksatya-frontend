"use client";

import React from "react";
import OptimizedImg from "../OptimizedImage";

const img = "/assets/Rectangle 73.png";

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const datePart = d.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("hi-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
};

const NewsCard = ({ data, onPress }) => {
  const formattedDate = formatDateTime(data?.createdAt);

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
        {/* {formattedDate && (
          <span className="block text-[11px] text-gray-200 font-medium mt-1.5">
            {formattedDate}
          </span>
        )} */}
      </div>
    </div>
  );
};

export default NewsCard;