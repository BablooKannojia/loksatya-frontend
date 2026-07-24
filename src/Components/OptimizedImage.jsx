"use client";

import { useState } from "react";
import Image from "next/image";

const OptimizedImg = ({ 
  src,
  alt,
  className = "",
  style,
  quality = 80,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}) => {
  const [isError, setIsError] = useState(false);

  if (!src || isError) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#999", fontSize: "14px" }}>
          Image not available
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt || "News image"}
        fill
        quality={quality}
        sizes={sizes}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        onError={() => setIsError(true)}
        style={{
          objectFit: "cover",
          borderRadius: style?.borderRadius || 0,
        }}
      />
    </div>
  );
};

export default OptimizedImg;