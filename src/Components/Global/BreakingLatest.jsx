"use client";

import { FaGreaterThan } from "react-icons/fa";
import NewsCard from "../../Components/MainPage/NewsCard";

const HomeHeroSection = ({
  latestNews = [],
  breakingNews = [],
  currentPoll = null,
  pollOptions = [],
  selectedOption = null,
  isLoading = { polls: false },
  submitVote,
  navigation,
  t
}) => {

  const getArticleSlug = (data) => {
    if (data?.slug) return data.slug;
    return data?.title?.replace(/[/\%.?]/g, "").split(" ").join("-") || "news";
  };

  return (
    <div className="w-full px-4 lg:px-0 py-4 bg-white">
      {/* 🚀 Main Horizontal Row (Grid with 3 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: Latest News (लेटेस्ट न्यूज़ - 50% विड्थ / span 6) */}
        <div id="LatestNews" className="lg:col-span-6 flex flex-col justify-between w-full h-full">
          <div>
            {/* Header */}
            <div className="border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
              <div 
                className="text-[18px] font-extrabold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-[#D90429] transition-colors"
                onClick={() => navigation(`/itempage2?newsType=upload`)}
              >
                <span className="h-5 w-1 bg-[#D90429] rounded-full inline-block"></span>
                {t("ln") || "ताजा खबरें"}
              </div>
            </div>

            {/* 2-Column Grid inside the main col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestNews.slice(0, 6).map((data) => {
                const titleSlug = getArticleSlug(data);
                if (!titleSlug) return null;

                return (
                  <div key={data?._id} className="w-full">
                    <NewsCard 
                      data={data} 
                      onPress={() => navigation(`/details/${titleSlug}?id=${data._id}`)} 
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Read More (Fixed at the bottom & aligned to the Right End) */}
          <div
            className="flex items-center text-xs font-bold text-[#D90429] hover:underline cursor-pointer mt-5 pt-2 self-end select-none"
            onClick={() => navigation(`/itempage2?newsType=upload`)}
          >
            <span>{"और भी देखें"}</span>
            <FaGreaterThan className="ml-1 text-[8px]" />
          </div>
        </div>

        {/* COLUMN 2: Breaking News (ब्रेकिंग न्यूज़ - 25% विड्थ / span 3) */}
        <div id="BigNews" className="lg:col-span-3 flex flex-col justify-between w-full h-full">
          <div className="w-full">
            {/* Header */}
            <div className="border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
              <div
                className="text-[18px] font-extrabold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-[#D90429] transition-colors"
                onClick={() => navigation(`/itempage2?newsType=breakingNews`)}
              >
                <span className="h-5 w-1 bg-[#D90429] rounded-full inline-block"></span>
                {t("bn") || "बड़ी खबरें"}
              </div>
            </div>

            {/* Stack Cards vertically */}
            <div className="flex flex-col gap-4">
              {breakingNews && breakingNews.length > 2 ? (
                breakingNews.slice(3, 6).map((data) => {
                  const titleSlug = getArticleSlug(data);
                  if (!titleSlug) return null;

                  return (
                    <div key={data?._id} className="w-full">
                      <NewsCard 
                        data={data} 
                        onPress={() => navigation(`/details/${titleSlug}?id=${data._id}`)} 
                      />
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400 text-xs py-10 border border-dashed border-gray-200 text-center rounded-xl">
                  कोई बड़ी खबर नहीं है
                </div>
              )}
            </div>
          </div>

          {/* Read More (Fixed at the bottom & aligned to the Right End) */}
          <div
            className="flex items-center text-xs font-bold text-[#D90429] hover:underline hover:text-[#D90429] cursor-pointer mt-5 pt-2 self-end select-none"
            onClick={() => navigation(`/itempage2?newsType=breakingNews`)}
          >
            <span>{"और भी"}</span> 
            <FaGreaterThan className="ml-1 text-[8px]" />
          </div>
        </div>

        {/* COLUMN 3: Opinion Poll (ओपिनियन पोल - 25% विड्थ / span 3) */}
        <div className="lg:col-span-3 w-full h-full flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 pb-2 mb-4">
            <div className="text-[18px] font-extrabold text-gray-900 flex items-center gap-2">
              <span className="h-5 w-1 bg-blue-600 rounded-full inline-block"></span>
              {"ओपिनियन पोल"}
            </div>
          </div>

          {/* Poll Card Widget */}
          <div className="w-full bg-slate-50 border border-gray-150 rounded-2xl p-4 shadow-sm flex-1 flex flex-col justify-between min-h-[440px] lg:min-h-0">
            {isLoading?.polls ? (
              <div className="flex flex-col items-center justify-center py-12 w-full gap-2 my-auto">
                <div className="w-7 h-7 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-[11px] text-gray-500 font-medium">लोड हो रहा है...</span>
              </div>
            ) : currentPoll ? (
              <div className="flex flex-col h-full justify-between gap-4 flex-1">
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">LIVE POLL</span>
                  </div>
                  
                  <div className="font-bold text-[14px] text-gray-900 text-start leading-snug mb-4">
                    {currentPoll?.question}
                  </div>

                  <div className="flex flex-col gap-2">
                    {pollOptions.map((option, index) => (
                      <label
                        key={option._id || index}
                        className={`relative overflow-hidden flex items-center rounded-xl border p-3 min-h-[42px] transition-all bg-white ${
                          selectedOption === null 
                            ? "border-gray-200 hover:border-blue-400 hover:bg-blue-50/10 cursor-pointer" 
                            : "border-gray-200 cursor-default"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`poll-${currentPoll._id}`}
                          value={index}
                          checked={selectedOption === index}
                          disabled={selectedOption !== null}
                          onChange={() => submitVote(currentPoll._id, index)}
                          className="mr-2.5 w-3.5 h-3.5 accent-blue-600 z-10 shrink-0"
                        />
                        
                        <div className="text-[13px] font-semibold flex justify-between items-center w-full z-10 text-gray-800">
                          <span className="truncate pr-1">{option.optionText}</span>
                          {selectedOption !== null && (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                              {option.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {selectedOption !== null && (
                          <div
                            className="absolute left-0 top-0 h-full bg-blue-600/10 transition-[width] duration-500 ease-out"
                            style={{ width: `${option.percentage}%` }}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {selectedOption !== null && (
                  <div className="text-center text-green-700 font-bold text-xs bg-green-50/80 py-2 rounded-xl border border-green-100 mt-auto">
                    आपकी प्रतिक्रिया के लिए धन्यवाद!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-400 text-xs font-medium my-auto">
                कोई सक्रिय पोल उपलब्ध नहीं है
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeHeroSection;