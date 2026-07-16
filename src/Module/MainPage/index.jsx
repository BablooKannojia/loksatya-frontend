"use client";

import { useEffect, useRef, useState, lazy, memo, Suspense, useCallback } from "react";
import { FaGreaterThan } from "react-icons/fa6";
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
import { useCommonData } from "../../Context/CommonContext";
import AllSectionArticle from "../../components/MainPage/SectionArticle";
import { useHomeData } from "@/src/Context/HomeContext";

const ImageCard = lazy(() => import("../../components/MainPage/ImageCard"));
const BigNewsCard = lazy(() => import("../../Components/MainPage/BigNewsCard"));
const NewsCard = lazy(() => import("../../Components/MainPage/NewsCard"));

const SimpleLoading = ({ className = "h-[200px]" }) => (
  <div className={`w-full ${className} bg-gray-100 rounded-lg`} />
);

const MainPage = () => {
  const [sliderItem, setSliderItem] = useState(0);
  const [sliderItem2, setSliderItem2] = useState(1);
  const [flashnews, setflashnews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [breakingNews, setbreakingNews] = useState([]);
  const [sliderArticles, setSliderArticles] = useState([]);
  const [combinedNews, setCombinedNews] = useState([]);
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = router.push;
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const breakingNewsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [fixedArticles, setFixedArticles] = useState({ first: null, second: null });
  const [fixedArticlesmobile, setFixedArticlesMobile] = useState([]);
  const [isLoading, setIsLoading] = useState({
    flashNews: true,
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
  const { homeData, loading, error } = useHomeData();

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
    if (currentPoll && currentPoll.options) {
      const totalVotes = currentPoll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
      const optionsWithPercentages = currentPoll.options.map((option) => ({
        ...option,
        percentage: totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0,
      }));
      setPollOptions(optionsWithPercentages);
    }
  }, [currentPoll]);

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
        axios.get(`${API_URL}/flashnews`),
        axios.get(`${API_URL}/article?fixedPosition=1&status=online`),
        axios.get(`${API_URL}/article?fixedPosition=2&status=online`),
        axios.get(`${API_URL}/article?pagenation=true&limit=8&type=img&status=online&slider=true`),
        axios.get(
          `${API_URL}/article?pagenation=true&limit=12&type=img&newsType=breakingNews&status=online&priority=true`
        ),
      ];

      const [flashNewsRes, fixed1Res, fixed2Res, sliderRes, breakingRes] = await Promise.all(
        criticalRequests
      );

      setflashnews(flashNewsRes.data.data.filter((item) => item.status === "active"));

      const fixed1 = fixed1Res.data[0] || null;
      const fixed2 = fixed2Res.data[0] || null;

      setFixedArticles({ first: fixed1, second: fixed2 });
      setFixedArticlesMobile([fixed1, fixed2].filter(Boolean));

      setSliderArticles(sliderRes.data.filter((article) => article.status === "online"));
      setbreakingNews(breakingRes.data);

      updateLoadingState("critical", false);
      updateLoadingState("flashNews", false);
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

        <div className="hidden lg:flex w-full gap-6">
          <div className="w-[70%]">
            <div className="flex w-full">
              <div className="w-1/2">
                {fixedArticles.first ? (
                  <ImageCard
                    height="100%"
                    width="100%"
                    img={fixedArticles.first.image}
                    text={fixedArticles.first.title}
                    title={fixedArticles.first.title.replace(/[/\%.?]/g, "").split(" ").join("-")}
                    slug={fixedArticles.first.slug}
                    id={fixedArticles.first._id}
                  />
                ) : (
                  <ImageCard
                    height="100%"
                    width="100%"
                    img={breakingNews?.[0]?.image}
                    text={breakingNews?.[0]?.title}
                    title={breakingNews?.[0]?.title?.replace(/[/\%.?]/g, "").split(" ").join("-")}
                    slug={breakingNews?.[0]?.slug}
                    id={breakingNews?.[0]?._id}
                  />
                )}
              </div>
              <div className="w-1/2 ml-[10px]">
                {fixedArticles.second ? (
                  <ImageCard
                    height="100%"
                    width="100%"
                    img={fixedArticles.second.image}
                    text={fixedArticles.second.title}
                    title={fixedArticles.second.title.replace(/[/\%.?]/g, "").split(" ").join("-")}
                    slug={fixedArticles.second.slug}
                    id={fixedArticles.second._id}
                  />
                ) : (
                  <ImageCard
                    img={breakingNews?.[1]?.image}
                    text={breakingNews?.[1]?.title}
                    title={breakingNews?.[1]?.title?.replace(/[/\%.?]/g, "").split(" ").join("-")}
                    slug={breakingNews?.[1]?.slug}
                    id={breakingNews?.[1]?._id}
                    height="100%"
                    width="100%"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-between mt-[3%] mb-[10px] gap-[10px]">
              <div className="w-1/2">
                {sliderArticles?.filter((_, i) => i % 2 === 0)[Math.floor(sliderItem / 2)] && (
                  <ImageCard
                    img={sliderArticles.filter((_, i) => i % 2 === 0)[Math.floor(sliderItem / 2)]?.image}
                    text={sliderArticles.filter((_, i) => i % 2 === 0)[Math.floor(sliderItem / 2)]?.title}
                    slug={sliderArticles.filter((_, i) => i % 2 === 0)[Math.floor(sliderItem / 2)]?.slug}
                    title={sliderArticles.filter((_, i) => i % 2 === 0)[Math.floor(sliderItem / 2)]?.title}
                    id={sliderArticles.filter((_, i) => i % 2 === 0)[Math.floor(sliderItem / 2)]?._id}
                    height="50vh"
                    width="100%"
                  />
                )}
                <div className="flex justify-center gap-2 mt-2">
                  {sliderArticles
                    .map((_, i) => i)
                    .filter((i) => i % 2 === 0)
                    .map((item) => (
                      <div
                        key={item}
                        className={`w-2 h-2 rounded-full cursor-pointer ${
                          sliderItem === item ? "bg-red-600" : "bg-gray-300"
                        }`}
                        onClick={() => setSliderItem(item)}
                      ></div>
                    ))}
                </div>
              </div>

              <div className="w-1/2">
                {sliderArticles?.filter((_, i) => i % 2 !== 0)[Math.floor(sliderItem2 / 2)] && (
                  <ImageCard
                    img={sliderArticles.filter((_, i) => i % 2 !== 0)[Math.floor(sliderItem2 / 2)]?.image}
                    text={sliderArticles.filter((_, i) => i % 2 !== 0)[Math.floor(sliderItem2 / 2)]?.title}
                    slug={sliderArticles.filter((_, i) => i % 2 !== 0)[Math.floor(sliderItem2 / 2)]?.slug}
                    title={sliderArticles.filter((_, i) => i % 2 !== 0)[Math.floor(sliderItem2 / 2)]?.title}
                    id={sliderArticles.filter((_, i) => i % 2 !== 0)[Math.floor(sliderItem2 / 2)]?._id}
                    height="50vh"
                    width="100%"
                  />
                )}
                <div className="flex justify-center gap-2 mt-2">
                  {sliderArticles
                    .map((_, i) => i)
                    .filter((i) => i % 2 !== 0)
                    .map((item) => (
                      <div
                        key={item}
                        className={`w-2 h-2 rounded-full cursor-pointer ${
                          sliderItem2 === item ? "bg-red-600" : "bg-gray-300"
                        }`}
                        onClick={() => setSliderItem2(item)}
                      ></div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <TopStories />
        </div>

        {/* <div className="hidden lg:flex w-full">
          <div id="LatestNews" className="flex flex-col pt-3 p-6 w-2/3">
            <div className="text-xl font-semibold cursor-pointer" onClick={() => navigation(`/itempage2?newsType=upload`)}>
              {t("ln")}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              {latestNews.slice(0, 6).map((data) => {
                let title = data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-");
                if (data.slug) title = data.slug;
                if (!title) return null;

                return (
                  <div key={data?._id} className="w-full">
                    <NewsCard data={data} onPress={() => navigation(`/details/${title}?id=${data._id}`)} />
                  </div>
                );
              })}
            </div>
            <div
              className="flex items-center cursor-pointer mt-3 mr-[40px]"
              onClick={() => navigation(`/itempage2?newsType=upload`)}
            >
              {"और भी"} <FaGreaterThan className="ml-[6px]" />
            </div>
          </div>

          <div className="w-1/3">
            <div id="BigNews" className="p-4">
              <div
                className="text-xl font-semibold cursor-pointer"
                onClick={() => navigation(`/itempage2?newsType=breakingNews`)}
              >
                {t("bn")}
              </div>
              <div className="flex flex-col gap-3 mt-2">
                {breakingNews &&
                  breakingNews.length > 2 &&
                  breakingNews.slice(2, 5).map((data) => {
                    let title = data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-");
                    if (data.slug) title = data.slug;
                    if (!title) return null;

                    return (
                      <div key={data?._id}>
                        <NewsCard data={data} onPress={() => navigation(`/details/${title}?id=${data._id}`)} />
                      </div>
                    );
                  })}
              </div>
              <div
                className="flex items-center cursor-pointer mt-3"
                onClick={() => navigation(`/itempage2?newsType=breakingNews`)}
              >
                {"और भी"} <FaGreaterThan className="ml-[6px]" />
              </div>
            </div>

            <div className="px-4">
            
              <div className="w-full bg-white mt-[10px] rounded-[10px] p-[10px] pb-[50px]">
                {isLoading.polls ? (
                  <SimpleLoading className="h-[120px]" />
                ) : currentPoll ? (
                  <>
                    <div className="font-semibold text-lg text-start mb-5">{currentPoll?.question}</div>
                    <div className="flex flex-wrap gap-3">
                      {pollOptions.map((option, index) => (
                        <label
                          key={option._id || index}
                          className={`relative overflow-hidden flex items-center rounded-[10px] border border-gray-300 pl-[10px] min-h-[40px] capitalize w-[calc(50%-6px)] ${
                            selectedOption === null ? "cursor-pointer" : "cursor-default"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`poll-${currentPoll._id}`}
                            value={index}
                            checked={selectedOption === index}
                            disabled={selectedOption !== null}
                            onChange={() => submitVote(currentPoll._id, index)}
                            className="mr-2 z-10"
                          />
                          <div className="text-[15px] font-semibold flex justify-between items-center w-full z-10">
                            <span>{option.optionText}</span>
                            {selectedOption !== null && (
                              <span className="text-xs text-gray-500">{option.percentage.toFixed(1)}%</span>
                            )}
                          </div>

                          {selectedOption !== null && (
                            <div
                              className="absolute left-0 top-0 h-full bg-blue-500/10 transition-[width] duration-300 ease-in-out"
                              style={{ width: `${option.percentage}%` }}
                            />
                          )}
                        </label>
                      ))}
                    </div>

                    {selectedOption !== null && (
                      <div className="mt-5 text-center text-gray-500 text-sm">Thank you for voting!</div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-5 text-gray-500">No active polls available</div>
                )}
              </div>
            </div>
          </div>
        </div> */}
        <div className="flex flex-col gap-8 md:gap-12 w-full px-2 sm:px-4">
          <HomeHeroSection
            latestNews={homeData?.latestNews || []}
            breakingNews={homeData?.breakingNews || []}
            currentPoll={homeData?.poll || null} // अगर पोल API में है, वरना ये डमी या स्टेट से आएगा
            pollOptions={homeData?.poll?.options || []}
            selectedOption={null}
            isLoading={{ polls: false }}
            submitVote={dummySubmitVote}
            navigation={(path) => router.push(path)}
            t={(key) => (key === "ln" ? "ताज़ा खबरें" : "बड़ी खबरें")} // ट्रांसलेशन हेल्पर
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