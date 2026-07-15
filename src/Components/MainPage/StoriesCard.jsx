import React from "react";
const img = "/assets/img-1.png";
import OptimizedImg from "../OptimizedImage";

const StoriesCard = ({ text, image, OnPress, id, wid, date }) => {
  return (
    <>
      <div
        onClick={OnPress}
        className="stories-card mobileMainPageStroyCard  flex w-full"
        id={id}
        style={{ cursor: "pointer" }}
      >
        <div className={`${wid}`}>
          <OptimizedImg
            src={image || img}
            alt={text || "Story image"}
            className="w-full h-[100px] object-fill"
          />
        </div>
        <div className=" flex flex-col  w-[55%] h-full">
          <span
            className={`
           ${
             date ? "stories-card-text" : "shirsh-card-text-4-line pl-[10px]"
           } w-full`}
          >
            {text ||
              '"India Have Better...": Sri Lanka Captain Honest World Cup Admission'}
          </span>
          <span className="text-red-600 pl-[10px]">{date ? date : ""}</span>
        </div>
      </div>
    </>
  );
};

export default StoriesCard;
