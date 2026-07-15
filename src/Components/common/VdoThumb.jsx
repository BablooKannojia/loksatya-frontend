"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoPlayCircleOutline } from "react-icons/io5";

const FALLBACK_IMAGE =
  "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/breaking-news-broadcast-youtube-thumbnail-design-template-d06ddc9f11789b47d62564e6e22a7730_screen.jpg?ts=1652194145";

const VdoThumb = ({ data, height }) => {
  const title = data?.title?.replace(/[%.?]/g, "")?.split(" ")?.join("-");

  const extractVideoId = (url) => {
    if (!url) return null;

    const regex =
      /(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([^"&?/\s]{11})/;

    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = useMemo(() => extractVideoId(data?.link), [data?.link]);

  const [thumbnail, setThumbnail] = useState(
    videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : FALLBACK_IMAGE
  );

  return (
    <div className="overflow-hidden">
      <Link
        href={`/videos/${title}?id=${data?._id}`}
        className={`${height ? "" : "p-1 rounded-lg"} w-full h-full flex flex-col`}
      >
        <div
          className={`relative overflow-hidden p-1 rounded-3xl ${
            height ? "lg:h-[530px]" : "h-full"
          }`}
        >
          <Image
            src={thumbnail}
            alt={data?.title || "Video"}
            fill
            className="object-cover rounded-3xl"
            sizes="100vw"
            onError={() => setThumbnail(FALLBACK_IMAGE)}
          />

          <IoPlayCircleOutline
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
              height
                ? "lg:text-red-600 text-white text-7xl lg:text-8xl"
                : "text-white text-7xl"
            }`}
          />

          {height && (
            <div className="absolute hidden lg:block bottom-1 left-1 right-1 px-6 py-3 bg-black/40 backdrop-blur-sm">
              <span className="text-3xl font-semibold text-white line-clamp-2">
                {data?.title}
              </span>
            </div>
          )}
        </div>

        {!height && (
          <span className="p-1 line-clamp-3 lg:h-[4.4rem] text-lg font-semibold text-white">
            {data?.title}
          </span>
        )}
      </Link>
    </div>
  );
};

export default VdoThumb;