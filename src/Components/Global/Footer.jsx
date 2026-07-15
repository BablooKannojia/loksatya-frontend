"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCommonData } from "../../Context/CommonContext";

function categoryHref(text = "") {
  return `/category/${encodeURIComponent(text.trim())}`;
}

export default function Footer() {
  const { menu, loading } = useCommonData();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // यहाँ आप अपनी न्यूज़लेटर API कॉल जोड़ सकते हैं
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000); // 4 सेकंड बाद मैसेज गायब
  };

  // "होम" को सोशल/फ़ुटर लिंक्स के लिए डिफ़ॉल्ट रूप से अलग रख सकते हैं या पूरा मेनू दिखा सकते हैं
  const footerMenu = menu || [];

  return (
    <footer className="w-full bg-ink text-white font-devanagari mt-auto border-t-4 border-brand">
      
      {/* ===== Top Section: Logo, Social Media & Subscribe ===== */}
      <div className="max-w-7xl mx-auto px-5 pt-12 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-gray-800">
        
        {/* 1. ब्रांड और परिचय */}
        <div className="space-y-4">
          <div className="inline-block bg-white px-4 py-2 rounded-md shadow-md">
            <Image 
              src="/logo.png" 
              alt="न्यूज़ लोगो" 
              width={140} 
              height={44} 
              className="h-[36px] w-auto object-contain"
            />
          </div>
          <p className="text-gray-400 text-[14px] leading-relaxed font-normal">
            सबसे तेज़, सबसे सटीक खबरें। देश, दुनिया, मनोरंजन, खेल और बिज़नेस जगत की हर हलचल पर हमारी पैनी नज़र।
          </p>
          
          {/* सोशल मीडिया हैंडल्स */}
          <div className="pt-2">
            <h4 className="text-[14px] font-semibold text-gray-300 mb-3">हमसे जुड़ें:</h4>
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-[#1877F2] transition-colors duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              </a>
              {/* X (Twitter) */}
              <a href="#" aria-label="Twitter" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-black transition-colors duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] transition-colors duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-[#FF0000] transition-colors duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* 2. कैटगरीज़ लिंक्स (मेन्यू की तरह डायनामिक लिस्ट) */}
        <div>
          <h3 className="text-[16px] font-bold text-white border-l-4 border-brand pl-2.5 mb-5 uppercase tracking-wide">
            प्रमुख श्रेणियां
          </h3>
          {loading ? (
            <p className="text-sm text-gray-500">लोड हो रहा है...</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14px]">
              {/* स्टेटिक होम लिंक */}
              <li>
                <Link href="/" className="text-gray-400 hover:text-brand transition-colors flex items-center gap-1 group">
                  <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">›</span> होम
                </Link>
              </li>
              {/* कॉन्टेक्स्ट से डायनामिक मेनू लिंक्स */}
              {footerMenu.map((item) => (
                <li key={item._id}>
                  <Link 
                    href={categoryHref(item.text)} 
                    className="text-gray-400 hover:text-brand transition-colors flex items-center gap-1 group whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">›</span> {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. न्यूज़लेटर सब्सक्राइब फ़ॉर्म */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-white border-l-4 border-brand pl-2.5 mb-5 uppercase tracking-wide">
            न्यूज़लेटर
          </h3>
          <p className="text-gray-400 text-[13.5px]">
            हमारे साथ बने रहें और ईमेल पर सीधे ताज़ा तरीन खबरें और विशेष रिपोर्ट्स प्राप्त करें।
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 pt-1">
            <div className="flex w-full items-stretch rounded-md overflow-hidden border border-gray-700 focus-within:border-brand">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="आपका ईमेल एड्रेस..."
                className="w-full bg-gray-900 px-3.5 py-2.5 text-[14px] text-white placeholder-gray-500 outline-none"
              />
              <button
                type="submit"
                className="bg-brand hover:bg-brand-dark text-white px-4 font-semibold text-[14px] transition-colors whitespace-nowrap"
              >
                सब्सक्राइब
              </button>
            </div>
            
            {/* सब्सक्राइब सक्सेस मैसेज */}
            {subscribed && (
              <p className="text-green-400 text-[13px] animate-fadeIn">
                ✓ सफलतापूर्वक सब्सक्राइब कर लिया गया है!
              </p>
            )}
          </form>
        </div>

      </div>

      {/* ===== Bottom Section: Copyright & Disclaimer ===== */}
      <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-gray-500 text-[13px]">
        <p>© {new Date().getFullYear()} लोकसत्य न्यूज़. सर्वाधिकार सुरक्षित।</p>
        <div className="flex items-center gap-4">
          <Link href="/about-us" className="hover:text-gray-300 transition-colors">हमारे बारे में</Link>
          <span className="text-gray-700">|</span>
          <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">गोपनीयता नीति</Link>
          <span className="text-gray-700">|</span>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">नियम और शर्तें</Link>
        </div>
      </div>
    </footer>
  );
}