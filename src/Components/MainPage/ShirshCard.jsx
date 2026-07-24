import React from "react";
import OptimizedImg from "../OptimizedImage";

const defaultImg = "/assets/img-1.png";

const ShirshCard = ({ text, image, OnPress, id, wid = "w-[40%]", date }) => {
  return (
    <div
      onClick={OnPress}
      id={id}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          OnPress?.();
      }}
      className="group flex gap-2 w-full h-[100px] cursor-pointer border-b border-gray-100 pb-1 last:border-0 last:pb-0 transition-all duration-200"
    >
      {/* 1. इमेज कंटेनर (ज़ूम इफ़ेक्ट के साथ) */}
      <div className={`${wid} h-full shrink-0 relative overflow-hidden rounded-md bg-gray-100`}>
        <OptimizedImg
          src={image || defaultImg}
          alt={text || "News image"}
          sizes="120px"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* 2. टेक्स्ट और मेटा डेटा कंटेनर */}
      <div className="flex flex-col justify-between flex-1 py-0.5">
        {/* न्यूज़ हेडिंग (अधिकतम 3 लाइनों में ट्रंकेट, होवर पर रेड कलर ट्रांज़िशन) */}
        <h3 className="text-[14px] leading-[1.35] font-bold text-gray-900 group-hover:text-[#D90429] transition-colors duration-200 line-clamp-3">
          {text || '"India Have Better...": Sri Lanka Captain Honest World Cup Admission'}
        </h3>
        
        {/* तारीख / समय */}
        {date && (
          <span className="text-[11px] font-semibold text-gray-400 mt-1 select-none">
            {date}
          </span>
        )}
      </div>
    </div>
  );
};

export default ShirshCard;