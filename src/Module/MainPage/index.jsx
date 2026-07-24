"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../API";
import TopStories from "../../Components/Global/TopStories";
import FlashNews from "../../Components/Global/FlashNews";
import PhotoGallery from "../../Components/Global/PhotoGallery";
import VisualStories from "../../Components/Global/VisualStories";
import HomeHeroSection from "../../Components/Global/BreakingLatest";
import HeroSection from "../../Components/Global/HeroSection";
import AllSectionArticle from "../../components/MainPage/SectionArticle";
import { useHomeData } from "@/src/Context/HomeContext";
import { useCommonData } from "../../Context/CommonContext";
import { useRouter } from "next/navigation";

const MainPage = () => {
  const router = useRouter();
  const [homeSlider, setHomeSlider] = useState(null);
  const { categoryArticles, priorityArticles } = useCommonData();
  const { homeData } = useHomeData();

  const dummySubmitVote = (pollId, index) => console.log("Voted:", pollId, index);

  const fetchSlider = async () => {
    try {
      const response = await axios.get(`${API_URL}/article/slider`);

      if (response?.data?.success && response?.data?.data) {
        setHomeSlider(response.data.data);
      } else {
        setHomeSlider(null)
      }
    } catch (error) {
      console.error("Error fetching critical data:", error);
    }
  };

  useEffect(() => {
    fetchSlider();
  }, []);


  return (
    <div className="relative">
      <div className="w-full max-w-7xl mx-auto sm:px-4 space-y-4 md:space-y-8">

        <FlashNews />

        <div className="lg:flex w-full items-start gap-6 px-4 max-w-[1400px] mx-auto mt-3">
          {/* 1. हीरो सेक्शन (70% स्पेस) */}
          <div className="flex-1 min-h-[480px]">  {/* if any issue design please remove min-h-520 */}
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
          <AllSectionArticle data={categoryArticles} priorityArticles={priorityArticles} />
        </div>

        <VisualStories />
        <PhotoGallery />
      </div>
    </div>
  );
};

export default MainPage;