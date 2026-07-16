"use client";

import { useMemo } from "react";
import ImageCard from "./ImageCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";

const AllSectionArticle = ({ data = [], priorityArticles = [] }) => {
  
  // 1. Data को Sequence के हिसाब से sort करना
  const sortedCategories = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return [...data].sort((a, b) => {
      const seqA = a.sequence !== undefined ? a.sequence : Number.MAX_VALUE;
      const seqB = b.sequence !== undefined ? b.sequence : Number.MAX_VALUE;
      return seqA - seqB;
    });
  }, [data]);

  // 2. Articles को combine करना
  const getCombinedArticles = (element) => {
    const rawImgData = element.imgData || element.data || element.articles || [];
    const rawVidData = element.vidData || [];

    const categoryArticles = [
      ...rawImgData.map(item => ({ ...item, type: item.type || 'img' })),
      ...rawVidData.map(item => ({ ...item, type: 'vid' }))
    ];

    const categoryPriorityArticles = priorityArticles.filter(
      article => article.topic === element.category || article.category === element.category
    );

    const allArticlesMap = new Map();
    
    categoryPriorityArticles.forEach(article => {
      if (article && article._id) allArticlesMap.set(article._id, article);
    });
    
    categoryArticles.forEach(article => {
      if (article && article._id && !allArticlesMap.has(article._id)) {
        allArticlesMap.set(article._id, article);
      }
    });

    return Array.from(allArticlesMap.values());
  };

  if (!sortedCategories.length) {
    return <div className="w-full text-center py-4 text-gray-500">डेटा लोड हो रहा है...</div>;
  }

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full px-2 sm:px-4">
      {sortedCategories.map((element) => {
        const categoryName = element.category || element.text;
        if (!categoryName) return null;

        const combinedArticles = getCombinedArticles(element);
        if (combinedArticles.length === 0) return null;

        return (
          <SingleArticle
            key={categoryName}
            category={categoryName}
            combinedArticles={combinedArticles}
          />
        );
      })}
    </div>
  );
};

const SingleArticle = ({ category, combinedArticles = [] }) => {
  const router = useRouter();

  const imgArticles = combinedArticles.filter(article => article.type === 'img' || !article.type);

  // 7 आर्टिकल्स का परफेक्ट डिस्ट्रीब्यूशन
  const featuredArticle = imgArticles[0]; // 1 मुख्य बड़ी खबर
  const subArticles = imgArticles.slice(1, 7); // बाकी की 6 खबरें

  const formatTitleForSlug = (element) => {
    if (element?.slug) return element.slug;
    return element?.title?.replace(/[%.?]/g, "").split(" ").join("-") || "news";
  };

  return (
    <div className="w-full bg-white mb-6 md:mb-8">
      
      {/* 🏷️ Premium Category Header */}
      <div className="border-b border-gray-200 pb-2 mb-4 md:mb-6 flex items-center justify-between">
        <Link href={`/itempage?item=${category}`}>
          <h2 className="font-extrabold text-[20px] md:text-[22px] text-gray-900 flex items-center gap-2.5 cursor-pointer hover:text-[#D90429] transition-colors tracking-tight">
            <span className="h-5 md:h-6 w-[4px] bg-[#D90429] rounded-full inline-block"></span>
            {category}
          </h2>
        </Link>
      </div>

      {/* 💻 Responsive Layout: Mobile standard stack -> Desktop horizontal duo */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 w-full items-start">
        
        {/* 1️⃣ LEFT SIDE (40%): Big Hero Card (Mobile standard height to prevent empty space) */}
        {featuredArticle && (
          <div className="w-full lg:w-[40%] h-[220px] sm:h-[280px] lg:h-[380px] rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 shrink-0">
            <ImageCard
              id={featuredArticle?._id}
              slug={formatTitleForSlug(featuredArticle)}
              img={featuredArticle?.image}
              text={featuredArticle?.title}
              dis={true}
              height="100%"
              width="100%"
              border="rounded-sm"
            />
          </div>
        )}

        {/* 2️⃣ RIGHT SIDE (60%): Grid List (Mobile 1 Column -> Desktop 2 Columns) */}
        <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4">
          {subArticles.map((element) => (
            <div
              key={element?._id}
              onClick={() => router.push(`/details/${formatTitleForSlug(element)}?id=${element?._id}`)}
              className="flex w-full gap-3 py-2 cursor-pointer items-start group border-b border-gray-100/70 hover:bg-slate-50/40 p-1 rounded transition-all duration-150"
            >
              {/* Thumbnail */}
              <div className="w-[95px] sm:w-[110px] h-[65px] sm:h-[68px] shrink-0 overflow-hidden rounded-sm bg-gray-50 shadow-sm">
                <img 
                  src={element?.image} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200" 
                  loading="lazy" 
                />
              </div>
              {/* Headline Text */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13.5px] sm:text-[14px] font-bold text-gray-900 line-clamp-2 sm:line-clamp-3 leading-snug group-hover:text-[#D90429] transition-colors break-words">
                  {element?.title}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default memo(AllSectionArticle);