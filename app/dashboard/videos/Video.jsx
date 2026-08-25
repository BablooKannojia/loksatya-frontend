'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";
import { 
  IoMdArrowDropdown, 
  IoMdArrowDropup, 
  IoMdCloudUpload, 
  IoMdRefresh, 
  IoMdSearch, 
  IoMdTrash, 
  IoMdCreate, 
  IoMdVideocam 
} from "react-icons/io";

const Video = () => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const [photo, setPhoto] = useState("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const [filterItem, setFilterItem] = useState("id");
  const [filterItemResponse, setFilterItemResponse] = useState("");

  const [allPhotos, setAllPhoto] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState({}); // while deleting
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  // State for edit functionality
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  // Toast notification helper
  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const showEditModal = (video) => {
    setEditingVideo(video);
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingVideo(null);
  };

  // Custom vdo upload dropdown
  const [dropdownUp, setDropdownUp] = useState(false);

  const handleDropdown = () => {
    setDropdownUp(!dropdownUp);
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`${API_URL}/video/${editingVideo._id}`, {
        title: editingVideo.title,
        link: editingVideo.link,
      });

      if (response.status === 200) {
        showToast("Video updated successfully");
        setIsEditModalOpen(false);
        fetchAllPhotos(); // Refresh the video list
        setIsVerifyModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating video:", error);
      showToast("Failed to update video", "error");
    }
  };

  const onFilter = () => {
    axios
      .get(`${API_URL}/video?${filterItem}=${filterItemResponse}`)
      .then((poll) => {
        setAllPhoto(poll.data);
      })
      .catch((err) => {
        console.log(err);
        showToast("Error in Filtering", "error");
      });
  };

  const onReset = () => {
    setFilterItem("id");
    setFilterItemResponse("");
    fetchAllPhotos();
  };

  useEffect(() => {
    fetchAllPhotos();
  }, []);

  const showVerifyModal = () => {
    setIsVerifyModalOpen(true);
  };

  const handleVerifyCancel = () => {
    setIsVerifyModalOpen(false);
  };

  useEffect(() => {
    if (img) {
      const objectURL = URL.createObjectURL(img);
      const videoSource = document.getElementById("video-element");
      if (videoSource) {
        videoSource.src = objectURL;
        videoSource.load();
      }
    }
  }, [img]);

  const onUpload = async () => {
    try {
      setLoading(true);
      let imageResponse = "";

      if (img) {
        let formData = new FormData();
        formData.append("file", img, img.name);
        imageResponse = await axios.post(`${API_URL}/image`, formData);
      }

      await axios.post(`${API_URL}/video`, {
        title,
        image: img ? imageResponse.data.image : "",
        link: link,
        reportedBy: "user",
      });

      showToast("Your Video was successfully uploaded");
      setIsVerifyModalOpen(false);
      fetchAllPhotos();
      setTitle("");
      setLoading(false);
      setImg(null);
      setLink("");

      const videoEl = document.getElementById("video-element");
      if (videoEl) videoEl.src = "";
    } catch (error) {
      showToast("Your Video was not successfully uploaded", "error");
      setTitle("");
      setLoading(false);
      setImg(null);
      setIsVerifyModalOpen(false);
    }
  };

  async function fetchAllPhotos() {
    try {
      const response = await fetch(`${API_URL}/video`);
      const data = await response.json();
      setAllPhoto(data);
    } catch (error) {
      console.error("Error fetching video:", error);
      showToast("Failed to fetch video. Please try again.", "error");
    }
  }

  const ShowDeleteModal = (photo) => {
    setCurrentPhoto(photo);
    setIsModalDeleteOpen(true);
  };

  const OnDelete = () => {
    axios
      .delete(`${API_URL}/video?id=${currentPhoto._id}`)
      .then(() => {
        showToast("Video has been successfully deleted");
        setCurrentPhoto({});
        setIsModalDeleteOpen(false);
        setIsVerifyModalOpen(false);
        fetchAllPhotos();
      })
      .catch((err) => {
        console.log(err);
        showToast("Video was not deleted", "error");
        setCurrentPhoto({});
        setIsModalDeleteOpen(false);
      });
  };

  const handleDeleteCancel = () => {
    setIsModalDeleteOpen(false);
    setCurrentPhoto({});
  };

  const placeHolderString = () => {
    if (filterItem === "id") return "Search by ID...";
    if (filterItem === "title") return "Search by Title...";
    return "";
  };

  const handleToggleStatus = (videoID, currentStatus) => {
    const newStatus = !currentStatus;

    axios
      .put(`${API_URL}/video/${videoID}`, { status: newStatus })
      .then(() => {
        showToast("Status Changed");
        fetchAllPhotos();
      })
      .catch((error) => {
        console.error("Error updating status", error);
        showToast("Failed to update status", "error");
      });
  };

  const renderVideoIframe = (linkUrl) => {
    const extractVideoId = (url) => {
      const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([^"&?/\s]{11})/;
      const match = url?.match(regex);
      return match ? match[1] : null;
    };

    const isEmbedLink = (url) => url?.includes("youtube.com/embed/");
    const isLiveLink = (url) => url?.includes("youtube.com/live/");

    let embedLink = linkUrl;

    if (!isEmbedLink(linkUrl)) {
      const videoId = extractVideoId(linkUrl);
      if (videoId) {
        if (isLiveLink(linkUrl)) {
          embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else {
          embedLink = `https://www.youtube.com/embed/${videoId}`;
        }
      }
    }

    const unavailableThumbnail =
      "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/breaking-news-broadcast-youtube-thumbnail-design-template-d06ddc9f11789b47d62564e6e22a7730_screen.jpg?ts=1652194145";

    return embedLink ? (
      <div className="relative w-[180px] h-[95px] bg-slate-950 rounded-lg overflow-hidden border border-slate-700/60 shadow-inner group">
        <iframe
          className="w-full h-full"
          title="Youtube player"
          src={embedLink}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = "block";
            }
          }}
        ></iframe>
        <img
          src={unavailableThumbnail}
          alt="Live stream unavailable"
          className="hidden w-[180px] h-[95px] object-cover"
        />
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center w-[180px] h-[95px] bg-slate-900/50 rounded-lg border border-dashed border-slate-700 text-center p-2">
        <IoMdVideocam className="text-slate-600 text-xl mb-1" />
        <span className="text-[11px] text-slate-500 font-medium">No valid video link</span>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Toast Notification */}
      {message.text && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-white font-medium shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-2 border ${
            message.type === "error"
              ? "bg-rose-600/90 border-rose-500"
              : "bg-emerald-600/90 border-emerald-500"
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}

      {/* Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 w-full z-50 bg-blue-600 text-white text-xs font-semibold py-1 text-center animate-pulse tracking-wider uppercase">
          Processing request, please wait...
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
              <IoMdVideocam size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Video Management
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage YouTube embeds, custom uploads, and stream visibility status.
              </p>
            </div>
          </div>
          <button
            onClick={fetchAllPhotos}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <IoMdRefresh className="text-lg" /> Refresh Data
          </button>
        </div>

        {/* Creation / Upload Card */}
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            Add New Content
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Custom Video Option Dropdown Section */}
            <div className="lg:col-span-5 flex flex-col">
              <button
                onClick={handleDropdown}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-sm font-medium flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <IoMdCloudUpload className="text-blue-400 text-lg" />
                  Custom Video Upload
                </span>
                {dropdownUp ? (
                  <IoMdArrowDropup className="text-xl text-slate-400" />
                ) : (
                  <IoMdArrowDropdown className="text-xl text-slate-400" />
                )}
              </button>

              {dropdownUp && (
                <div className="mt-3">
                  <input
                    type="file"
                    name="file"
                    id="file-name"
                    accept="video/*"
                    onChange={(e) => setImg(e.target.files[0])}
                    className="hidden"
                  />
                  <div
                    onClick={() => document.getElementById("file-name").click()}
                    className="w-full h-[140px] bg-slate-950/80 border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-xl cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-all group"
                  >
                    {img == null ? (
                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <IoMdCloudUpload className="text-3xl text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                          Click to select a video file
                        </span>
                      </div>
                    ) : (
                      <video
                        id="video-element"
                        src=""
                        className="w-full h-full rounded-lg object-cover"
                        controls
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Title, Link & Action */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                    placeholder="Enter video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    URL / Link
                  </label>
                  <input
                    type="text"
                    className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={showVerifyModal}
                  className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
                >
                  Preview & Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <select
                value={filterItem}
                onChange={(e) => setFilterItem(e.target.value)}
                className="h-10 px-3 pr-8 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="id">Filter by ID</option>
                <option value="title">Filter by Title</option>
              </select>
              <IoMdArrowDropdown className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={filterItemResponse}
                onChange={(e) => setFilterItemResponse(e.target.value)}
                placeholder={placeHolderString()}
                className="w-full h-10 pl-9 pr-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <IoMdSearch className="absolute left-3 top-3 text-slate-500 text-base" />
            </div>

            <button
              onClick={onFilter}
              className="h-10 px-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-blue-600/10"
            >
              Filter
            </button>
          </div>

          <button
            onClick={onReset}
            className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700/60 transition-all"
          >
            Reset Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden shadow-2xl rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 font-semibold text-slate-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Uploaded File</th>
                  <th className="px-6 py-4">Stream / Link</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allPhotos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-sm">
                      No videos found. Upload one or adjust your filters.
                    </td>
                  </tr>
                ) : (
                  allPhotos.map((photo, index) => (
                    <tr key={photo._id || index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block max-w-[80px] truncate">
                          {photo._id}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-medium text-slate-200 line-clamp-2">
                          {photo.title || <span className="text-slate-600 italic">Untitled</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {photo.image ? (
                          <video
                            className="w-[110px] h-[65px] object-cover rounded-lg border border-slate-800 bg-slate-950"
                            src={photo.image}
                            controls
                          />
                        ) : (
                          <span className="text-slate-600 text-xs italic">No file attached</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{renderVideoIframe(photo.link)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border ${
                              photo.status
                                ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/60"
                                : "bg-rose-950/70 text-rose-400 border-rose-800/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                photo.status ? "bg-emerald-400" : "bg-rose-400"
                              }`}
                            ></span>
                            {photo.status ? "ONLINE" : "OFFLINE"}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(photo._id, photo.status)}
                            className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
                          >
                            Toggle Status
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => showEditModal(photo)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit Video"
                          >
                            <IoMdCreate className="text-lg" />
                          </button>
                          <button
                            onClick={() => ShowDeleteModal(photo)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                            title="Delete Video"
                          >
                            <IoMdTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Verify / Preview Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-white mb-4">Confirm Video Upload</h2>
            <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Headline / Title
                </span>
                <p className="text-slate-200 text-sm font-medium">
                  {title || <span className="text-slate-500 italic">No headline provided</span>}
                </p>
              </div>
              {link && (
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Link
                  </span>
                  <p className="text-blue-400 text-xs truncate">{link}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleVerifyCancel}
                className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onUpload}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-white mb-4">Edit Video Details</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={editingVideo?.title || ""}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, title: e.target.value })
                  }
                  placeholder="Video title"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Link
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={editingVideo?.link || ""}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, link: e.target.value })
                  }
                  placeholder="Video link"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <IoMdTrash className="text-2xl" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Delete Video</h2>
            <p className="text-slate-400 text-xs mb-6">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 text-sm hover:bg-slate-800 transition-colors flex-1"
              >
                Cancel
              </button>
              <button
                onClick={OnDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-all flex-1 shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;