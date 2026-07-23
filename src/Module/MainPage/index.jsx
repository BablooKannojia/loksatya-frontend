"use client";

import { useEffect, useRef, useState, lazy, memo, Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { API_URL } from "../../API";
import { useRouter } from "next/navigation";
import TopStories from "../../Components/Global/TopStories";
import FlashNews from "../../Components/Global/FlashNews";
import PhotoGallery from "../../Components/Global/PhotoGallery";
import VisualStories from "../../Components/Global/VisualStories";
import HomeHeroSection from "../../Components/Global/BreakingLatest";
import HeroSection from "../../Components/Global/HeroSection";
import AllSectionArticle from "../../components/MainPage/SectionArticle";
import { useHomeData } from "@/src/Context/HomeContext";
import { useCommonData } from "../../Context/CommonContext";

const MainPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = router.push;
  const breakingNewsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [homeSlider, setHomeSlider] = useState(null);
  const [isLoading, setIsLoading] = useState({
    slider: true,
    breakingNews: true,
    latestNews: true,
    stories: true,
    polls: true,
    categories: true,
    ads: true,
    critical: true,
  });
  const { categoryArticles, priorityArticles } = useCommonData();
  const { homeData } = useHomeData();

  const dummySubmitVote = (pollId, index) => console.log("Voted:", pollId, index);

  const updateLoadingState = (key, value) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 250);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [debounce]);

  const fetchDataInPhases = async () => {
    try {
      // 🚀 फ़ालतू की 4 APIs हटाकर सिर्फ काम की HeroSection Slider API रखी है
      const response = await axios.get(`${API_URL}/article/slider`);

      if (response?.data?.success && response?.data?.data) {
        setHomeSlider(response.data.data);
      }

      updateLoadingState("critical", false);
      updateLoadingState("slider", false);
      updateLoadingState("breakingNews", false);

    } catch (error) {
      console.error("Error fetching critical data:", error);
    }
  };

  useEffect(() => {
    fetchDataInPhases();
  }, []);

  const [breakingScroll, setBreakingScroll] = useState({ left: false, right: true });

  useEffect(() => {
    const container = breakingNewsRef.current;
    if (!container) return;

    const handleScroll = () => {
      setBreakingScroll({
        left: container.scrollLeft > 0,
        right: container.scrollLeft < container.scrollWidth - container.clientWidth,
      });
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      <div className="w-full max-w-7xl mx-auto sm:px-4 space-y-4 md:space-y-8">

        {/* 💻 डेस्कटॉप व्यू */}
        <FlashNews />

        {/* 🚀 पैरेंट कंटेनर: लेआउट अब एकदम परफेक्ट अलाइन रहेगा */}
        <div className="lg:flex w-full items-start gap-6 px-4 max-w-[1400px] mx-auto mt-3">
          {/* 1. हीरो सेक्शन (70% स्पेस) */}
          <div className="flex-1">
            <HeroSection sliderData={homeSlider} />
          </div>

          {/* 2. टॉप स्टोरीज (30% नो-श्रिंक स्पेस) */}
          <div className="lg:w-[30%] w-full shrink-0 lg:pt-0 pt-4">
            <TopStories />
          </div>
        </div>

        <div className="flex flex-col gap-8 md:gap-12 w-full px-2 sm:px-4">
          <HomeHeroSection
            latestNews={homeData?.latestNews || []}
            breakingNews={homeData?.breakingNews || []}
            currentPoll={homeData?.poll || null}
            pollOptions={homeData?.poll?.options || []}
            selectedOption={null}
            isLoading={{ polls: false }}
            submitVote={dummySubmitVote}
            navigation={(path) => router.push(path)}
            t={(key) => (key === "ln" ? "ताज़ा खबरें" : "बड़ी खबरें")}
          />
        </div>
        
        <div className="block">
          <Suspense fallback={null}>
            <AllSectionArticle data={categoryArticles} priorityArticles={priorityArticles} />
          </Suspense>
        </div>

        <VisualStories />
        <PhotoGallery />
      </div>
    </div>
  );
};

export default MainPage;