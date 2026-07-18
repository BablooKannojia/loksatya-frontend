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
import TopStories from "../../Components/Global/TopStories"
import FlashNews from "../../Components/Global/FlashNews"
import PhotoGallery from "../../Components/Global/PhotoGallery"
import VisualStories from "../../Components/Global/VisualStories"
import HomeHeroSection from "../../Components/Global/BreakingLatest"
import HeroSection from "../../Components/Global/HeroSection"
import AllSectionArticle from "../../components/MainPage/SectionArticle";
import { useHomeData } from "@/src/Context/HomeContext";
import { useCommonData } from "../../Context/CommonContext";


const ImageCard = lazy(() => import("../../components/MainPage/ImageCard"));
const BigNewsCard = lazy(() => import("../../Components/MainPage/BigNewsCard"));

const SimpleLoading = ({ className = "h-[200px]" }) => (
  <div className={`w-full ${className} bg-gray-100 rounded-lg`} />
);

const MainPage = () => {
  const [sliderItem, setSliderItem] = useState(0);
  const [sliderItem2, setSliderItem2] = useState(1);
  const [breakingNews, setbreakingNews] = useState([]);
  const [sliderArticles, setSliderArticles] = useState([]);
  const [combinedNews, setCombinedNews] = useState([]);
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = router.push;
  const [pollOptions, setPollOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const breakingNewsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [homeSlider, setHomeSlider] = useState(null);
  const [fixedArticles, setFixedArticles] = useState({ first: null, second: null });
  const [fixedArticlesmobile, setFixedArticlesMobile] = useState([]);
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
      const criticalRequests = [
        axios.get(`${API_URL}/article?fixedPosition=1&status=online`),
        axios.get(`${API_URL}/article?fixedPosition=2&status=online`),
        axios.get(`${API_URL}/article?pagenation=true&limit=8&type=img&status=online&slider=true`),
        axios.get(
          `${API_URL}/article?pagenation=true&limit=12&type=img&newsType=breakingNews&status=online&priority=true`
        ),
        axios.get(`${API_URL}/article/slider`),
      ];

      const [fixed1Res, fixed2Res, sliderRes, breakingRes, articles] = await Promise.all(
        criticalRequests
      );

      const fixed1 = fixed1Res.data[0] || null;
      const fixed2 = fixed2Res.data[0] || null;

      setFixedArticles({ first: fixed1, second: fixed2 });
      setFixedArticlesMobile([fixed1, fixed2].filter(Boolean));

      setSliderArticles(sliderRes.data.filter((article) => article.status === "online"));
      setbreakingNews(breakingRes.data);

      if (articles?.data?.success && articles?.data?.data) {
        setHomeSlider(articles.data.data);
      }
      console.log(`herosection`, articles.data.data)

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

  const scrollLeft = (ref) => {
    const container = ref.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (ref) => {
    const container = ref.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const combinedArray = [...breakingNews.slice(0, 2), ...sliderArticles.slice(0, 8)];
    setCombinedNews(combinedArray);
  }, [breakingNews, sliderArticles]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (sliderArticles.length > 0) {
        setSliderItem((prevItem) => (prevItem + 2) % sliderArticles.length);
        setSliderItem2((prevItem) => (prevItem + 2) % sliderArticles.length);
      }
    }, 6000);

    return () => clearInterval(intervalId);
  }, [sliderArticles.length]);

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

  const submitVote = async (pollId, optionIndex) => {
    if (selectedOption !== null) return;

    try {
      setSelectedOption(optionIndex);

      const response = await axios.post(`${API_URL}/polls/${pollId}/vote`, { optionIndex });

      if (response.data.success) {
        const updatedOptions = pollOptions.map((option, index) => {
          if (index === optionIndex) {
            return { ...option, votes: (option.votes || 0) + 1 };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, option) => sum + (option.votes || 0), 0);
        const optionsWithPercentages = updatedOptions.map((option) => ({
          ...option,
          percentage: totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0,
        }));

        setPollOptions(optionsWithPercentages);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      setSelectedOption(null);
    }
  };

  return (
    <div className="relative">

      <div className="w-full">
        <div className="block lg:hidden">

          <FlashNews />

          <div className="flex justify-between mt-[3%] px-[9px] overflow-hidden">
            <div className="w-full">
              {isLoading.slider || fixedArticlesmobile.length === 0 ? (
                <SimpleLoading className="h-[32vh]" />
              ) : (
                <ImageCard
                  img={fixedArticlesmobile[0]?.image}
                  text={fixedArticlesmobile[0]?.title}
                  slug={fixedArticlesmobile[0]?.slug}
                  title={fixedArticlesmobile[0]?.title}
                  id={fixedArticlesmobile[0]?._id}
                  width="100%"
                  height="32vh"
                />
              )}
            </div>
          </div>

          <div className="flex justify-between mt-[3%] px-[9px] overflow-hidden">
            <div className="w-full">
              {isLoading.slider ? (
                <SimpleLoading className="h-[32vh]" />
              ) : combinedNews?.length > 0 ? (
                <ImageCard
                  img={combinedNews[0]?.image}
                  text={combinedNews[0]?.title}
                  slug={combinedNews[0]?.slug}
                  title={combinedNews[0]?.title}
                  id={combinedNews[0]?._id}
                  width="100%"
                  height="32vh"
                />
              ) : (
                <div className="text-center">No combined news available</div>
              )}
            </div>
          </div>

          <div className="w-full border-t-2 border-gray-300 mt-4">
            <div id="BigNews" className="flex flex-col relative w-full">
              <div className="w-full">
                <div className="flex w-full pr-4 justify-between items-center">
                  <div className="w-[40%]">{t("bn")}</div>
                  <span className="bg-red-600 h-0.5 w-[60%]"> </span>
                </div>
              </div>

              <div className="w-full flex justify-between mb-[10px] absolute bottom-[75px]">
                <button
                  onClick={() => scrollLeft(breakingNewsRef)}
                  disabled={!breakingScroll.left}
                  className="bg-white/60 border-none cursor-pointer text-2xl flex items-center disabled:opacity-40"
                >
                  <IoChevronBack />
                </button>
                <button
                  onClick={() => scrollRight(breakingNewsRef)}
                  disabled={!breakingScroll.right}
                  className="bg-white/60 border-none cursor-pointer text-2xl flex items-center disabled:opacity-40"
                >
                  <IoChevronForward />
                </button>
              </div>

              <div
                ref={breakingNewsRef}
                className="flex overflow-x-auto w-full h-full gap-[10px] whitespace-nowrap scroll-smooth"
              >
                {breakingNews &&
                  breakingNews?.length > 0 &&
                  breakingNews.map((data) => {
                    let title = data.title.replace(/[/\%.?]/g, "").split(" ").join("-");
                    if (data.slug) title = data.slug;

                    return (
                      <div key={data._id} className="w-full h-full">
                        <BigNewsCard
                          data={data}
                          OnPress={() => navigation(`/details/${title}?id=${data?._id}`)}
                          image={data?.image}
                          text={data?.title}
                          id="columnReverse"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="block lg:hidden">
            <Suspense fallback={null}>
              <AllSectionArticle data={categoryArticles} priorityArticles={priorityArticles} />
            </Suspense>
          </div>

          <div className="w-full">
            <VisualStories />
          </div>

          <PhotoGallery />
        </div>

        <FlashNews />

        {/* 🚀 पैरेंट कंटेनर: यहाँ flex-1 और shrink-0 का सारा खेल है */}
<div className="hidden lg:flex w-full items-start gap-6 px-4 max-w-[1400px] mx-auto mt-3">
  
  {/* 1. हीरो सेक्शन: इसे बोल दिया कि भाई तू बची हुई 70% पूरी जगह ले ले */}
  <div className="flex-1">
    <HeroSection sliderData={homeSlider} />
  </div>

  {/* 2. टॉप स्टोरीज: shrink-0 लगाने से यह कभी भी 30% से 1 पिक्सेल भी छोटा नहीं होगा */}
  <div className="w-[30%] shrink-0">
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
        <div className="hidden lg:block">
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