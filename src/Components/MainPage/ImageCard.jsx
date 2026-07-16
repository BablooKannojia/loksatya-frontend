"use client";

import { useRouter } from "next/navigation";
import SimpleSlider from "../common/SimpleSlider";
import OptimizedImg from "../OptimizedImage";

const ImageCard = ({
  fromVStrories = false,
  width = "100%",
  height = "100%",
  img,
  text,
  border = "rounded-sm", // Tailwind class
  id,
  slug,
  dis,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (dis === false) return;
    
    if (fromVStrories) {
      console.log("Visual story");
    } else {
      router.push(`/details/${slug}?id=${id}`);
    }
  };

  return (
    <div
      className={`relative overflow-hidden cursor-pointer group ${border}`}
      style={{ width, height }}
      onClick={handleCardClick}
    >
      {/* 🖼️ Image Container */}
      <div className="w-full h-full relative">
        {Array.isArray(img) && img.length > 1 ? (
          <SimpleSlider duration={5000} indicators={true}>
            {img.map((imgSrc, index) => (
              <OptimizedImg
                key={index}
                src={imgSrc}
                alt={text || `Image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ))}
          </SimpleSlider>
        ) : (
          <OptimizedImg
            src={Array.isArray(img) ? img[0] : img}
            alt={text || "News image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      {/* 🖤 Premium Dark Gradient Overlay & Text (जैसी टॉप स्टोरीज में है) */}
      {text && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-3 px-3 flex flex-col justify-end">
          <p className="text-white font-bold text-[15px] sm:text-[16px] leading-snug line-clamp-2">
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageCard;