"use client";

import { BsPlayCircle } from "react-icons/bs";
import { IoPlayCircle } from "react-icons/io5";
import { useRouter } from "next/navigation";

const img1 = "/assets/img-1.png";

// isMain = videoGalleryCenter
// fromVideoGallery = false means from articles section

const VideoCard = ({ isMain, color, height, width, data, fromVideoGallery }) => {
  const router = useRouter();

  let title = data?.title?.replace(/[%.?]/g, "").split(" ").join("-");

  const renderTextBox = () => {
    if (isMain) {
      return (
        <div
          className={`video-center-card-text absolute bottom-0 w-full ${color || ""}`}
        >
          {!data &&
            `Watch - "Pagal Hai Kya": Rohit's Chat With Gill Has Internet Talking`}
          {data && `Watch - ${data.title.substring(0, 70)}... `}
        </div>
      );
    }
    return (
      <div className={`video-card-text ${color || ""}`}>
        Watch - {data ? data.title : `Rohit's Chat With Gill Has Internet Talking`}
      </div>
    );
  };

  const renderMedia = () => {
    if (!data) {
      return <img src={img1} style={{ height, width }} alt="" className="video-card-img" />;
    }

    // Direct uploaded video file (bugfix: this branch now actually plays data.image/data.url)
    if (data.url || data.image) {
      return (
        <video
          className={!isMain ? "video-card-img" : "video-card-img video-card-img-center"}
          src={data.url || data.image}
          controls
          playsInline
        />
      );
    }

    // YouTube / external embed link
    return (
      <iframe
        className="video video-card-img"
        title="Youtube player"
        sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-presentation"
        src={data?.link}
      ></iframe>
    );
  };

  return (
    <div
      className={
        !isMain
          ? "video-card-main-box relative overflow-hidden"
          : "video-card-main-box video-card-main-center-box relative overflow-hidden"
      }
      onClick={() => {
        if (!fromVideoGallery) {
          router.push(`/videos/${title}?id=${data?._id}`);
        } else {
          router.push(`/videos2/${title}?id=${data?._id}`);
        }
      }}
    >
      <div className={!isMain ? "video-card" : "video-card video-card-center"}>
        {renderMedia()}

        {!data && (
          <div className="video-card-length">
            <BsPlayCircle className="mr-[3px]" />
          </div>
        )}

        {isMain && (
          <IoPlayCircle className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] text-red-600 bg-transparent" />
        )}
      </div>
      {renderTextBox()}
    </div>
  );
};

export default VideoCard;