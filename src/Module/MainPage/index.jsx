"use client";

import { useEffect, useRef, useState, lazy, memo, Suspense, useCallback } from "react";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { FaGreaterThan } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  IoCameraSharp,
  IoChevronBack,
  IoChevronForward,
  IoPlayCircle,
} from "react-icons/io5";
import { API_URL } from "../../API";
import { useRouter } from "next/navigation";
import VdoThumb from "../../Components/common/VdoThumb";
import TopStories from "../../Components/Global/TopStories"
import FlashNews from "../../Components/Global/FlashNews"
import PhotoGallery from "../../Components/Global/PhotoGallery"
import VisualStories from "../../Components/Global/VisualStories"

const AdCardPopup = lazy(() => import("../../Components/DetailsPage/AdCardPopup"));
const AllSectionArticle = lazy(() => import("../../Components/MainPage/SectionArticle"));
const ImageCard = lazy(() => import("../../Components/MainPage/ImageCard"));
const BigNewsCard = lazy(() => import("../../Components/MainPage/BigNewsCard"));
const AdCard = lazy(() => import("../../Components/Global/AdCard"));
const StoriesCard = lazy(() => import("../../Components/MainPage/StoriesCard"));
const NewsCard = lazy(() => import("../../Components/MainPage/NewsCard"));

/* Lightweight loading placeholder — Tailwind only, no animation library */
const SimpleLoading = ({ className = "h-[200px]" }) => (
  <div className={`w-full ${className} bg-gray-100 rounded-lg`} />
);

const MainPage = () => {
  const [sliderItem, setSliderItem] = useState(0);
  const [sliderItem2, setSliderItem2] = useState(1);
  const [flashnews, setflashnews] = useState([]);
  const [video, setVideo] = useState([]);
  const [photo, setPhoto] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [breakingNews, setbreakingNews] = useState([]);
  const [sliderArticles, setSliderArticles] = useState([]);
  const [combinedNews, setCombinedNews] = useState([]);
  const { t } = useTranslation();
  const [topStories, settopStories] = useState([]);
  const router = useRouter();
  const navigation = router.push;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [allCategoriesData, setAllCategoriesData] = useState(null);
  const [priorityArticles, setPriorityArticles] = useState([]);
  const breakingNewsRef = useRef(null);
  const photosRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [fixedArticles, setFixedArticles] = useState({ first: null, second: null });
  const [fixedArticlesmobile, setFixedArticlesMobile] = useState([]);
  const [isLoading, setIsLoading] = useState({
    flashNews: true,
    slider: true,
    breakingNews: true,
    topStories: true,
    latestNews: true,
    videos: true,
    photos: true,
    stories: true,
    polls: true,
    categories: true,
    ads: true,
    critical: true,
  });

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

      setTimeout(() => loadSecondaryData(), 100);
    } catch (error) {
      console.error("Error fetching critical data:", error);
      setTimeout(() => loadSecondaryData(), 100);
    }
  };

  const loadSecondaryData = async () => {
    try {
      const secondaryRequests = [
        axios.get(
          `${API_URL}/article?pagenation=true&limit=10&type=img&newsType=topStories&status=online&priority=true`
        ),
        axios.get(
          `${API_URL}/article?pagenation=true&limit=14&type=img&newsType=upload&status=online&priority=true`
        ),
        axios.get(`${API_URL}/story`),
        axios.get(`${API_URL}/video`),
        axios.get(`${API_URL}/photo`),
        axios.get(`${API_URL}/polls`),
        axios.get(`${API_URL}/content?type=category`),
      ];

      const [topStoriesRes, latestRes, storiesRes, videosRes, photosRes, pollsRes, categoriesRes] =
        await Promise.all(secondaryRequests);

      settopStories(topStoriesRes.data);
      setLatestNews(latestRes.data);
      setVideo(videosRes.data.filter((v) => v.status === true));
      setPhoto(
        photosRes.data
          .filter((p) => p.status === true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
      setCurrentPoll(pollsRes.data?.length > 0 ? pollsRes.data.slice(-1)[0] : null);

      ["topStories", "latestNews", "stories", "videos", "photos", "polls"].forEach((key) => {
        updateLoadingState(key, false);
      });

      setTimeout(() => loadCategoriesData(categoriesRes.data), 500);
    } catch (error) {
      console.error("Error fetching secondary data:", error);
    }
  };

  const loadCategoriesData = async (categories) => {
    try {
      const sortedCategories = [...categories].sort((a, b) => {
        const seqA = a.sequence !== undefined ? a.sequence : Number.MAX_VALUE;
        const seqB = b.sequence !== undefined ? b.sequence : Number.MAX_VALUE;
        return seqA - seqB;
      });

      const categoryNames = sortedCategories.map((category) => category.text);

      const categoryData = await Promise.all(
        categoryNames.map(async (category) => {
          try {
            const response = await axios.get(
              `${API_URL}/article?pagenation=true&limit=7&category=${category}&type=img&priority=true&status=online`
            );
            return response.data.length > 0 ? { category, imgData: response.data } : null;
          } catch (error) {
            console.error(`Error fetching category ${category}:`, error);
            return null;
          }
        })
      );

      setAllCategoriesData(categoryData.filter(Boolean));
      updateLoadingState("categories", false);
    } catch (error) {
      console.error("Error loading categories:", error);
      updateLoadingState("categories", false);
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
  const [photoScroll, setPhotoScroll] = useState({ left: false, right: true });

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

  useEffect(() => {
    const container = photosRef.current;
    if (!container) return;

    const handleScroll = () => {
      setPhotoScroll({
        left: container.scrollLeft > 0,
        right: container.scrollLeft < container.scrollWidth - container.clientWidth,
      });
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? flashnews?.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === flashnews?.length - 1 ? 0 : prevIndex + 1));
  };

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

  const [adPopup, setAdPopup] = useState(false);

  useEffect(() => {
    setAdPopup(true);
  }, []);

  return (
    <div className="relative">
      <div>
        {adPopup && (
          <Suspense fallback={null}>
            <div className="absolute">
              <AdCardPopup type={"top"} adPopup={adPopup} setAdPopup={setAdPopup} />
            </div>
          </Suspense>
        )}
      </div>

      <div className="w-full">
        <div className="block lg:hidden">
          {video?.map((item, index) => {
            let title = item.title.replace(/[/\%.?]/g, "").split(" ").join("-");
            if (item.slug) title = item.slug;
            if (index >= 1) return null;

            return (
              <div
                key={item._id}
                onClick={() => navigation(`/videos2/${title}?id=${item?._id}`)}
                className="relative w-full h-[220px] cursor-pointer"
              >
                <IoPlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 text-white text-5xl" />
                <video className="w-full h-full object-cover" src={item.image} />
              </div>
            );
          })}

          <div className="w-full">
            <div className="w-full">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    {flashnews?.length > 0 && (
                      <a href={flashnews[currentIndex]?.link} className="no-underline text-black">
                        {flashnews[currentIndex]?.slugName?.substring(0, 45)}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <IoMdArrowDropleft size={25} onClick={handlePrevClick} className="cursor-pointer" />
                    <IoMdArrowDropright size={25} onClick={handleNextClick} className="cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          <div>
            <div className="flex items-center justify-center my-2 mt-4">
              <div className="w-full">
                <AdCard type={"mid"} />
              </div>
            </div>
          </div>

          <div className="flex gap-7 w-full">
            <div className="w-[70%]">
              <div className="flex w-full">
                <div className="relative w-1/2">
                  {isLoading.breakingNews ? (
                    <SimpleLoading className="h-full" />
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
                  {isLoading.breakingNews ? (
                    <SimpleLoading className="h-full" />
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

              <div className="flex w-full mt-[5%]">
                <div className="w-1/2">
                  {isLoading.slider ? (
                    <SimpleLoading className="h-full" />
                  ) : (
                    <ImageCard
                      height="100%"
                      width="100%"
                      img={sliderArticles?.[0]?.image}
                      text={sliderArticles?.[0]?.title}
                      title={sliderArticles?.[0]?.title?.replace(/[/\%.?]/g, "").split(" ").join("-")}
                      id={sliderArticles?.[0]?._id}
                    />
                  )}
                </div>
                <div className="w-1/2 ml-[10px]">
                  {isLoading.slider ? (
                    <SimpleLoading className="h-full" />
                  ) : (
                    <ImageCard
                      img={sliderArticles?.[1]?.image}
                      text={sliderArticles?.[1]?.title}
                      title={sliderArticles?.[1]?.title?.replace(/[/\%.?]/g, "").split(" ").join("-")}
                      id={sliderArticles?.[1]?._id}
                      height="100%"
                      width="100%"
                    />
                  )}
                </div>
              </div>

              <div
                className="flex items-center cursor-pointer mt-2"
                onClick={() => navigation(`/itempage2?newsType=topStories`)}
              >
                {"और भी"} <FaGreaterThan className="ml-[6px]" />
              </div>
            </div>

            <div id="TopStories" className="w-[30%]">
              <div className="w-full">
                <div className="flex w-full pr-4 justify-between items-center">
                  <div className="w-[40%]">{t("ts")}</div>
                  <span className="bg-red-600 h-0.5 w-[60%]"> </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {isLoading.topStories
                  ? null
                  : topStories
                      ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                      .map((data, index) => {
                        let title = data.title.replace(/[/\%.?]/g, "").split(" ").join("-");
                        if (data.slug) title = data.slug;

                        if (title && index < 5) {
                          return (
                            <div key={data._id} className="w-full">
                              <StoriesCard
                                data={data}
                                OnPress={() => navigation(`/details/${title}?id=${data?._id}`)}
                                image={data?.image}
                                wid="w-[45%]"
                                text={data?.title}
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
              </div>
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
              <AllSectionArticle data={allCategoriesData} priorityArticles={priorityArticles} />
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

        <div className="hidden lg:flex w-full">
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
              <div className="w-full">
                <AdCard type={"mid"} />
              </div>

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
        </div>

        <div className="bg-blue-600 p-4 lg:px-10 h-fit">
          <h1 id="Videos" className="text-xl font-semibold text-white">
            Videos
          </h1>
          <div className="flex">
            <div className="flex flex-col gap-3">
              {video.slice(0, 2).map((vdo) => (
                <VdoThumb key={vdo._id} data={vdo} />
              ))}
            </div>
            <div className="w-px bg-white"></div>
            <div className="flex justify-center items-center flex-1">
              <VdoThumb height={true} data={video[2]} />
            </div>
            <div className="w-px bg-white"></div>
            <div className="flex flex-col gap-3">
              {video.slice(3, 5).map((vdo) => (
                <VdoThumb key={vdo._id} data={vdo} />
              ))}
            </div>
          </div>
          <div
            className="flex items-center cursor-pointer -mt-4 sm:mt-[25px] text-white"
            onClick={() => navigation("/itempage2?newsType=videos")}
          >
            {"और भी"} <FaGreaterThan className="ml-[6px]" />
          </div>
        </div>

        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <AllSectionArticle data={allCategoriesData} priorityArticles={priorityArticles} />
          </Suspense>
        </div>

        <VisualStories />

        <PhotoGallery />
      </div>
    </div>
  );
};

export default MainPage;