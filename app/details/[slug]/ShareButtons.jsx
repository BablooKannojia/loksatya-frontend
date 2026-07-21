"use client";

import React, { useEffect } from "react";
import { FaWhatsapp, FaFacebookF, FaXTwitter } from "react-icons/fa6";

export default function ShareButtons({ shareUrl, title }) {

  // Auto-Load Twitter / X Embed Widgets on Client Side
  useEffect(() => {
    if (window.twttr) {
      window.twttr.widgets.load();
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-500 uppercase mr-1">Share:</span>
      
      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm hover:opacity-90 transition-opacity"
      >
        <FaWhatsapp />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm hover:opacity-90 transition-opacity"
      >
        <FaFacebookF />
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm hover:opacity-90 transition-opacity"
      >
        <FaXTwitter />
      </a>
    </div>
  );
}