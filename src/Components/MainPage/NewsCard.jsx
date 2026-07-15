import React from "react";
const img = "/assets/Rectangle 73.png";
import OptimizedImg from "../OptimizedImage";

const NewsCard = ({ data, onPress }) => {
  return (
    <div
      className="news-card-mian-area h-[230px] overflow-hidden rounded"
      onClick={onPress}
    >
      <img
        src={data?.image || img}
        alt={data?.title || "News image"}
        className="w-full h-full rounded object-cover"
      />
      <div className="news-card-main-area-text stories-card-text w-full">
        {data
          ? data?.title
          : "Nternational Aid Arrives In Flood-Hit Libya As More Bodies Wash Ashore"}
      </div>
    </div>
  );
};

export default NewsCard;
