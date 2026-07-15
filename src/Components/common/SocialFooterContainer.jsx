"use client";

// SocialMediaContainer.jsx
import React from "react";
import { FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

const SocialMediaContainer = () => {
  return (
    <div className="flex justify-start gap-6 my-3 mb-6 lg:pl-10 items-center">
      <Link
        href="https://youtube.com/@loksatyatv2712?si=8DeavCBxkJuTCInS"
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-600 text-4xl hover:scale-110 transform transition duration-300"
      >
        <FaYoutube />
      </Link>
      <Link
        href="https://www.instagram.com/loksatyatv?igsh=MXdvbXJsNnB5cmVkZw=="
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-500 text-4xl hover:scale-110 transform transition duration-300"
      >
        <FaInstagram />
      </Link>
      <Link
        href="https://www.facebook.com/@loksatyanews"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 text-4xl hover:scale-110 transform transition duration-300"
      >
        <FaFacebook />
      </Link>
      <Link
        href="https://x.com/dainikloksatya?s=21"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 text-4xl hover:scale-110 transform transition duration-300"
      >
        <FaXTwitter />
      </Link>
    </div>
  );
};

export default SocialMediaContainer;
