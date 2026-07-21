"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAd } from "../../Context/TopAdContext";
import axios from "axios";
import { API_URL } from "../../API";

const MenuBelowSlider = () => {
  const [topAd, setTopAd] = useState({});
  useEffect(() => {
    axios.get(`${API_URL}/ads?active=true&side=top`).then((data) => {
      // console.log("top ad data response : ", data);
      const activeAds = data.data.filter((data) => data.active);
      setTopAd(activeAds.reverse()[0]);
    });
  }, []);

  const pathname = usePathname();
  const { showAd } = useAd();

  return (
    <div className={`${pathname !== "/" ? " -mb-16 sm:-mb-0" : ""}`}>
      <ul
        className={`mobileMainPageAnchorSlider font-semibold ${
          pathname === "/" && showAd && topAd ? "mt-[132px] " : "mt-[65px]"
        }`}
      >
        <li>
          <Link href="/stories">
          {/* Top Stories */}शीर्ष आलेख</Link>
        </li>
        <li>
          <Link href="/itempage2?newsType=upload">ताजा खबर</Link>
        </li>
        <li>
          <Link href="/itempage2?newsType=breakingNews">बड़ी खबर</Link>
        </li>
        <li>
          <Link href="/itempage2?newsType=videos">वीडियो</Link>
        </li>
        <li>
          <Link href="/story">दृश्य कहानियाँ</Link>
        </li>
        <li>
          <Link href="/photo-gallery">फोटो गैलरी</Link>
        </li>
      </ul>
    </div>
  );
};

export default MenuBelowSlider;
