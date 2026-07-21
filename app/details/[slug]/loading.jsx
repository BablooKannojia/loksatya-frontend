import React from "react";

export default function DetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="w-28 h-4 bg-gray-200 rounded mb-6" />

      {/* Category Skeleton */}
      <div className="w-20 h-6 bg-gray-200 rounded-full mb-3" />

      {/* Title Skeleton */}
      <div className="w-full h-8 sm:h-10 bg-gray-200 rounded mb-3" />
      <div className="w-3/4 h-8 sm:h-10 bg-gray-200 rounded mb-6" />

      {/* Meta Bar Skeleton */}
      <div className="w-full h-12 border-y border-gray-200 py-3 mb-6 flex justify-between items-center">
        <div className="w-40 h-4 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </div>

      {/* Main Image Skeleton */}
      <div className="w-full h-[250px] sm:h-[400px] md:h-[480px] bg-gray-200 rounded-xl mb-8" />

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="w-11/12 h-4 bg-gray-200 rounded" />
        <div className="w-4/5 h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}