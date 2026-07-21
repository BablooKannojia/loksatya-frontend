"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../API";
import axios from "axios";
import { IoTimeOutline } from "react-icons/io5";

function RelatedNewsSection({ currentNewId, topic }) {
  const { t } = useTranslation();
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topic && currentNewId) {
      fetchRelatedNews();
    }
  }, [topic, currentNewId]);

  async function fetchRelatedNews() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/article?pagenation=true&limit=6&type=img&newsType=breakingNews&status=online&topic=${encodeURIComponent(
          topic
        )}&excludeId=${encodeURIComponent(currentNewId)}`
      );
      const data = response.data?.data || response.data || [];
      setRelatedNews(data);
    } catch (error) {
      console.error("Error fetching related news:", error);
      setRelatedNews([]);
    } finally {
      setLoading(false);
    }
  }

  const getArticleSlug = (data) => {
    if (data?.slug) return data.slug;
    return data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!loading && relatedNews.length === 0) return null;

  return (
    <section className="w-full mt-12 pt-8 border-t border-gray-200">
      {/* 🚀 Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="h-6 w-1.5 bg-[#D90429] rounded-full inline-block"></span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-wide">
          {t("rn") || "संबंधित ख़बरें"}
        </h2>
      </div>

      {/* 📰 Responsive Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="flex flex-col gap-3 animate-pulse">
                  <div className="w-full aspect-[16/10] bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))
          : relatedNews.slice(0, 4).map((item) => {
              const itemSlug = getArticleSlug(item);
              const formattedDate = formatDate(item.createdAt || item.updatedAt);

              return (
                <Link
                  key={item._id}
                  href={`/details/${itemSlug}?id=${item._id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title || "Related News"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                    
                  </div>

                  {/* Content Container */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#D90429] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {formattedDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-auto">
                        <IoTimeOutline className="text-sm" />
                        <span>{formattedDate}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}

export default RelatedNewsSection;